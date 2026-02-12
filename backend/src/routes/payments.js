const express = require('express');
const PaymentCard = require('../models/PaymentCard');
const Invoice = require('../models/Invoice');
const { protect, authorize } = require('../middleware/authMiddleware');
const { sendNotification, templates } = require('../services/notificationService');
const crypto = require('crypto');

const router = express.Router();

function detectCardBrand(number) {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|5)/.test(n)) return 'discover';
  return 'unknown';
}

function isValidCardNumber(number) {
  const n = number.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(n)) return false;
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = parseInt(n[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function isValidExpiry(month, year) {
  const now = new Date();
  const expDate = new Date(year, month, 0);
  return expDate > now;
}

router.get('/cards', protect, async (req, res) => {
  try {
    const cards = await PaymentCard.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/cards', protect, async (req, res) => {
  try {
    const { cardNumber, cardholderName, expiryMonth, expiryYear, cvv, setDefault } = req.body;

    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({ success: false, message: 'All card fields are required' });
    }

    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (!isValidCardNumber(cleanNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid card number' });
    }

    if (!isValidExpiry(expiryMonth, expiryYear)) {
      return res.status(400).json({ success: false, message: 'Card has expired' });
    }

    const cvvClean = cvv.toString().replace(/\s/g, '');
    if (!/^\d{3,4}$/.test(cvvClean)) {
      return res.status(400).json({ success: false, message: 'Invalid CVV' });
    }

    const brand = detectCardBrand(cleanNumber);
    const lastFour = cleanNumber.slice(-4);

    const existing = await PaymentCard.findOne({ userId: req.user.id, lastFour, brand });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This card is already saved' });
    }

    const paymentToken = `tok_${crypto.randomBytes(16).toString('hex')}`;

    if (setDefault) {
      await PaymentCard.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const cardCount = await PaymentCard.countDocuments({ userId: req.user.id });

    const card = await PaymentCard.create({
      userId: req.user.id,
      cardholderName: cardholderName.trim(),
      lastFour,
      brand,
      expiryMonth,
      expiryYear,
      isDefault: setDefault || cardCount === 0,
      paymentToken,
    });

    res.status(201).json({ success: true, data: card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/cards/:id/default', protect, async (req, res) => {
  try {
    const card = await PaymentCard.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    if (card.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await PaymentCard.updateMany({ userId: req.user.id }, { isDefault: false });
    card.isDefault = true;
    await card.save();

    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/cards/:id', protect, async (req, res) => {
  try {
    const card = await PaymentCard.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    if (card.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const wasDefault = card.isDefault;
    await card.deleteOne();

    if (wasDefault) {
      const next = await PaymentCard.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    res.status(200).json({ success: true, message: 'Card removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/pay/:invoiceId', protect, async (req, res) => {
  try {
    const { cardId } = req.body;

    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    if (invoice.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already paid' });
    }
    if (invoice.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot pay a cancelled invoice' });
    }

    const card = await PaymentCard.findById(cardId);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Payment card not found' });
    }
    if (card.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to use this card' });
    }
    if (card.isExpired) {
      return res.status(400).json({ success: false, message: 'Card has expired. Please use a different card.' });
    }

    const transactionId = `txn_${crypto.randomBytes(12).toString('hex')}`;

    invoice.status = 'paid';
    invoice.paymentMethod = 'card';
    invoice.paidAt = new Date();
    await invoice.save();

    try {
      const tmpl = templates.paymentReceived(invoice);
      await sendNotification({
        recipientId: invoice.customerId,
        type: 'both',
        ...tmpl,
        relatedInvoice: invoice._id,
      });
    } catch (notifErr) {
      console.error('Notification failed:', notifErr);
    }

    const updated = await Invoice.findById(invoice._id)
      .populate('customerId', 'name email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingDate timeSlot status serviceId',
        populate: { path: 'serviceId', select: 'name price' },
      });

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: {
        invoice: updated,
        transaction: {
          id: transactionId,
          amount: invoice.totalAmount,
          cardLast4: card.lastFour,
          cardBrand: card.brand,
          timestamp: new Date(),
        },
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

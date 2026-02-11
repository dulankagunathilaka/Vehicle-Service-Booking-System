const express = require('express');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/authMiddleware');
const { sendNotification, templates } = require('../services/notificationService');

const router = express.Router();

// Generate invoice from a booking (admin)
router.post('/generate', protect, authorize('admin'), async (req, res) => {
  try {
    const { bookingId, items, discount, taxRate, notes, dueDate } = req.body;

    const booking = await Booking.findById(bookingId).populate('serviceId').populate('customerId', 'name email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if invoice already exists
    const existing = await Invoice.findOne({ bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Invoice already exists for this booking' });
    }

    // Build items list
    const invoiceItems = items && items.length > 0 ? items : [
      {
        description: booking.serviceId.name,
        quantity: 1,
        unitPrice: booking.totalPrice,
        total: booking.totalPrice,
      },
    ];

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const tax = taxRate !== undefined ? taxRate : 0.1;
    const taxAmount = Math.round(subtotal * tax * 100) / 100;
    const discountAmount = discount || 0;
    const totalAmount = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;

    const invoice = await Invoice.create({
      bookingId,
      customerId: booking.customerId._id,
      items: invoiceItems,
      subtotal,
      taxRate: tax,
      taxAmount,
      discount: discountAmount,
      totalAmount,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes,
      status: 'draft',
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'bookingDate timeSlot status');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all invoices (admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'bookingDate timeSlot status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Billing stats (admin) — must be before /:id to avoid route conflict
router.get('/stats/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const pendingInvoices = await Invoice.countDocuments({ status: { $in: ['draft', 'sent'] } });
    const overdueInvoices = await Invoice.countDocuments({ status: 'overdue' });

    const revenueResult = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const outstandingResult = await Invoice.aggregate([
      { $match: { status: { $in: ['sent', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const outstanding = outstandingResult.length > 0 ? outstandingResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: { totalInvoices, paidInvoices, pendingInvoices, overdueInvoices, totalRevenue, outstanding },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my invoices (customer)
router.get('/my-invoices', protect, authorize('customer'), async (req, res) => {
  try {
    const invoices = await Invoice.find({ customerId: req.user.id })
      .populate({
        path: 'bookingId',
        select: 'bookingDate timeSlot status serviceId',
        populate: { path: 'serviceId', select: 'name price' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single invoice
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'bookingDate timeSlot status');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    if (req.user.role === 'customer' && invoice.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update invoice status (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, paymentMethod, notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (status) invoice.status = status;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (notes !== undefined) invoice.notes = notes;

    if (status === 'paid') {
      invoice.paidAt = new Date();
    }

    // Send notification on status change
    if (status === 'sent') {
      const tmpl = templates.invoiceSent(invoice);
      await sendNotification({
        recipientId: invoice.customerId,
        type: 'both',
        ...tmpl,
        relatedInvoice: invoice._id,
        relatedBooking: invoice.bookingId,
      });
    }
    if (status === 'paid') {
      const tmpl = templates.paymentReceived(invoice);
      await sendNotification({
        recipientId: invoice.customerId,
        type: 'both',
        ...tmpl,
        relatedInvoice: invoice._id,
      });
    }

    await invoice.save();

    const updated = await Invoice.findById(invoice._id)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'bookingDate timeSlot status');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Pay invoice (customer)
router.put('/:id/pay', protect, authorize('customer'), async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    if (!paymentMethod || !['card', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Please select a payment method (card or cash)' });
    }

    const invoice = await Invoice.findById(req.params.id);
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

    invoice.status = 'paid';
    invoice.paymentMethod = paymentMethod;
    invoice.paidAt = new Date();
    await invoice.save();

    // Send payment confirmation notification
    const tmpl = templates.paymentReceived(invoice);
    await sendNotification({
      recipientId: invoice.customerId,
      type: 'both',
      ...tmpl,
      relatedInvoice: invoice._id,
    });

    const updated = await Invoice.findById(invoice._id)
      .populate('customerId', 'name email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingDate timeSlot status serviceId',
        populate: { path: 'serviceId', select: 'name price' }
      });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete invoice (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    await invoice.deleteOne();
    res.status(200).json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const { protect, authorize } = require('../middleware/authMiddleware');
const { sendNotification, templates } = require('../services/notificationService');

const router = express.Router();

// Create booking (customers only)
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { serviceId, vehicleInfo, bookingDate, timeSlot, notes, totalPrice } = req.body;

    const booking = await Booking.create({
      customerId: req.user.id,
      serviceId,
      vehicleInfo,
      bookingDate,
      timeSlot,
      notes,
      totalPrice,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: booking,
    });

    // Send booking confirmation notification
    try {
      const tmpl = templates.bookingConfirmation(booking, req.body.serviceName || 'Vehicle Service');
      await sendNotification({
        recipientId: req.user.id,
        type: 'both',
        ...tmpl,
        relatedBooking: booking._id,
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr.message);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get my bookings (customers)
router.get('/my-bookings', protect, authorize('customer'), async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('serviceId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all bookings (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name price duration')
      .sort({ bookingDate: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('customerId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && booking.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update booking status (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, note, priority, assignedTech } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (status && status !== booking.status) {
      booking.status = status;
      booking.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status changed to ${status}`,
      });

      // Send status update notification
      try {
        const tmpl = templates.bookingUpdate(booking, status);
        await sendNotification({
          recipientId: booking.customerId,
          type: 'both',
          ...tmpl,
          relatedBooking: booking._id,
        });
      } catch (notifErr) {
        console.error('Notification error:', notifErr.message);
      }

      // Auto-generate invoice when service is completed
      if (status === 'completed') {
        try {
          const existingInvoice = await Invoice.findOne({ bookingId: booking._id });
          if (!existingInvoice) {
            const populatedBooking = await Booking.findById(booking._id).populate('serviceId');
            const serviceName = populatedBooking.serviceId?.name || 'Vehicle Service';
            const servicePrice = populatedBooking.totalPrice || populatedBooking.serviceId?.price || 0;

            const invoiceItems = [
              {
                description: serviceName,
                quantity: 1,
                unitPrice: servicePrice,
                total: servicePrice,
              },
            ];

            const subtotal = servicePrice;
            const taxRate = 0.1;
            const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
            const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

            const invoice = await Invoice.create({
              bookingId: booking._id,
              customerId: booking.customerId,
              items: invoiceItems,
              subtotal,
              taxRate,
              taxAmount,
              discount: 0,
              totalAmount,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              status: 'sent',
            });

            // Notify customer about the invoice
            try {
              const invTmpl = templates.invoiceSent(invoice);
              await sendNotification({
                recipientId: booking.customerId,
                type: 'both',
                ...invTmpl,
                relatedInvoice: invoice._id,
                relatedBooking: booking._id,
              });
            } catch (invNotifErr) {
              console.error('Invoice notification error:', invNotifErr.message);
            }

            console.log(`Auto-generated invoice ${invoice.invoiceNumber} for booking ${booking._id}`);
          }
        } catch (invoiceErr) {
          console.error('Auto invoice generation error:', invoiceErr.message);
        }
      }
    }
    if (priority) booking.priority = priority;
    if (assignedTech !== undefined) booking.assignedTech = assignedTech;

    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cancel booking (customer or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

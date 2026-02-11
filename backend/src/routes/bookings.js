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

// Customer dashboard stats
router.get('/dashboard-stats', protect, authorize('customer'), async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ customerId: userId })
      .populate('serviceId')
      .sort({ createdAt: -1 });

    const invoices = await Invoice.find({ customerId: userId })
      .populate({
        path: 'bookingId',
        select: 'bookingDate timeSlot status serviceId vehicleInfo',
        populate: { path: 'serviceId', select: 'name price' },
      })
      .sort({ createdAt: -1 });

    const now = new Date();

    // Basic counts
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status));
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

    // Upcoming bookings (future date, not cancelled)
    const upcomingBookings = bookings
      .filter(b => new Date(b.bookingDate) >= now && !['cancelled', 'completed'].includes(b.status))
      .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

    // Recent completed (last 5)
    const recentCompleted = completedBookings.slice(0, 5);

    // Spending
    const totalSpent = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const pendingPayments = invoices
      .filter(inv => ['draft', 'sent', 'overdue'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Monthly spending (last 6 months)
    const monthlySpending = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthTotal = invoices
        .filter(inv => inv.status === 'paid' && new Date(inv.paidAt || inv.createdAt) >= monthStart && new Date(inv.paidAt || inv.createdAt) <= monthEnd)
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      monthlySpending.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        year: monthStart.getFullYear(),
        amount: Math.round(monthTotal * 100) / 100,
      });
    }

    // Vehicle garage — unique vehicles from bookings
    const vehicleMap = new Map();
    bookings.forEach(b => {
      if (b.vehicleInfo && b.vehicleInfo.licensePlate) {
        const key = b.vehicleInfo.licensePlate;
        if (!vehicleMap.has(key)) {
          vehicleMap.set(key, {
            ...b.vehicleInfo.toObject ? b.vehicleInfo.toObject() : b.vehicleInfo,
            totalServices: 0,
            lastServiceDate: null,
            lastServiceName: null,
          });
        }
        const v = vehicleMap.get(key);
        v.totalServices++;
        if (!v.lastServiceDate || new Date(b.bookingDate) > new Date(v.lastServiceDate)) {
          v.lastServiceDate = b.bookingDate;
          v.lastServiceName = b.serviceId?.name || 'Service';
        }
      }
    });
    const vehicles = Array.from(vehicleMap.values());

    // Service frequency (most booked services)
    const serviceFreq = {};
    bookings.forEach(b => {
      if (b.serviceId) {
        const name = b.serviceId.name;
        if (!serviceFreq[name]) serviceFreq[name] = { name, count: 0, category: b.serviceId.category };
        serviceFreq[name].count++;
      }
    });
    const topServices = Object.values(serviceFreq).sort((a, b) => b.count - a.count).slice(0, 5);

    // Next suggested service date (3 months after last completed)
    let nextServiceSuggestion = null;
    if (recentCompleted.length > 0) {
      const lastDate = new Date(recentCompleted[0].bookingDate);
      const suggested = new Date(lastDate);
      suggested.setMonth(suggested.getMonth() + 3);
      if (suggested > now) {
        nextServiceSuggestion = suggested;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        activeCount: activeBookings.length,
        completedCount: completedBookings.length,
        cancelledCount: cancelledBookings.length,
        allBookings: bookings,
        upcomingBookings: upcomingBookings.slice(0, 5),
        recentCompleted,
        totalSpent: Math.round(totalSpent * 100) / 100,
        pendingPayments: Math.round(pendingPayments * 100) / 100,
        monthlySpending,
        vehicles,
        topServices,
        nextServiceSuggestion,
        invoices: invoices.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
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

const express = require('express');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/authMiddleware');
const { sendNotification } = require('../services/notificationService');

const router = express.Router();

router.get('/my-notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .populate('relatedBooking', 'bookingDate timeSlot status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipientId: req.user.id, isRead: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    if (notification.recipientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('recipientId', 'name email phone')
      .populate('relatedBooking', 'bookingDate status')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/send', protect, authorize('admin'), async (req, res) => {
  try {
    const { recipientId, type, subject, message } = req.body;

    if (!recipientId || !subject || !message) {
      return res.status(400).json({ success: false, message: 'recipientId, subject, and message are required' });
    }

    const notification = await sendNotification({
      recipientId,
      type: type || 'both',
      category: 'general',
      subject,
      message,
    });

    const populated = await Notification.findById(notification._id)
      .populate('recipientId', 'name email phone');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/broadcast', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, subject, message } = req.body;
    const User = require('../models/User');
    const customers = await User.find({ role: 'customer', isActive: true });

    const results = [];
    for (const customer of customers) {
      try {
        const n = await sendNotification({
          recipientId: customer._id,
          type: type || 'both',
          category: 'general',
          subject,
          message,
        });
        results.push({ customerId: customer._id, name: customer.name, success: true });
      } catch (err) {
        results.push({ customerId: customer._id, name: customer.name, success: false, error: err.message });
      }
    }

    res.status(201).json({ success: true, sent: results.filter((r) => r.success).length, total: customers.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const total = await Notification.countDocuments();
    const byCategory = await Notification.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const byType = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const emailSent = await Notification.countDocuments({ 'channel.email.sent': true });
    const smsSent = await Notification.countDocuments({ 'channel.sms.sent': true });

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7);
    const daily = await Notification.aggregate([
      { $match: { createdAt: { $gte: dateFrom } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: { total, emailSent, smsSent, byCategory, byType, daily },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    await notification.deleteOne();
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/admin-mark-all-read', protect, authorize('admin'), async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/admin-read', protect, authorize('admin'), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

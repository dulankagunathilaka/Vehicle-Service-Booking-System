const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require admin
router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const inProgressBookings = await Booking.countDocuments({ status: 'in-progress' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isAvailable: true });

    // Revenue from completed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['completed', 'confirmed', 'in-progress'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent bookings (last 5)
    const recentBookings = await Booking.find()
      .populate('customerId', 'name email')
      .populate('serviceId', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        inProgressBookings,
        completedBookings,
        cancelledBookings,
        totalCustomers,
        totalServices,
        activeServices,
        totalRevenue,
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all customers
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get booking counts per customer
    const customerIds = customers.map((c) => c._id);
    const bookingCounts = await Booking.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      { $group: { _id: '$customerId', count: { $sum: 1 }, totalSpent: { $sum: '$totalPrice' } } },
    ]);

    const countMap = {};
    bookingCounts.forEach((b) => {
      countMap[b._id.toString()] = { count: b.count, totalSpent: b.totalSpent };
    });

    const customersWithStats = customers.map((c) => ({
      ...c.toObject(),
      bookingCount: countMap[c._id.toString()]?.count || 0,
      totalSpent: countMap[c._id.toString()]?.totalSpent || 0,
    }));

    res.status(200).json({
      success: true,
      count: customersWithStats.length,
      data: customersWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle customer active status
router.put('/customers/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: { id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all services (including unavailable)
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analytics: booking trends (last 7 days)
router.get('/analytics/trends', async (req, res) => {
  try {
    const days = 7;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const dailyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: dateFrom } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const found = dailyBookings.find((b) => b._id === key);
      result.push({
        date: key,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: found?.count || 0,
        revenue: found?.revenue || 0,
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analytics: top services
router.get('/analytics/top-services', async (req, res) => {
  try {
    const top = await Booking.aggregate([
      { $group: { _id: '$serviceId', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          serviceName: '$service.name',
          count: 1,
          revenue: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, data: top });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analytics: revenue by category
router.get('/analytics/revenue-by-category', async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$service.category',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Activity log: recent status changes
router.get('/activity', async (req, res) => {
  try {
    const bookings = await Booking.find({ 'statusHistory.0': { $exists: true } })
      .populate('customerId', 'name')
      .populate('serviceId', 'name')
      .sort({ updatedAt: -1 })
      .limit(15);

    const activities = [];
    bookings.forEach((b) => {
      b.statusHistory.forEach((h) => {
        activities.push({
          bookingId: b._id,
          customerName: b.customerId?.name || 'Unknown',
          serviceName: b.serviceId?.name || 'Unknown',
          status: h.status,
          note: h.note,
          timestamp: h.timestamp,
        });
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({ success: true, data: activities.slice(0, 20) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all reviews (admin)
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'name email')
      .populate('serviceId', 'name')
      .populate('bookingId', 'bookingDate')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a review (admin)
router.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get review stats (admin)
router.get('/reviews/stats', async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const ratingDistribution = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avg * 10) / 10 : 0,
        ratingDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

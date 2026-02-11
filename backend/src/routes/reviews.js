const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a review (customers only)
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { bookingId, serviceId, rating, title, comment } = req.body;

    // If linked to a booking, verify the booking belongs to the customer and is completed
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      if (booking.customerId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
      }
      if (booking.status !== 'completed') {
        return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
      }

      // Check if already reviewed
      const existing = await Review.findOne({ customerId: req.user.id, bookingId });
      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
      }
    }

    const review = await Review.create({
      customerId: req.user.id,
      bookingId: bookingId || null,
      serviceId: serviceId || null,
      rating,
      title,
      comment,
    });

    const populated = await Review.findById(review._id)
      .populate('customerId', 'name email')
      .populate('serviceId', 'name')
      .populate('bookingId', 'bookingDate status');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get my reviews (customer)
router.get('/my-reviews', protect, authorize('customer'), async (req, res) => {
  try {
    const reviews = await Review.find({ customerId: req.user.id })
      .populate('serviceId', 'name')
      .populate('bookingId', 'bookingDate status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete own review (customer)
router.delete('/:id', protect, authorize('customer'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Please provide a review title'],
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// One review per booking
reviewSchema.index({ customerId: 1, bookingId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);

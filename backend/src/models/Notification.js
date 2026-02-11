const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'both'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'booking-confirmation',
        'booking-update',
        'booking-reminder',
        'booking-cancelled',
        'invoice-sent',
        'payment-received',
        'service-complete',
        'general',
      ],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    channel: {
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
    },
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    relatedInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

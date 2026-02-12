const mongoose = require('mongoose');

const paymentCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardholderName: {
      type: String,
      required: [true, 'Cardholder name is required'],
      trim: true,
    },
    lastFour: {
      type: String,
      required: true,
      match: [/^\d{4}$/, 'Must be exactly 4 digits'],
    },
    brand: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover', 'unknown'],
      default: 'unknown',
    },
    expiryMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    expiryYear: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    paymentToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

paymentCardSchema.index({ userId: 1 });

paymentCardSchema.virtual('isExpired').get(function () {
  const now = new Date();
  const expDate = new Date(this.expiryYear, this.expiryMonth, 0);
  return now > expDate;
});

paymentCardSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('PaymentCard', paymentCardSchema);

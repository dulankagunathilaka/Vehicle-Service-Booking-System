const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 0.1, // 10%
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank-transfer', 'online', ''],
      default: '',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAt: Date,
    notes: String,
  },
  { timestamps: true }
);

// Auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    const num = (count + 1).toString().padStart(5, '0');
    this.invoiceNumber = `INV-${num}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);

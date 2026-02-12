const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['parts', 'fluids', 'filters', 'tires', 'batteries', 'tools', 'accessories', 'other'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minQuantity: {
      type: Number,
      default: 5,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplier: {
      name: String,
      contact: String,
    },
    location: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageHistory: [
      {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        quantityUsed: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
    restockHistory: [
      {
        quantity: { type: Number, required: true },
        costPerUnit: Number,
        date: { type: Date, default: Date.now },
        supplier: String,
        note: String,
      },
    ],
  },
  { timestamps: true }
);

inventoryItemSchema.pre('save', async function (next) {
  if (!this.sku) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const count = await mongoose.model('InventoryItem').countDocuments();
    this.sku = `${prefix}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);

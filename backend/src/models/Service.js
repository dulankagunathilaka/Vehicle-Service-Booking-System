const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a service description'],
    },
    category: {
      type: String,
      enum: ['maintenance', 'repair', 'inspection', 'customization'],
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a service price'],
      min: 0,
    },
    duration: {
      type: Number,
      required: [true, 'Please provide service duration in minutes'],
      min: 15,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);

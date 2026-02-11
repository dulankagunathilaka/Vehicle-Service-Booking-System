const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All inventory routes require admin
router.use(protect, authorize('admin'));

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create inventory item
router.post('/', async (req, res) => {
  try {
    const { name, category, description, quantity, minQuantity, unitPrice, costPrice, supplier, location } = req.body;

    const item = await InventoryItem.create({
      name,
      category,
      description,
      quantity,
      minQuantity,
      unitPrice,
      costPrice,
      supplier,
      location,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const fields = ['name', 'category', 'description', 'quantity', 'minQuantity', 'unitPrice', 'costPrice', 'supplier', 'location', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    await item.save();
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Restock item
router.post('/:id/restock', async (req, res) => {
  try {
    const { quantity, costPerUnit, supplier, note } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.quantity += quantity;
    item.restockHistory.push({ quantity, costPerUnit, supplier, note, date: new Date() });
    if (costPerUnit) item.costPrice = costPerUnit;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Use item (deduct from inventory)
router.post('/:id/use', async (req, res) => {
  try {
    const { quantityUsed, bookingId, note } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    if (item.quantity < quantityUsed) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    item.quantity -= quantityUsed;
    item.usageHistory.push({ bookingId, quantityUsed, note, date: new Date() });
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Inventory stats
router.get('/stats/summary', async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments();
    const activeItems = await InventoryItem.countDocuments({ isActive: true });
    const lowStock = await InventoryItem.find({ $expr: { $lte: ['$quantity', '$minQuantity'] }, isActive: true });
    const outOfStock = await InventoryItem.countDocuments({ quantity: 0, isActive: true });

    const valueResult = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }, totalCost: { $sum: { $multiply: ['$quantity', '$costPrice'] } } } },
    ]);

    const byCategory = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        activeItems,
        lowStockCount: lowStock.length,
        lowStockItems: lowStock.map((i) => ({ _id: i._id, name: i.name, sku: i.sku, quantity: i.quantity, minQuantity: i.minQuantity })),
        outOfStock,
        totalValue: valueResult.length > 0 ? valueResult[0].totalValue : 0,
        totalCost: valueResult.length > 0 ? valueResult[0].totalCost : 0,
        byCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

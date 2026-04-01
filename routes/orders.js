const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOrderConfirmation, sendNewOrderNotification } = require('../services/email');

const router = express.Router();

// 產生訂單編號
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CHIC${year}${month}${day}${random}`;
}

// 建立訂單（需要認證）
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount, shippingInfo, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: '購物車是空的' });
    }

    const order = new Order({
      orderNumber: generateOrderNumber(),
      userId: req.userId,
      items,
      totalAmount,
      shippingInfo,
      paymentMethod: paymentMethod || 'credit_card'
    });

    await order.save();
    
    // 取得會員 email
    const user = await User.findById(req.userId);
    
    // 發送 Email（非同步，不影響回應速度）
    if (user && user.email) {
      sendOrderConfirmation(order, user.email).catch(err => console.error('發送顧客確認信失敗:', err));
      sendNewOrderNotification(order).catch(err => console.error('發送管理員通知失敗:', err));
    }
    
    res.status(201).json({
      message: '訂單建立成功',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: '建立訂單失敗' });
  }
});

// 取得會員自己的訂單列表（需要認證）
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.json({
      total: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: '取得訂單失敗' });
  }
});

// 取得會員單一訂單詳情（需要認證）
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!order) {
      return res.status(404).json({ message: '找不到此訂單' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: '取得訂單失敗' });
  }
});

// ===== 以下是管理員端 =====

// 取得所有訂單（需要認證）
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email');
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: '取得訂單失敗' });
  }
});

// 更新訂單狀態（需要認證）
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, notes, updatedAt: new Date() },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: '找不到此訂單' });
    }
    
    res.json({
      message: '訂單狀態已更新',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: '更新訂單失敗' });
  }
});

// 刪除訂單（需要認證）
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: '找不到此訂單' });
    }
    
    res.json({ message: '訂單已刪除' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: '刪除訂單失敗' });
  }
});

module.exports = router;

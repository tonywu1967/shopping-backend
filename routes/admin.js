const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// 取得所有會員列表（需要認證）
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      total: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '-',
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: '取得會員列表失敗' });
  }
});

// 取得單一會員資料（需要認證）
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '找不到此會員' });
    }
    res.json(user);
  } catch (error) {
    console.error('Admin user detail error:', error);
    res.status(500).json({ message: '取得會員資料失敗' });
  }
});

// 刪除會員（需要認證）
router.delete('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '找不到此會員' });
    }
    res.json({ message: '會員已刪除' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: '刪除會員失敗' });
  }
});

module.exports = router;

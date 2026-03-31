const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// 會員註冊
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // 檢查是否已有此 email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '此 email 已經註冊過了' });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 建立新用戶
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phone
    });

    await user.save();

    res.status(201).json({ message: '註冊成功！' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '註冊失敗，請稍後再試' });
  }
});

// 會員登入
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 找用戶
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'email 或 密碼錯誤' });
    }

    // 檢查密碼
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'email 或 密碼錯誤' });
    }

    // 產生 JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登入失敗，請稍後再試' });
  }
});

// 取得會員資料
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: '找不到會員資料' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: '取得資料失敗' });
  }
});

// 更新會員資料
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: '更新資料失敗' });
  }
});

module.exports = router;

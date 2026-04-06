const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/email');

const router = express.Router();

// 產生驗證 token
function generateVerifyToken() {
  return crypto.randomBytes(32).toString('hex');
}

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

    // 產生驗證 token
    const verifyToken = generateVerifyToken();
    const verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小時

    // 建立新用戶
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      emailVerifyToken: verifyToken,
      emailVerifyTokenExpires: verifyTokenExpires
    });

    await user.save();

    // 發送驗證 email
    sendVerificationEmail(user, verifyToken).catch(err => {
      console.error('發送驗證信失敗:', err);
    });

    res.status(201).json({ 
      message: '註冊成功！請前往 email 驗證您的帳戶。',
      email: email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '註冊失敗，請稍後再試' });
  }
});

// 驗證 email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: '驗證碼不能為空' });
    }

    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: '驗證碼無效或已過期' });
    }

    // 更新用戶狀態
    user.emailVerified = true;
    user.emailVerifyToken = null;
    user.emailVerifyTokenExpires = null;
    await user.save();

    res.json({ message: 'Email 驗證成功！現在可以登入了。' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: '驗證失敗，請稍後再試' });
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

    // 檢查 email 是否驗證（可選，开启可以要求验证）
    // if (!user.emailVerified) {
    //   return res.status(403).json({ message: '請先驗證您的 email' });
    // }

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
        name: user.name,
        emailVerified: user.emailVerified
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

// 重發驗證信
router.post('/resend-verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: '找不到會員資料' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email 已經驗證過了' });
    }

    // 產生新的驗證 token
    const verifyToken = generateVerifyToken();
    const verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerifyToken = verifyToken;
    user.emailVerifyTokenExpires = verifyTokenExpires;
    await user.save();

    // 重發驗證信
    await sendVerificationEmail(user, verifyToken);

    res.json({ message: '驗證信已重發，請檢查您的 email' });
  } catch (error) {
    console.error('Resend verify error:', error);
    res.status(500).json({ message: '重發驗證信失敗，請稍後再試' });
  }
});

module.exports = router;

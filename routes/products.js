const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// 取得所有商品（公開）
router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (active !== undefined) filter.active = active === 'true';
    else filter.active = true; // 預設只顯示上架商品

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({
      total: products.length,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        description: p.description,
        image: p.image,
        badge: p.badge,
        stock: p.stock,
        active: p.active,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: '取得商品失敗' });
  }
});

// 取得單一商品（公開）
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '找不到此商品' });
    }
    res.json({
      id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      description: product.description,
      image: product.image,
      badge: product.badge,
      stock: product.stock,
      active: product.active,
      createdAt: product.createdAt
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: '取得商品失敗' });
  }
});

// 新增商品（需要認證）
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, price, originalPrice, description, image, badge, stock } = req.body;

    const product = new Product({
      name,
      category,
      price,
      originalPrice,
      description,
      image,
      badge,
      stock
    });

    await product.save();
    res.status(201).json({
      message: '商品新增成功',
      product: {
        id: product._id,
        name: product.name
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: '新增商品失敗' });
  }
});

// 更新商品（需要認證）
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, price, originalPrice, description, image, badge, stock, active } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, price, originalPrice, description, image, badge, stock, active },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: '找不到此商品' });
    }

    res.json({
      message: '商品更新成功',
      product: {
        id: product._id,
        name: product.name
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: '更新商品失敗' });
  }
});

// 刪除商品（需要認證）
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '找不到此商品' });
    }
    res.json({ message: '商品已刪除' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: '刪除商品失敗' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['女裝', '男裝', '鞋履', '包款', '配件', '其他']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    enum: ['熱銷', '新品', '精選', '特價', '7折', null]
  },
  stock: {
    type: Number,
    default: 99,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: "義大利真皮手提包",
    category: "包款",
    price: 4280,
    originalPrice: 5600,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
    badge: "熱銷",
    stock: 50
  },
  {
    name: "極簡羊毛大衣",
    category: "女裝",
    price: 6800,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=500",
    badge: "新品",
    stock: 30
  },
  {
    name: "經典白皮鞋",
    category: "鞋履",
    price: 3280,
    originalPrice: 4200,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500",
    badge: null,
    stock: 80
  },
  {
    name: "紳士休閒西裝外套",
    category: "男裝",
    price: 5200,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
    badge: "精選",
    stock: 45
  },
  {
    name: "絲巾印花洋裝",
    category: "女裝",
    price: 3680,
    originalPrice: 4800,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500",
    badge: "7折",
    stock: 60
  },
  {
    name: "真皮腰包",
    category: "包款",
    price: 2680,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
    badge: null,
    stock: 70
  },
  {
    name: "針織高領毛衣",
    category: "男裝",
    price: 2280,
    originalPrice: 3000,
    image: "https://images.unsplash.com/photo-1638643391904-9b551ba91eaa?w=500",
    badge: "特價",
    stock: 90
  },
  {
    name: "粗跟短靴",
    category: "鞋履",
    price: 4580,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    badge: "新品",
    stock: 40
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已連線到 MongoDB');

    // 清除現有商品
    await Product.deleteMany({});
    console.log('🗑️ 已清除現有商品');

    // 新增商品
    await Product.insertMany(products);
    console.log('✅ 已新增 ' + products.length + ' 筆商品');

    await mongoose.disconnect();
    console.log('👋 已斷開連線');
    process.exit(0);
  } catch (error) {
    console.error('❌ 錯誤:', error);
    process.exit(1);
  }
}

seed();

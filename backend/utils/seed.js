const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Product.deleteMany({});

  // Admin
  await User.create({
    name: 'Admin',
    email: 'admin@store.com',
    password: 'admin123',
    role: 'admin',
  });

  // Customers
  await User.create([
    { name: 'Alice Johnson', email: 'alice@example.com', password: 'pass1234', role: 'customer', phone: '9876543210' },
    { name: 'Bob Smith', email: 'bob@example.com', password: 'pass1234', role: 'customer', phone: '9123456780' },
  ]);

  // Products
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports'];
  const products = [
    { name: 'Wireless Bluetooth Headphones', category: 'Electronics', price: 2999, discountPrice: 2499, stock: 50, sold: 120, description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.', brand: 'SoundMax', isFeatured: true, tags: ['audio', 'wireless', 'bluetooth'] },
    { name: 'Smart LED Desk Lamp', category: 'Electronics', price: 1499, discountPrice: 1199, stock: 35, sold: 80, description: 'Touch-sensitive smart LED lamp with adjustable color temperature and brightness. USB charging port included.', brand: 'LumiTech', isFeatured: true, tags: ['lamp', 'led', 'smart'] },
    { name: 'Mechanical Gaming Keyboard', category: 'Electronics', price: 4999, discountPrice: 3999, stock: 20, sold: 45, description: 'RGB mechanical keyboard with tactile blue switches, anti-ghosting, and durable aluminum frame.', brand: 'KeyForce', tags: ['gaming', 'keyboard', 'mechanical'] },
    { name: 'Classic Cotton T-Shirt', category: 'Clothing', price: 499, discountPrice: 0, stock: 200, sold: 350, description: 'Soft 100% premium cotton t-shirt. Available in multiple colors. Perfect for everyday wear.', brand: 'ComfyWear', isFeatured: true, tags: ['cotton', 'casual', 'unisex'] },
    { name: 'Running Shoes Pro', category: 'Sports', price: 3499, discountPrice: 2799, stock: 60, sold: 95, description: 'Lightweight running shoes with advanced cushioning system and breathable mesh upper.', brand: 'SpeedRun', isFeatured: true, tags: ['running', 'fitness', 'shoes'] },
    { name: 'Yoga Mat Premium', category: 'Sports', price: 999, discountPrice: 799, stock: 80, sold: 200, description: 'Extra thick non-slip yoga mat with alignment lines. Eco-friendly TPE material.', brand: 'ZenFit', tags: ['yoga', 'fitness', 'mat'] },
    { name: 'JavaScript: The Good Parts', category: 'Books', price: 699, discountPrice: 599, stock: 30, sold: 60, description: 'A classic guide to JavaScript programming best practices by Douglas Crockford.', brand: "O'Reilly", tags: ['javascript', 'programming', 'book'] },
    { name: 'Stainless Steel Water Bottle', category: 'Home & Kitchen', price: 799, discountPrice: 649, stock: 150, sold: 280, description: '1L double-wall insulated bottle. Keeps drinks cold 24hr or hot 12hr. BPA-free.', brand: 'HydroLife', tags: ['bottle', 'eco', 'kitchen'] },
    { name: 'Non-Stick Cookware Set', category: 'Home & Kitchen', price: 2499, discountPrice: 1999, stock: 25, sold: 55, description: '5-piece granite non-stick cookware set with induction-compatible base and heat-resistant handles.', brand: 'ChefPro', tags: ['cookware', 'kitchen', 'cooking'] },
    { name: 'Wireless Charging Pad', category: 'Electronics', price: 1299, discountPrice: 999, stock: 8, sold: 130, description: '15W fast wireless charger compatible with all Qi-enabled devices. Slim design with LED indicator.', brand: 'ChargeFast', tags: ['charger', 'wireless', 'mobile'] },
    { name: 'Linen Casual Shirt', category: 'Clothing', price: 1299, discountPrice: 999, stock: 120, sold: 75, description: 'Breathable linen blend casual shirt. Perfect for summer outings and office casual Fridays.', brand: 'StyleCo', tags: ['linen', 'shirt', 'casual'] },
    { name: 'Dumbbell Set 5-20kg', category: 'Sports', price: 5999, discountPrice: 4999, stock: 15, sold: 30, description: 'Adjustable rubber-coated dumbbell set with rack. Ideal for home gym workouts.', brand: 'IronCore', tags: ['dumbbell', 'gym', 'fitness'] },
  ];

  for (const p of products) {
    await Product.create({ ...p, slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(), images: [] });
  }

  console.log('✅ Seed complete!');
  console.log('Admin: admin@store.com / admin123');
  console.log('Customer: alice@example.com / pass1234');
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });

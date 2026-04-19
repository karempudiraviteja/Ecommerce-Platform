const Product = require('../models/Product');

// @desc Get all products (public, with filters)
exports.getProducts = async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12, featured } = req.query;
  const query = { isActive: true };

  if (search) query.$text = { $search: search };
  if (category) query.category = { $regex: category, $options: 'i' };
  if (minPrice || maxPrice) query.price = {};
  if (minPrice) query.price.$gte = Number(minPrice);
  if (maxPrice) query.price.$lte = Number(maxPrice);
  if (featured === 'true') query.isFeatured = true;

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { rating: -1 },
    popular: { sold: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: products,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
  });
};

// @desc Get single product
exports.getProduct = async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
    isActive: true,
  });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
};

// @desc Get categories
exports.getCategories = async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ success: true, data: categories });
};

// @desc Create product (admin)
exports.createProduct = async (req, res) => {
  const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
  const product = await Product.create({ ...req.body, images });
  res.status(201).json({ success: true, data: product });
};

// @desc Update product (admin)
exports.updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const newImages = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
  const keepImages = req.body.keepImages ? JSON.parse(req.body.keepImages) : product.images;
  Object.assign(product, req.body);
  product.images = [...keepImages, ...newImages];
  await product.save();
  res.json({ success: true, data: product });
};

// @desc Delete product (admin)
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: 'Product deleted' });
};

// @desc Add review
exports.addReview = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) return res.status(400).json({ success: false, message: 'Already reviewed' });
  product.reviews.push({ user: req.user._id, name: req.user.name, rating: req.body.rating, comment: req.body.comment });
  await product.save();
  res.status(201).json({ success: true, data: product });
};

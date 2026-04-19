const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc Get cart
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock isActive');
  res.json({ success: true, data: cart || { items: [], totalPrice: 0, totalItems: 0 } });
};

// @desc Add to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive)
    return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.stock < quantity)
    return res.status(400).json({ success: false, message: 'Insufficient stock' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingItem = cart.items.find((i) => i.product.toString() === productId);
  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock)
      return res.status(400).json({ success: false, message: 'Not enough stock' });
    existingItem.quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      name: product.name,
      image: product.images[0] || '',
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      quantity,
    });
  }
  await cart.save();
  res.json({ success: true, data: cart });
};

// @desc Update cart item
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  const item = cart.items.find((i) => i._id.toString() === req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  const product = await Product.findById(item.product);
  if (product && quantity > product.stock)
    return res.status(400).json({ success: false, message: 'Not enough stock' });

  item.quantity = quantity;
  await cart.save();
  res.json({ success: true, data: cart });
};

// @desc Remove cart item
exports.removeCartItem = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json({ success: true, data: cart });
};

// @desc Clear cart
exports.clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) { cart.items = []; await cart.save(); }
  res.json({ success: true, message: 'Cart cleared' });
};

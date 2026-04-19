const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');

// @desc Place order
exports.placeOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = 'COD', notes } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0)
    return res.status(400).json({ success: false, message: 'Cart is empty' });

  // Validate stock
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive)
      return res.status(400).json({ success: false, message: `Product ${item.name} unavailable` });
    if (product.stock < item.quantity)
      return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
  }

  const subtotal = cart.totalPrice;
  const shippingCharge = subtotal > 500 ? 0 : 50;
  const totalAmount = subtotal + shippingCharge;

  const order = await Order.create({
    user: req.user._id,
    customerSnapshot: { name: req.user.name, email: req.user.email, phone: req.user.phone },
    items: cart.items.map((i) => ({ product: i.product, name: i.name, image: i.image, price: i.price, quantity: i.quantity, totalPrice: i.price * i.quantity })),
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCharge,
    totalAmount,
    notes,
    statusHistory: [{ status: 'Placed', note: 'Order placed successfully' }],
  });

  // Deduct stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } });
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
};

// @desc Get my orders
exports.getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, data: orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

// @desc Get single order
exports.getOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
};

// @desc Cancel order
exports.cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!['Placed', 'Confirmed'].includes(order.orderStatus))
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });

  order.orderStatus = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by customer' });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
  }
  await order.save();
  res.json({ success: true, data: order });
};

// @desc Generate / get invoice
exports.getInvoice = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  let invoice = await Invoice.findOne({ order: order._id });
  if (!invoice) {
    invoice = await Invoice.create({
      order: order._id,
      user: req.user._id,
      storeName: 'My Store',
      storeAddress: '123 Store Lane, Mumbai',
      storeEmail: 'store@mystore.com',
      customerName: order.customerSnapshot.name,
      customerEmail: order.customerSnapshot.email,
      customerAddress: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}`,
      items: order.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, total: i.totalPrice })),
      subtotal: order.subtotal,
      shippingCharge: order.shippingCharge,
      discount: order.discount,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    });
    order.invoiceGenerated = true;
    await order.save();
  }

  res.json({ success: true, data: invoice });
};

// @desc Download invoice PDF
exports.downloadInvoice = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  let invoice = await Invoice.findOne({ order: order._id });
  if (!invoice) {
    invoice = await Invoice.create({
      order: order._id,
      user: req.user._id,
      storeName: 'My Store',
      storeAddress: '123 Store Lane, Mumbai, India',
      storeEmail: 'store@mystore.com',
      customerName: order.customerSnapshot.name,
      customerEmail: order.customerSnapshot.email,
      customerAddress: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}`,
      items: order.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, total: i.totalPrice })),
      subtotal: order.subtotal,
      shippingCharge: order.shippingCharge,
      discount: order.discount || 0,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
  generateInvoicePDF(invoice, res);
};

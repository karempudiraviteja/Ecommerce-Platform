const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');

// @desc Dashboard stats
exports.getDashboard = async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalProducts = await Product.countDocuments({ isActive: true });

  const revenueResult = await Order.aggregate([
    { $match: { orderStatus: { $nin: ['Cancelled', 'Returned'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  // Monthly sales (last 12 months)
  const monthlySales = await Order.aggregate([
    { $match: { orderStatus: { $nin: ['Cancelled', 'Returned'] }, createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Top selling products
  const topProducts = await Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).select('name sold price images');

  // Low stock products
  const lowStock = await Product.find({ isActive: true, stock: { $lte: 10 } }).sort({ stock: 1 }).limit(10).select('name stock price images');

  // Recent orders
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email');

  // Order status breakdown
  const orderStatusBreakdown = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: { totalOrders, totalCustomers, totalRevenue, totalProducts, monthlySales, topProducts, lowStock, recentOrders, orderStatusBreakdown },
  });
};

// @desc Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  if (status) query.orderStatus = status;
  if (search) query.orderNumber = { $regex: search, $options: 'i' };

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, data: orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

// @desc Get single order (admin)
exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
};

// @desc Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
  if (status === 'Delivered') order.paymentStatus = 'Paid';
  await order.save();
  res.json({ success: true, data: order });
};

// @desc Get all customers (admin)
exports.getAllCustomers = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const total = await User.countDocuments({ role: 'customer' });
  const customers = await User.find({ role: 'customer' })
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, data: customers, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

// @desc Toggle customer active status
exports.toggleCustomerStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: 'Customer not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: user, message: `Customer ${user.isActive ? 'activated' : 'deactivated'}` });
};

// @desc Download invoice (admin)
exports.downloadInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  let invoice = await Invoice.findOne({ order: order._id });
  if (!invoice) {
    invoice = await Invoice.create({
      order: order._id,
      user: order.user,
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

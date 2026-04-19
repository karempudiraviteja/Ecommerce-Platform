const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getDashboard, getAllOrders, getOrderById,
  updateOrderStatus, getAllCustomers, toggleCustomerStatus, downloadInvoice
} = require('../controllers/adminController');

router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/orders/:id/invoice/download', downloadInvoice);
router.get('/customers', getAllCustomers);
router.put('/customers/:id/toggle', toggleCustomerStatus);
module.exports = router;

const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issuedAt: { type: Date, default: Date.now },
    dueDate: { type: Date },
    storeName: { type: String, default: 'VL Store' },
    storeAddress: { type: String, default: '' },
    storeEmail: { type: String, default: '' },
    customerName: String,
    customerEmail: String,
    customerAddress: String,
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        total: Number,
      },
    ],
    subtotal: Number,
    shippingCharge: Number,
    discount: Number,
    totalAmount: Number,
    paymentMethod: String,
    paymentStatus: String,
    notes: String,
  },
  { timestamps: true }
);

invoiceSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);

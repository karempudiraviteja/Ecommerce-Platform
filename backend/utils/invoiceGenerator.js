const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice, stream) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(stream);

  const primary = '#1a1a2e';
  const accent = '#e94560';
  const light = '#f5f5f5';
  const W = 495;

  // Header bar
  doc.rect(50, 45, W, 80).fill(primary);
  doc.fillColor('#ffffff').fontSize(26).font('Helvetica-Bold').text('INVOICE', 70, 65);
  doc.fontSize(10).font('Helvetica').text(invoice.storeName, 70, 95);
  doc.text(invoice.storeAddress, 70, 108);
  doc.text(invoice.storeEmail, 70, 121);

  // Invoice meta (right side)
  doc.fontSize(10).text(`Invoice #: ${invoice.invoiceNumber}`, 350, 65, { width: 175, align: 'right' });
  doc.text(`Date: ${new Date(invoice.issuedAt).toLocaleDateString('en-IN')}`, 350, 80, { width: 175, align: 'right' });
  doc.text(`Payment: ${invoice.paymentMethod}`, 350, 95, { width: 175, align: 'right' });
  doc.text(`Status: ${invoice.paymentStatus}`, 350, 110, { width: 175, align: 'right' });

  // Accent line
  doc.rect(50, 130, W, 3).fill(accent);

  // Bill To
  doc.fillColor(primary).fontSize(11).font('Helvetica-Bold').text('BILL TO', 50, 145);
  doc.rect(50, 158, 220, 1).fill('#cccccc');
  doc.fillColor('#333333').fontSize(10).font('Helvetica').text(invoice.customerName || '', 50, 165);
  doc.text(invoice.customerEmail || '', 50, 178);
  doc.text(invoice.customerAddress || '', 50, 191, { width: 220 });

  // Items table
  const tableTop = 260;
  doc.rect(50, tableTop, W, 24).fill(primary);
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
  doc.text('ITEM', 60, tableTop + 7);
  doc.text('QTY', 310, tableTop + 7, { width: 50, align: 'center' });
  doc.text('PRICE', 370, tableTop + 7, { width: 70, align: 'right' });
  doc.text('TOTAL', 450, tableTop + 7, { width: 85, align: 'right' });

  let y = tableTop + 30;
  invoice.items.forEach((item, i) => {
    if (i % 2 === 0) doc.rect(50, y - 4, W, 22).fill('#f9f9f9');
    doc.fillColor('#333333').font('Helvetica').fontSize(10);
    doc.text(item.name, 60, y, { width: 240 });
    doc.text(String(item.quantity), 310, y, { width: 50, align: 'center' });
    doc.text(`₹${item.price.toFixed(2)}`, 370, y, { width: 70, align: 'right' });
    doc.text(`₹${item.total.toFixed(2)}`, 450, y, { width: 85, align: 'right' });
    y += 24;
  });

  // Totals
  y += 10;
  doc.rect(50, y, W, 1).fill('#dddddd');
  y += 10;

  const totalsX = 370;
  const valX = 450;
  const valW = 85;

  const drawRow = (label, value, bold = false) => {
    doc.fillColor('#555555').font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
    doc.text(label, totalsX, y, { width: 70, align: 'right' });
    doc.fillColor(bold ? primary : '#333333').text(value, valX, y, { width: valW, align: 'right' });
    y += 18;
  };

  drawRow('Subtotal:', `₹${invoice.subtotal.toFixed(2)}`);
  drawRow('Shipping:', `₹${invoice.shippingCharge.toFixed(2)}`);
  if (invoice.discount > 0) drawRow('Discount:', `-₹${invoice.discount.toFixed(2)}`);

  // Total row with background
  y += 2;
  doc.rect(350, y - 3, W - 300, 22).fill(accent);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11);
  doc.text('TOTAL:', totalsX, y + 2, { width: 70, align: 'right' });
  doc.text(`₹${invoice.totalAmount.toFixed(2)}`, valX, y + 2, { width: valW, align: 'right' });
  y += 30;

  // Footer
  doc.rect(50, 760, W, 1).fill('#dddddd');
  doc.fillColor('#888888').font('Helvetica').fontSize(9);
  doc.text('Thank you for your purchase! For queries contact us at ' + invoice.storeEmail, 50, 768, { width: W, align: 'center' });

  doc.end();
};

module.exports = { generateInvoicePDF };

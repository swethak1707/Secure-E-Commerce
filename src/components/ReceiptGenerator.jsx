import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Helper to format date
const formatDate = (timestamp) => {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper to format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount);
};

// Generate and download a PDF receipt
export const generateReceipt = (orderData) => {
  // Initialize the PDF document
  const doc = new jsPDF();
  
  // Add your company logo (if available)
  // doc.addImage(logoData, 'PNG', 15, 15, 50, 15);
  
  // Add receipt title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT', 105, 20, { align: 'center' });
  
  // Add receipt metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const metaData = [
    ['Order Number:', orderData.id],
    ['Date:', formatDate(orderData.paidAt || orderData.createdAt)],
    ['Payment ID:', orderData.paymentIntentId]
  ];
  
  doc.autoTable({
    startY: 30,
    body: metaData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
  });
  
  // Add billing and shipping information
  const shipping = orderData.shipping;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Billing & Shipping Information', 15, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const addressData = [
    ['Customer:', shipping.fullName],
    ['Address:', shipping.address],
    ['', `${shipping.city}, ${shipping.state} ${shipping.zipCode}`],
    ['', shipping.country],
    ['Phone:', shipping.phoneNumber]
  ];
  
  doc.autoTable({
    startY: 60,
    body: addressData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
  });
  
  // Add order items
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Items', 15, 95);
  
  const itemHeaders = [['Item', 'Quantity', 'Price', 'Total']];
  const itemData = orderData.items.map(item => [
    item.name,
    item.quantity,
    formatCurrency(item.price),
    formatCurrency(item.price * item.quantity)
  ]);
  
  doc.autoTable({
    startY: 100,
    head: itemHeaders,
    body: itemData,
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237] } // Purple color
  });
  
  // Add order summary
  const finalY = doc.lastAutoTable.finalY + 10;
  
  const summaryData = [
    ['Subtotal:', formatCurrency(orderData.total)],
    ['Shipping:', 'Free'],
    ['Tax:', formatCurrency(0)], // You can calculate tax if needed
    ['Total:', formatCurrency(orderData.total)]
  ];
  
  doc.autoTable({
    startY: finalY,
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right' }
    },
    margin: { left: 100 }
  });
  
  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Thank you for your purchase!', 105, pageHeight - 30, { align: 'center' });
  doc.text('ShopSquare Inc.', 105, pageHeight - 25, { align: 'center' });
  doc.text('For questions about your order, please contact support@shopsquare.com', 105, pageHeight - 20, { align: 'center' });
  
  // Save the PDF with the order ID as the filename
  doc.save(`receipt-${orderData.id}.pdf`);
};

export default generateReceipt;
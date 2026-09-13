import Receipt from '../models/Receipt.js';

export async function createReceiptNumber() {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const receiptNumber = `ECH-REC-${year}-${String(Math.floor(100000 + Math.random() * 900000))}`;
    if (!(await Receipt.exists({ receiptNumber }))) return receiptNumber;
  }
  throw new Error('Could not generate a unique receipt number.');
}

export function streamReceiptPdf(response, receiptData) {
  const escapePdfText = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, '');
  const lines = [
    ['eCafeHimachal', 22, true], ['Online Services Made Simple', 10, false], ['', 10, false], ['PAYMENT RECEIPT', 18, true], ['', 10, false],
    ['Receipt Number', 10, false], [receiptData.receiptNumber, 12, true], ['Order Number', 10, false], [receiptData.orderNumber, 12, true], ['Date', 10, false], [new Date(receiptData.date).toLocaleDateString('en-IN', { dateStyle: 'long' }), 12, true], ['Buyer', 10, false], [receiptData.buyerName, 12, true], ['Buyer Type', 10, false], [receiptData.buyerType, 12, true], ...(receiptData.businessName ? [['Business Name', 10, false], [receiptData.businessName, 12, true]] : []), ['Service', 10, false], [receiptData.serviceName, 12, true], ['Amount Paid', 10, false], [`Rs. ${receiptData.amount}`, 12, true], ['Payment Status', 10, false], ['SUCCESS', 12, true], ['Razorpay Payment ID', 10, false], [receiptData.razorpayPaymentId, 12, true], ['', 10, false], ['Thank you for choosing eCafeHimachal.', 10, false],
  ];
  let y = 790;
  const text = lines.map(([line, size, bold]) => { const result = `BT /${bold ? 'F2' : 'F1'} ${size} Tf 56 ${y} Td (${escapePdfText(line)}) Tj ET`; y -= size + 9; return result; }).join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const startXref = Buffer.byteLength(pdf); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader('Content-Disposition', `attachment; filename="${receiptData.receiptNumber}.pdf"`);
  response.end(pdf);
}

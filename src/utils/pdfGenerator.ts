import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Invoice } from '../types';
import { formatINR, formatDate, getUpiPaymentUri } from './formatters';

export async function generateInvoicePDF(invoice: Invoice): Promise<void> {
  // A4 dimensions in mm: 210 x 297
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Brand colors
  const primaryPurple: [number, number, number] = [109, 40, 217]; // #6d28d9
  const lightLavender: [number, number, number] = [245, 243, 255]; // #f5f3ff
  const borderPurple: [number, number, number] = [221, 214, 254]; // #ddd6fe
  const darkText: [number, number, number] = [17, 24, 39]; // #111827
  const mutedText: [number, number, number] = [107, 114, 128]; // #6b7280

  let currentY = margin;

  // 1. HEADER SECTION
  // Left: INVOICE title & Meta
  doc.setTextColor(...primaryPurple);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('INVOICE', margin, currentY + 7);

  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Invoice No:  ${invoice.invoiceNo}`, margin, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedText);
  doc.text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`, margin, currentY + 20);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, margin, currentY + 25);

  // Right: GIZMO DESIGN Logo / Branding
  const rightX = pageWidth - margin;
  doc.setTextColor(...primaryPurple);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(invoice.billedBy.businessName || 'GIZMO DESIGN', rightX, currentY + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  if (invoice.billedBy.tagline) {
    doc.text(invoice.billedBy.tagline, rightX, currentY + 11, { align: 'right' });
  }
  doc.text(invoice.billedBy.email, rightX, currentY + 16, { align: 'right' });
  doc.text(invoice.billedBy.phone, rightX, currentY + 21, { align: 'right' });

  currentY += 32;

  // 2. BILLED BY / BILLED TO CARDS (Light Lavender)
  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 36;

  // Billed By Card
  doc.setFillColor(...lightLavender);
  doc.setDrawColor(...borderPurple);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2.5, 2.5, 'FD');

  doc.setTextColor(...primaryPurple);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('BILLED BY', margin + 4, currentY + 6);

  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(invoice.billedBy.businessName || 'GIZMO DESIGN', margin + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  doc.text(invoice.billedBy.address || 'Design Hub', margin + 4, currentY + 17);
  doc.text(
    `${invoice.billedBy.city}, ${invoice.billedBy.country || 'India'} ${invoice.billedBy.pinCode ? '- ' + invoice.billedBy.pinCode : ''}`,
    margin + 4,
    currentY + 22
  );
  doc.text(`Phone: ${invoice.billedBy.phone}`, margin + 4, currentY + 27);
  doc.text(`Email: ${invoice.billedBy.email}`, margin + 4, currentY + 32);

  // Billed To Card
  const toX = margin + cardWidth + 6;
  doc.setFillColor(...lightLavender);
  doc.setDrawColor(...borderPurple);
  doc.roundedRect(toX, currentY, cardWidth, cardHeight, 2.5, 2.5, 'FD');

  doc.setTextColor(...primaryPurple);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('BILLED TO', toX + 4, currentY + 6);

  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const clientName = invoice.billedTo.clientName || 'Valued Client';
  doc.text(clientName.substring(0, 34), toX + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  const addressLine = invoice.billedTo.address || '';
  doc.text(addressLine.substring(0, 36), toX + 4, currentY + 17);
  doc.text(
    `${invoice.billedTo.city || ''}${invoice.billedTo.city && invoice.billedTo.state ? ', ' : ''}${invoice.billedTo.state || ''} ${invoice.billedTo.pinCode ? '- ' + invoice.billedTo.pinCode : ''}`,
    toX + 4,
    currentY + 22
  );
  if (invoice.billedTo.phone) {
    doc.text(`Phone: ${invoice.billedTo.phone}`, toX + 4, currentY + 27);
  }
  if (invoice.billedTo.gstin) {
    doc.text(`GSTIN: ${invoice.billedTo.gstin}`, toX + 4, currentY + 32);
  } else if (invoice.billedTo.email) {
    doc.text(`Email: ${invoice.billedTo.email}`, toX + 4, currentY + 32);
  }

  currentY += cardHeight + 4;

  // 3. SUPPLY INFORMATION STRIP
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, currentY, contentWidth, 9, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkText);
  doc.text(
    `Country of Supply: ${invoice.supplyInfo.countryOfSupply || 'India'}`,
    margin + 4,
    currentY + 5.8
  );
  doc.text(
    `Place of Supply: ${invoice.supplyInfo.placeOfSupply || 'Other Territory (97)'}`,
    margin + contentWidth / 2,
    currentY + 5.8
  );

  currentY += 12;

  // 4. ITEM TABLE
  // Columns: No, Item, GST Rate, Qty, Rate, Amount, CGST, SGST, Total
  const colWidths = {
    no: 10,
    desc: 62,
    gst: 16,
    qty: 12,
    rate: 20,
    amount: 20,
    cgst: 14,
    sgst: 14,
    total: 14,
  };

  // Header Row
  doc.setFillColor(...primaryPurple);
  doc.rect(margin, currentY, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);

  let curX = margin;
  doc.text('No.', curX + 2, currentY + 5.2);
  curX += colWidths.no;
  doc.text('Item / Description', curX + 2, currentY + 5.2);
  curX += colWidths.desc;
  doc.text('GST Rate', curX + colWidths.gst - 2, currentY + 5.2, { align: 'right' });
  curX += colWidths.gst;
  doc.text('Qty', curX + colWidths.qty - 2, currentY + 5.2, { align: 'right' });
  curX += colWidths.qty;
  doc.text('Rate', curX + colWidths.rate - 2, currentY + 5.2, { align: 'right' });
  curX += colWidths.rate;
  doc.text('Amount', curX + colWidths.amount - 2, currentY + 5.2, { align: 'right' });
  curX += colWidths.amount;
  doc.text('CGST', curX + colWidths.cgst - 2, currentY + 5.2, { align: 'right' });
  curX += colWidths.cgst;
  doc.text('SGST', curX + colWidths.sgst - 2, currentY + 5.2, { align: 'right' });
  curX += colWidths.sgst;
  doc.text('Total', curX + colWidths.total - 2, currentY + 5.2, { align: 'right' });

  currentY += 8;

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  invoice.items.forEach((item, index) => {
    const isEven = index % 2 === 1;
    if (isEven) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, currentY, contentWidth, 8, 'F');
    }

    doc.setDrawColor(243, 244, 246);
    doc.line(margin, currentY + 8, margin + contentWidth, currentY + 8);

    doc.setTextColor(...darkText);
    curX = margin;
    doc.text(`${index + 1}`, curX + 2, currentY + 5.2);
    curX += colWidths.no;
    doc.text(item.description.substring(0, 36), curX + 2, currentY + 5.2);
    curX += colWidths.desc;
    doc.text(`${item.gstRate}%`, curX + colWidths.gst - 2, currentY + 5.2, { align: 'right' });
    curX += colWidths.gst;
    doc.text(`${item.quantity}`, curX + colWidths.qty - 2, currentY + 5.2, { align: 'right' });
    curX += colWidths.qty;
    doc.text(formatINR(item.rate), curX + colWidths.rate - 2, currentY + 5.2, { align: 'right' });
    curX += colWidths.rate;
    doc.text(formatINR(item.amount), curX + colWidths.amount - 2, currentY + 5.2, { align: 'right' });
    curX += colWidths.amount;
    doc.text(formatINR(item.cgst), curX + colWidths.cgst - 2, currentY + 5.2, { align: 'right' });
    curX += colWidths.cgst;
    doc.text(formatINR(item.sgst), curX + colWidths.sgst - 2, currentY + 5.2, { align: 'right' });
    curX += colWidths.sgst;
    doc.text(formatINR(item.total), curX + colWidths.total - 2, currentY + 5.2, { align: 'right' });

    currentY += 8;
  });

  currentY += 6;

  // 5. BOTTOM PAYMENT & SUMMARY SECTION
  const bottomBoxY = currentY;

  // Left: UPI QR Section
  const upiId = invoice.paymentDetails.upiId || '9845879017-2@ybl';
  const upiUri = getUpiPaymentUri({
    upiId,
    accountName: invoice.paymentDetails.accountName || invoice.billedBy.businessName,
    amount: invoice.balanceAmount > 0 ? invoice.balanceAmount : invoice.grandTotal,
    invoiceNo: invoice.invoiceNo,
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(upiUri, {
      margin: 1,
      width: 140,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    });

    // Box for UPI
    doc.setFillColor(...lightLavender);
    doc.setDrawColor(...borderPurple);
    doc.roundedRect(margin, bottomBoxY, 78, 48, 2.5, 2.5, 'FD');

    doc.setTextColor(...primaryPurple);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Scan to pay via UPI', margin + 5, bottomBoxY + 7);

    // QR Image
    doc.addImage(qrDataUrl, 'PNG', margin + 5, bottomBoxY + 11, 30, 30);

    // UPI text details next to QR
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...darkText);
    doc.text('UPI ID:', margin + 38, bottomBoxY + 18);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryPurple);
    doc.text(upiId, margin + 38, bottomBoxY + 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text('Accepted on GPay, PhonePe,', margin + 38, bottomBoxY + 29);
    doc.text('Paytm, BHIM, & Banking UPI', margin + 38, bottomBoxY + 33);
    doc.text('Account: ' + (invoice.paymentDetails.accountName || 'GIZMO DESIGN'), margin + 38, bottomBoxY + 38);
  } catch (err) {
    console.error('Could not render QR code in PDF', err);
  }

  // Right: Financial Summary Breakdown
  const summaryX = pageWidth - margin - 75;
  const summaryWidth = 75;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(summaryX, bottomBoxY, summaryWidth, 48, 2, 2, 'FD');

  let sY = bottomBoxY + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);

  // Amount
  doc.text('Amount', summaryX + 5, sY);
  doc.setTextColor(...darkText);
  doc.text(formatINR(invoice.subtotal, true), summaryX + summaryWidth - 5, sY, { align: 'right' });

  // CGST
  sY += 6;
  doc.setTextColor(...mutedText);
  doc.text('CGST', summaryX + 5, sY);
  doc.setTextColor(...darkText);
  doc.text(formatINR(invoice.cgstTotal, true), summaryX + summaryWidth - 5, sY, { align: 'right' });

  // SGST
  sY += 6;
  doc.setTextColor(...mutedText);
  doc.text('SGST', summaryX + 5, sY);
  doc.setTextColor(...darkText);
  doc.text(formatINR(invoice.sgstTotal, true), summaryX + summaryWidth - 5, sY, { align: 'right' });

  // Total (INR) Strong Highlight Row
  sY += 7;
  doc.setFillColor(...primaryPurple);
  doc.roundedRect(summaryX + 2, sY - 4, summaryWidth - 4, 10, 1.5, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Total (INR)', summaryX + 5, sY + 2.5);
  doc.text(formatINR(invoice.grandTotal, true), summaryX + summaryWidth - 5, sY + 2.5, { align: 'right' });

  // Received and Balance if applicable
  if (invoice.receivedAmount > 0 || invoice.status === 'Partially Paid') {
    sY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52); // green
    doc.text(`Received: ${formatINR(invoice.receivedAmount, true)}`, summaryX + 5, sY);
    
    doc.setTextColor(185, 28, 28); // red
    doc.text(`Balance: ${formatINR(invoice.balanceAmount, true)}`, summaryX + summaryWidth - 5, sY, { align: 'right' });
  }

  // 6. FOOTER
  const footerY = pageHeight - margin - 12;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  const footerLine1 = `For any enquiry, reach out via email at ${invoice.billedBy.email} | Phone: ${invoice.billedBy.phone}`;
  doc.text(footerLine1, margin + contentWidth / 2, footerY + 5, { align: 'center' });

  const footerLine2 =
    invoice.footerNote || 'This is an electronically generated document, no signature is required.';
  doc.text(footerLine2, margin + contentWidth / 2, footerY + 9, { align: 'center' });

  // Save / trigger download
  const filename = `Invoice-${invoice.invoiceNo}-${invoice.billedTo.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}

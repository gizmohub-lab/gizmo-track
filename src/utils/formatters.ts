import { InvoiceItem, TaxType } from '../types';

/**
 * Format Indian Rupee currency: ₹4,000 or ₹4,000.00
 */
export function formatINR(amount: number, showDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showDecimals ? '₹0.00' : '₹0';
  }
  
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 2,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
  
  return `₹${formatted}`;
}

/**
 * Format ISO date string into readable Indian standard format (e.g. 20 Aug 2026)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Get current timestamp in portal format: "20 Aug 2026 · 10:20 AM"
 */
export function getFormattedTimestamp(date = new Date()): string {
  const datePart = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} · ${timePart}`;
}

/**
 * Calculate totals for item and invoice with CGST/SGST or IGST
 */
export function recalculateItem(item: InvoiceItem, taxType: TaxType): InvoiceItem {
  const qty = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const amount = Math.round(qty * rate * 100) / 100;
  const gstRate = Number(item.gstRate) || 0;
  
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  
  if (gstRate > 0) {
    if (taxType === 'CGST_SGST') {
      const halfRate = gstRate / 2;
      cgst = Math.round(((amount * halfRate) / 100) * 100) / 100;
      sgst = Math.round(((amount * halfRate) / 100) * 100) / 100;
    } else {
      igst = Math.round(((amount * gstRate) / 100) * 100) / 100;
    }
  }
  
  const total = Math.round((amount + cgst + sgst + igst) * 100) / 100;
  
  return {
    ...item,
    quantity: qty,
    rate: rate,
    amount,
    cgst,
    sgst,
    igst,
    total,
  };
}

export function calculateInvoiceTotals(items: InvoiceItem[], taxType: TaxType) {
  const calculatedItems = items.map((item) => recalculateItem(item, taxType));
  
  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  
  for (const item of calculatedItems) {
    subtotal += item.amount;
    cgstTotal += item.cgst;
    sgstTotal += item.sgst;
    igstTotal += item.igst;
  }
  
  subtotal = Math.round(subtotal * 100) / 100;
  cgstTotal = Math.round(cgstTotal * 100) / 100;
  sgstTotal = Math.round(sgstTotal * 100) / 100;
  igstTotal = Math.round(igstTotal * 100) / 100;
  
  const taxTotal = Math.round((cgstTotal + sgstTotal + igstTotal) * 100) / 100;
  const grandTotal = Math.round((subtotal + taxTotal) * 100) / 100;
  
  return {
    items: calculatedItems,
    subtotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
    taxTotal,
    grandTotal,
  };
}

/**
 * Generate next sequential invoice number like A00001, A00002...
 */
export function getNextInvoiceNumber(
  existingInvoices: { invoiceNo: string }[],
  prefix = 'A',
  startingNum = 1
): string {
  let highestNum = startingNum - 1;
  const regex = new RegExp(`^${prefix}(\\d+)$`, 'i');
  
  for (const inv of existingInvoices) {
    const match = inv.invoiceNo.trim().match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highestNum) {
        highestNum = num;
      }
    }
  }
  
  const nextNum = highestNum + 1;
  return `${prefix}${String(nextNum).padStart(5, '0')}`;
}

/**
 * Standard UPI URI generator
 */
export function getUpiPaymentUri(params: {
  upiId: string;
  accountName: string;
  amount?: number;
  invoiceNo?: string;
}): string {
  const { upiId, accountName, amount, invoiceNo } = params;
  const cleanUpi = encodeURIComponent(upiId.trim());
  const cleanName = encodeURIComponent(accountName.trim());
  let uri = `upi://pay?pa=${cleanUpi}&pn=${cleanName}&cu=INR`;
  if (amount && amount > 0) {
    uri += `&am=${amount.toFixed(2)}`;
  }
  if (invoiceNo) {
    uri += `&tn=${encodeURIComponent(`Invoice ${invoiceNo}`)}`;
  }
  return uri;
}

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Invoice } from '../../types';
import { formatINR, formatDate, getUpiPaymentUri } from '../../utils/formatters';

interface InvoiceDocumentProps {
  invoice: Invoice;
  className?: string;
  isPrintMode?: boolean;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  className = '',
  isPrintMode = false,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const upiId = invoice.paymentDetails?.upiId || '9845879017-2@ybl';
    const uri = getUpiPaymentUri({
      upiId,
      accountName: invoice.paymentDetails?.accountName || invoice.billedBy?.businessName || 'GIZMO DESIGN',
      amount: invoice.balanceAmount > 0 ? invoice.balanceAmount : invoice.grandTotal,
      invoiceNo: invoice.invoiceNo,
    });

    QRCode.toDataURL(uri, {
      margin: 1,
      width: 180,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation failed', err);
      });

    return () => {
      isMounted = false;
    };
  }, [
    invoice.paymentDetails?.upiId,
    invoice.paymentDetails?.accountName,
    invoice.billedBy?.businessName,
    invoice.balanceAmount,
    invoice.grandTotal,
    invoice.invoiceNo,
  ]);

  return (
    <div
      id="invoice-document-sheet"
      className={`invoice-a4-sheet bg-white text-slate-900 mx-auto transition-all ${
        isPrintMode ? 'p-0 shadow-none border-0' : 'p-8 sm:p-10 shadow-xl border border-slate-200 rounded-2xl max-w-4xl'
      } ${className}`}
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
        {/* Left: INVOICE title & meta */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-violet-700 tracking-tight leading-none">
            INVOICE
          </h1>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Invoice No:</span>
              <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                {invoice.invoiceNo}
              </span>
              <span
                className={`ml-2 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                  invoice.status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : invoice.status === 'Partially Paid'
                    ? 'bg-amber-100 text-amber-800'
                    : invoice.status === 'Overdue'
                    ? 'bg-rose-100 text-rose-800'
                    : invoice.status === 'Draft'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-violet-100 text-violet-800'
                }`}
              >
                {invoice.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <span className="font-medium text-slate-500">Invoice Date:</span>
              <span className="font-semibold text-slate-800">{formatDate(invoice.invoiceDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <span className="font-medium text-slate-500">Due Date:</span>
              <span className="font-semibold text-slate-800">{formatDate(invoice.dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Right: GIZMO DESIGN Logo & Info */}
        <div className="text-left sm:text-right">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-violet-700/20">
              G
            </div>
            <div className="text-left">
              <div className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                {invoice.billedBy.businessName || 'GIZMO DESIGN'}
              </div>
              <div className="text-[11px] font-semibold text-violet-700 tracking-wider uppercase">
                {invoice.billedBy.tagline || 'Design & Creative Studio'}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 space-y-0.5">
            <p>{invoice.billedBy.email}</p>
            <p>{invoice.billedBy.phone}</p>
            {invoice.billedBy.gstin && <p className="font-mono text-[11px]">GSTIN: {invoice.billedBy.gstin}</p>}
          </div>
        </div>
      </div>

      {/* 2. BILLED BY / BILLED TO CARDS (Light Lavender cards from reference) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {/* BILLED BY CARD */}
        <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-100/90 text-sm">
          <div className="text-xs font-black tracking-wider uppercase text-violet-700 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
            BILLED BY
          </div>
          <div className="font-bold text-slate-900 text-base">
            {invoice.billedBy.businessName || 'GIZMO DESIGN'}
          </div>
          <div className="mt-1 text-xs text-slate-600 space-y-0.5">
            <p>{invoice.billedBy.address || 'Design Hub, Creative District'}</p>
            <p>
              {invoice.billedBy.city}
              {invoice.billedBy.state ? `, ${invoice.billedBy.state}` : ''}
              {invoice.billedBy.country ? `, ${invoice.billedBy.country}` : ', India'}
              {invoice.billedBy.pinCode ? ` - ${invoice.billedBy.pinCode}` : ''}
            </p>
            <p className="pt-1">
              <span className="font-medium text-slate-500">Phone:</span> {invoice.billedBy.phone}
            </p>
            <p>
              <span className="font-medium text-slate-500">Email:</span> {invoice.billedBy.email}
            </p>
          </div>
        </div>

        {/* BILLED TO CARD */}
        <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-100/90 text-sm">
          <div className="text-xs font-black tracking-wider uppercase text-violet-700 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
            BILLED TO
          </div>
          <div className="font-bold text-slate-900 text-base">
            {invoice.billedTo.clientName || 'Client Name'}
          </div>
          {invoice.billedTo.company && invoice.billedTo.company !== invoice.billedTo.clientName && (
            <div className="text-xs font-medium text-violet-900">
              {invoice.billedTo.company}
            </div>
          )}
          <div className="mt-1 text-xs text-slate-600 space-y-0.5">
            {invoice.billedTo.address && <p>{invoice.billedTo.address}</p>}
            <p>
              {invoice.billedTo.city || ''}
              {invoice.billedTo.city && invoice.billedTo.state ? ', ' : ''}
              {invoice.billedTo.state || ''}
              {invoice.billedTo.country ? `, ${invoice.billedTo.country}` : ''}
              {invoice.billedTo.pinCode ? ` - ${invoice.billedTo.pinCode}` : ''}
            </p>
            {invoice.billedTo.phone && (
              <p className="pt-1">
                <span className="font-medium text-slate-500">Phone:</span> {invoice.billedTo.phone}
              </p>
            )}
            {invoice.billedTo.email && (
              <p>
                <span className="font-medium text-slate-500">Email:</span> {invoice.billedTo.email}
              </p>
            )}
            {invoice.billedTo.gstin && (
              <p className="font-mono text-[11px] font-semibold text-slate-700">
                <span className="font-sans font-medium text-slate-500">GSTIN:</span> {invoice.billedTo.gstin}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. SUPPLY INFORMATION */}
      <div className="px-4 py-2.5 mb-6 rounded-lg bg-slate-50 border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Country of Supply:</span>
          <span className="font-bold text-slate-800">{invoice.supplyInfo?.countryOfSupply || 'India'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Place of Supply:</span>
          <span className="font-bold text-violet-800 bg-violet-100/70 px-2 py-0.5 rounded border border-violet-200">
            {invoice.supplyInfo?.placeOfSupply || 'Other Territory (97)'}
          </span>
        </div>
        {invoice.projectTitle && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-500">Project:</span>
            <span className="font-bold text-slate-900">{invoice.projectTitle}</span>
            {invoice.projectCode && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-violet-100 text-violet-800 font-bold border border-violet-200">
                {invoice.projectCode}
              </span>
            )}
            {invoice.invoiceStage && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                Stage: {invoice.invoiceStage}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. ITEM TABLE (Purple Table Header from Reference) */}
      <div className="overflow-x-auto mb-6 rounded-xl border border-slate-200 shadow-xs">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-violet-700 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">No.</th>
              <th className="py-3 px-3">Item / Description</th>
              <th className="py-3 px-2 text-right">GST Rate</th>
              <th className="py-3 px-2 text-right">Qty</th>
              <th className="py-3 px-3 text-right">Rate</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-2 text-right">CGST</th>
              <th className="py-3 px-2 text-right">SGST</th>
              <th className="py-3 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, index) => (
              <tr
                key={item.id || index}
                className={index % 2 === 1 ? 'bg-slate-50/60 hover:bg-violet-50/30' : 'bg-white hover:bg-violet-50/30'}
              >
                <td className="py-3 px-3 text-center font-semibold text-slate-400">
                  {index + 1}
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  {item.description}
                </td>
                <td className="py-3 px-2 text-right text-slate-600 font-medium">
                  {item.gstRate}%
                </td>
                <td className="py-3 px-2 text-right text-slate-700 font-semibold">
                  {item.quantity}
                </td>
                <td className="py-3 px-3 text-right text-slate-700">
                  {formatINR(item.rate)}
                </td>
                <td className="py-3 px-3 text-right font-medium text-slate-800">
                  {formatINR(item.amount)}
                </td>
                <td className="py-3 px-2 text-right text-slate-500">
                  {formatINR(item.cgst)}
                </td>
                <td className="py-3 px-2 text-right text-slate-500">
                  {formatINR(item.sgst)}
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">
                  {formatINR(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. BOTTOM SECTION: SCAN TO PAY VIA UPI & PAYMENT SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-start">
        {/* Left: Scan to pay via UPI (Cols 1-7) */}
        <div className="md:col-span-7 p-4 rounded-xl bg-violet-50/60 border border-violet-100 text-sm">
          <div className="text-xs font-black tracking-wider uppercase text-violet-700 mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
            Scan to pay via UPI
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Dynamic UPI QR Code */}
            <div className="p-2 bg-white rounded-lg border border-violet-200/80 shadow-xs shrink-0">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-28 h-28 object-contain"
                />
              ) : (
                <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* UPI Details */}
            <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  UPI ID
                </span>
                <div className="font-mono font-bold text-sm sm:text-base text-violet-700 select-all bg-white/70 px-2.5 py-1 rounded border border-violet-200/60 break-all">
                  {invoice.paymentDetails?.upiId || '9845879017-2@ybl'}
                </div>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-medium text-slate-500">Account:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {invoice.paymentDetails?.accountName || invoice.billedBy?.businessName || 'GIZMO DESIGN'}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Compatible with Google Pay, PhonePe, Paytm, BHIM, and any UPI banking application.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Financial Payment Summary (Cols 8-12) */}
        <div className="md:col-span-5 bg-white p-4 rounded-xl border border-slate-200 text-sm space-y-2.5">
          <div className="flex justify-between items-center text-slate-600 text-xs sm:text-sm">
            <span>Amount</span>
            <span className="font-semibold text-slate-900">{formatINR(invoice.subtotal, true)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 text-xs sm:text-sm">
            <span>CGST</span>
            <span className="font-semibold text-slate-800">{formatINR(invoice.cgstTotal, true)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 text-xs sm:text-sm">
            <span>SGST</span>
            <span className="font-semibold text-slate-800">{formatINR(invoice.sgstTotal, true)}</span>
          </div>

          {invoice.igstTotal > 0 && (
            <div className="flex justify-between items-center text-slate-600 text-xs sm:text-sm">
              <span>IGST</span>
              <span className="font-semibold text-slate-800">{formatINR(invoice.igstTotal, true)}</span>
            </div>
          )}

          <div className="h-px bg-slate-200 my-1"></div>

          {/* Strong Total Row from reference */}
          <div className="p-2.5 rounded-lg bg-violet-700 text-white flex justify-between items-center shadow-xs">
            <span className="font-extrabold text-sm uppercase tracking-wide">Total (INR)</span>
            <span className="font-black text-base sm:text-lg">{formatINR(invoice.grandTotal, true)}</span>
          </div>

          {/* Payment receipt & balance if partially paid */}
          {(invoice.receivedAmount > 0 || invoice.status === 'Partially Paid') && (
            <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
              <div className="flex justify-between items-center text-emerald-700 font-semibold">
                <span>Received</span>
                <span>{formatINR(invoice.receivedAmount, true)}</span>
              </div>
              <div className="flex justify-between items-center text-rose-700 font-bold">
                <span>Balance Due</span>
                <span>{formatINR(invoice.balanceAmount, true)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. FOOTER */}
      <div className="pt-6 mt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-700">
          For any enquiry, reach out via email at{' '}
          <a
            href={`mailto:${invoice.billedBy.email}`}
            className="text-violet-700 hover:underline font-semibold"
          >
            {invoice.billedBy.email}
          </a>{' '}
          | Phone: <span className="font-semibold text-slate-800">{invoice.billedBy.phone}</span>
        </p>
        <p className="text-[11px] text-slate-400">
          {invoice.footerNote || 'This is an electronically generated document, no signature is required.'}
        </p>
      </div>
    </div>
  );
};

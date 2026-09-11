import React, { useState } from 'react';
import {
  X,
  Building2,
  Hash,
  CreditCard,
  Percent,
  FileText,
  Check,
  QrCode,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { InvoiceSettings } from '../../types';

interface InvoiceSettingsModalProps {
  settings: InvoiceSettings;
  onSave: (newSettings: InvoiceSettings) => void;
  onClose: () => void;
  onOpenResetModal?: () => void;
}

export const InvoiceSettingsModal: React.FC<InvoiceSettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  onOpenResetModal,
}) => {
  const [activeSection, setActiveSection] = useState<
    'business' | 'numbering' | 'payment' | 'tax' | 'footer' | 'reset'
  >('business');

  const [formData, setFormData] = useState<InvoiceSettings>({
    ...settings,
    businessProfile: { ...settings.businessProfile },
    paymentConfig: { ...settings.paymentConfig },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      id="invoice-settings-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Invoice &amp; Business Settings
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configure global defaults for business profile, UPI payment, numbering, and GST.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-slate-50/70 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveSection('business')}
            className={`py-3 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'business'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Business Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('numbering')}
            className={`py-3 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'numbering'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Invoice Numbering</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('payment')}
            className={`py-3 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'payment'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment Details (UPI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('tax')}
            className={`py-3 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'tax'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Tax Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('footer')}
            className={`py-3 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'footer'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Footer &amp; Disclaimer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('reset')}
            className={`py-3 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'reset'
                ? 'border-rose-600 text-rose-700 bg-rose-50/50'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
            <span>Portal Reset</span>
          </button>
        </div>

        {/* Content Body */}
        {activeSection === 'reset' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-black text-sm text-amber-950">Portal Data Maintenance &amp; Reset</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Reset selected Gizmo Portal data to its initial/default state. Core business profiles, WhatsApp numbers, email configuration, invoice numbering, and admin accounts remain fully protected unless explicitly selected.
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h5 className="font-extrabold text-zinc-950 text-sm">Open Portal Reset Wizard</h5>
                <p className="text-zinc-600 text-xs">
                  Choose specific data categories to reset (Projects, Clients, Invoices, Payments, Deliverables, Custom Options, etc.) with advanced safety confirmation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenResetModal) {
                    onOpenResetModal();
                  }
                }}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>↻ Reset Portal Data...</span>
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-200 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition"
              >
                Close Settings
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 1. BUSINESS PROFILE */}
          {activeSection === 'business' && (
            <div className="space-y-3.5 animate-in fade-in duration-100">
              <div className="p-3 bg-violet-50/50 rounded-lg border border-violet-100 text-violet-800 text-xs">
                This business information automatically populates the <strong>BILLED BY</strong> lavender card on all invoices.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={formData.businessProfile.businessName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessProfile: {
                        ...formData.businessProfile,
                        businessName: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline / Category</label>
                <input
                  type="text"
                  value={formData.businessProfile.tagline || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessProfile: {
                        ...formData.businessProfile,
                        tagline: e.target.value,
                      },
                    })
                  }
                  placeholder="Design & Creative Studio"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.businessProfile.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessProfile: {
                          ...formData.businessProfile,
                          phone: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.businessProfile.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessProfile: {
                          ...formData.businessProfile,
                          email: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Studio Address</label>
                <input
                  type="text"
                  value={formData.businessProfile.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessProfile: {
                        ...formData.businessProfile,
                        address: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.businessProfile.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessProfile: {
                          ...formData.businessProfile,
                          city: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.businessProfile.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessProfile: {
                          ...formData.businessProfile,
                          country: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.businessProfile.pinCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessProfile: {
                          ...formData.businessProfile,
                          pinCode: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={formData.businessProfile.gstin || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessProfile: {
                        ...formData.businessProfile,
                        gstin: e.target.value,
                      },
                    })
                  }
                  placeholder="29ABCDE1234F1Z5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
            </div>
          )}

          {/* 2. INVOICE NUMBERING */}
          {activeSection === 'numbering' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-3 bg-violet-50/50 rounded-lg border border-violet-100 text-violet-800 text-xs">
                Configure the sequential prefix and format for automatic invoice numbering (e.g. <strong>A00001</strong>, <strong>A00002</strong>).
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numbering Prefix</label>
                  <input
                    type="text"
                    value={formData.numberingPrefix}
                    onChange={(e) =>
                      setFormData({ ...formData, numberingPrefix: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">e.g. A for A00001</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Starting Number</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.startingNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startingNumber: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-auto-numbering"
                  checked={formData.autoNumbering}
                  onChange={(e) =>
                    setFormData({ ...formData, autoNumbering: e.target.checked })
                  }
                  className="w-4 h-4 text-violet-600 rounded"
                />
                <label
                  htmlFor="chk-auto-numbering"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Enable automatic incrementing for newly created invoices
                </label>
              </div>
            </div>
          )}

          {/* 3. PAYMENT DETAILS (UPI) */}
          {activeSection === 'payment' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-3 bg-violet-50/50 rounded-lg border border-violet-100 text-violet-800 text-xs">
                The UPI QR code on the invoice is generated dynamically from this UPI ID.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  UPI ID (Default: 9845879017-2@ybl)
                </label>
                <input
                  type="text"
                  value={formData.paymentConfig.upiId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentConfig: {
                        ...formData.paymentConfig,
                        upiId: e.target.value,
                      },
                    })
                  }
                  placeholder="9845879017-2@ybl"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-violet-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={formData.paymentConfig.accountName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentConfig: {
                        ...formData.paymentConfig,
                        accountName: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.paymentConfig.bankName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentConfig: {
                          ...formData.paymentConfig,
                          bankName: e.target.value,
                        },
                      })
                    }
                    placeholder="HDFC Bank"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.paymentConfig.ifsc || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentConfig: {
                          ...formData.paymentConfig,
                          ifsc: e.target.value,
                        },
                      })
                    }
                    placeholder="HDFC0001234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. TAX DEFAULTS */}
          {activeSection === 'tax' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-3 bg-violet-50/50 rounded-lg border border-violet-100 text-violet-800 text-xs">
                Select default GST rate applied when adding new invoice items.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Default GST Rate</label>
                <select
                  value={formData.defaultGstRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultGstRate: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                >
                  <option value="0">0% (Default for Reference)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18% (Standard GST)</option>
                  <option value="28">28%</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Default Tax Mode</label>
                <select
                  value={formData.defaultTaxType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultTaxType: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900"
                >
                  <option value="CGST_SGST">CGST + SGST (50% / 50% split)</option>
                  <option value="IGST">IGST (Full rate applied to inter-state)</option>
                </select>
              </div>
            </div>
          )}

          {/* 5. FOOTER & DISCLAIMER */}
          {activeSection === 'footer' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Enquiry &amp; Support Contact</label>
                <textarea
                  rows={2}
                  value={formData.footerText}
                  onChange={(e) =>
                    setFormData({ ...formData, footerText: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Disclaimer</label>
                <input
                  type="text"
                  value={formData.disclaimer}
                  onChange={(e) =>
                    setFormData({ ...formData, disclaimer: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition flex items-center gap-1.5 shadow-sm shadow-violet-600/30"
            >
              <Check className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

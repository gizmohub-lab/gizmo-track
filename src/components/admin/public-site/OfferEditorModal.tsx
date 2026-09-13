import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Calendar,
  Tag,
  Percent,
  Layers,
  ArrowRight,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  PublicSiteOffer,
  PublicSiteOfferDisplayLocation,
} from '../../../types';
import { PublicOfferCard } from '../../public/PublicOfferCard';

interface OfferEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: PublicSiteOffer | null;
  onSave: (savedOffer: PublicSiteOffer) => void;
}

const ALL_LOCATIONS: PublicSiteOfferDisplayLocation[] = [
  'Home Highlights',
  'Home Hero',
  'Services',
  'Work',
  'CTA',
  'Footer',
  'Dedicated section',
];

export const OfferEditorModal: React.FC<OfferEditorModalProps> = ({
  isOpen,
  onClose,
  offer,
  onSave,
}) => {
  const isEditing = Boolean(offer);

  const [formData, setFormData] = useState<PublicSiteOffer>(() => {
    if (offer) return { ...offer };
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return {
      id: `offer-${Date.now()}`,
      title: '',
      shortLabel: 'SPECIAL OFFER',
      description: '',
      offerPrice: 499,
      originalPrice: 800,
      discount: '38% OFF',
      currency: '₹',
      category: 'Poster Design',
      ctaText: 'Claim Offer',
      ctaAction: 'start_project',
      startDate: today,
      endDate: nextMonth,
      priority: 1,
      displayLocations: ['Home Highlights', 'Dedicated section'],
      isActive: true,
      limitedSlotsBadge: 'Only 3 Slots Left Today',
      promoCode: '',
      terms: 'Valid for standard commercial requirements. Revisions included.',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [activeTab, setActiveTab] = useState<'details' | 'preview'>('details');

  if (!isOpen) return null;

  const handlePriceChange = (offerP: number, origP: number) => {
    let disc = formData.discount;
    if (origP > offerP && origP > 0) {
      disc = `${Math.round(((origP - offerP) / origP) * 100)}% OFF`;
    }
    setFormData((prev) => ({
      ...prev,
      offerPrice: offerP,
      originalPrice: origP,
      discount: disc,
    }));
  };

  const handleToggleLocation = (loc: PublicSiteOfferDisplayLocation) => {
    setFormData((prev) => {
      const exists = prev.displayLocations.includes(loc);
      if (exists) {
        return {
          ...prev,
          displayLocations: prev.displayLocations.filter((l) => l !== loc),
        };
      } else {
        return {
          ...prev,
          displayLocations: [...prev.displayLocations, loc],
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter an Offer Title');
      return;
    }

    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950">
                {isEditing ? 'Edit Promotional Offer' : 'Create Special Offer'}
              </h2>
              <p className="text-xs text-zinc-500">
                Configure promotional pricing, automatic dates, and display positions on the public website.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch for mobile / quick preview */}
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'details' ? 'bg-white shadow-xs text-zinc-950 font-bold' : 'text-zinc-600'
                }`}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${
                  activeTab === 'preview' ? 'bg-white shadow-xs text-[#EE1D45] font-bold' : 'text-zinc-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Card</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'preview' ? (
            <div className="space-y-4 max-w-lg mx-auto py-6">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Card Appearance Preview
                </span>
                <p className="text-xs text-zinc-500">
                  This card will automatically render in selected locations across the public website.
                </p>
              </div>

              <PublicOfferCard offer={formData} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Offer Title <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-zinc-600 cursor-pointer flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({ ...formData, isActive: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#EE1D45] focus:ring-[#EE1D45] cursor-pointer"
                        />
                        <span>Active</span>
                      </label>
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 24h Express Commercial Poster Design"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:border-[#EE1D45] focus:ring-1 focus:ring-[#EE1D45]"
                  />
                </div>

                {/* Short Label & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-600 block mb-1">
                      Short Label (Badge)
                    </label>
                    <input
                      type="text"
                      value={formData.shortLabel}
                      onChange={(e) =>
                        setFormData({ ...formData, shortLabel: e.target.value })
                      }
                      placeholder="e.g. SPECIAL OFFER, LIMITED TIME"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-600 block mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="e.g. Poster Design, Brand Identity"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">
                    Offer Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what is included in this offer, turnaround guarantees, deliverables..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed focus:outline-none focus:border-[#EE1D45]"
                  />
                </div>

                {/* 2. Pricing Section */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#EE1D45]" />
                    <span>Pricing &amp; Discount</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                        Offer Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.offerPrice}
                        onChange={(e) =>
                          handlePriceChange(
                            Number(e.target.value) || 0,
                            formData.originalPrice
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-mono font-bold focus:outline-none focus:border-[#EE1D45]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.originalPrice}
                        onChange={(e) =>
                          handlePriceChange(
                            formData.offerPrice,
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-mono font-medium focus:outline-none focus:border-[#EE1D45]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                        Discount Text
                      </label>
                      <input
                        type="text"
                        value={formData.discount || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, discount: e.target.value })
                        }
                        placeholder="e.g. 38% OFF"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm font-mono font-bold text-[#EE1D45] focus:outline-none focus:border-[#EE1D45]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Automatic Date Window */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#EE1D45]" />
                    <span>Automatic Date Window</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                        Start Date (Active From)
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({ ...formData, startDate: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-mono font-medium focus:outline-none focus:border-[#EE1D45]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                        End Date (Expires At Midnight)
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-mono font-medium focus:outline-none focus:border-[#EE1D45]"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    The public site automatically activates this offer when the start date arrives and archives it once the end date passes.
                  </p>
                </div>

                {/* 4. Display Locations */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-2">
                    Display Locations on Public Website
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_LOCATIONS.map((loc) => {
                      const isSelected = formData.displayLocations.includes(loc);
                      return (
                        <button
                          type="button"
                          key={loc}
                          onClick={() => handleToggleLocation(loc)}
                          className={`p-2 rounded-xl text-xs font-medium border text-left flex items-center gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50 border-[#EE1D45] text-[#EE1D45] font-bold'
                              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected
                                ? 'bg-[#EE1D45] border-[#EE1D45] text-white'
                                : 'border-zinc-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{loc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. CTA Settings & Urgency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-600 block mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) =>
                        setFormData({ ...formData, ctaText: e.target.value })
                      }
                      placeholder="Start a Project / Claim Offer"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-600 block mb-1">
                      Button Action
                    </label>
                    <select
                      value={formData.ctaAction}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ctaAction: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45]"
                    >
                      <option value="start_project">Open Start a Project Modal</option>
                      <option value="whatsapp">Direct WhatsApp Chat</option>
                      <option value="custom_url">External Custom Link</option>
                    </select>
                  </div>
                </div>

                {formData.ctaAction === 'custom_url' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-600 block mb-1">
                      Custom URL
                    </label>
                    <input
                      type="url"
                      value={formData.ctaUrl || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, ctaUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono focus:outline-none focus:border-[#EE1D45]"
                    />
                  </div>
                )}

                {/* Additional Badges & Terms */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-600 block mb-1">
                      Urgency / Availability Badge
                    </label>
                    <input
                      type="text"
                      value={formData.limitedSlotsBadge || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, limitedSlotsBadge: e.target.value })
                      }
                      placeholder="e.g. Only 3 Slots Left Today"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-600 block mb-1">
                      Promo Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.promoCode || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. GIZMO38"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono font-bold focus:outline-none focus:border-[#EE1D45]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">
                    Terms &amp; Conditions Footnote (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.terms || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, terms: e.target.value })
                    }
                    placeholder="e.g. Valid for standard single layout commercial posters."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-600 focus:outline-none focus:border-[#EE1D45]"
                  />
                </div>
              </div>

              {/* Right Column: Interactive Live Preview Sticky Box */}
              <div className="hidden lg:block lg:col-span-5">
                <div className="sticky top-0 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Real-Time Card Preview</span>
                  </div>

                  <PublicOfferCard offer={formData} />

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Automatic Date Rules</span>
                    </div>
                    <p>
                      Today is evaluated automatically against the start and end date. If start date is future, it shows as <strong>Scheduled</strong>. If expired, it archives gracefully.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold shadow-md shadow-[#EE1D45]/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Create Offer'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

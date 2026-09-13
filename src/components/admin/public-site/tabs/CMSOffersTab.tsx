import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Calendar,
  Clock,
  Tag,
  Edit2,
  Trash2,
  Copy,
  Percent,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { PublicSiteOffer, PublicSiteOfferStatus } from '../../../../types';
import { getOfferComputedStatus } from '../../../../services/publicSiteCmsService';

interface CMSOffersTabProps {
  offers: PublicSiteOffer[];
  onAddOffer: () => void;
  onEditOffer: (offer: PublicSiteOffer) => void;
  onDeleteOffer: (offerId: string) => void;
  onDuplicateOffer: (offer: PublicSiteOffer) => void;
  onToggleActive: (offerId: string) => void;
  onExtendDate: (offerId: string) => void;
}

export const CMSOffersTab: React.FC<CMSOffersTabProps> = ({
  offers,
  onAddOffer,
  onEditOffer,
  onDeleteOffer,
  onDuplicateOffer,
  onToggleActive,
  onExtendDate,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOffers = offers.filter((o) => {
    if (filterStatus === 'all') return true;
    const computed = getOfferComputedStatus(o);
    return computed.toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusBadge = (status: PublicSiteOfferStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Active (Live)</span>
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3" />
            <span>Scheduled</span>
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 text-zinc-700 border border-zinc-300">
            <span>Expired</span>
          </span>
        );
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span>Draft / Inactive</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#EE1D45] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Special Offers &amp; Highlights Management
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Automated date control ensures offers activate and expire automatically without manual intervention.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddOffer}
          className="px-5 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Special Offer</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Offers (${offers.length})` },
          {
            id: 'active',
            label: `Active (${offers.filter((o) => getOfferComputedStatus(o) === 'Active').length})`,
          },
          {
            id: 'scheduled',
            label: `Scheduled (${offers.filter((o) => getOfferComputedStatus(o) === 'Scheduled').length})`,
          },
          {
            id: 'expired',
            label: `Expired (${offers.filter((o) => getOfferComputedStatus(o) === 'Expired').length})`,
          },
          {
            id: 'draft',
            label: `Drafts (${offers.filter((o) => getOfferComputedStatus(o) === 'Draft').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Offer Cards List */}
      {filteredOffers.length === 0 ? (
        <div className="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Tag className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-800">No offers in this view</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Create an offer or adjust your filter to manage promotional highlights.
          </p>
          <button
            type="button"
            onClick={onAddOffer}
            className="px-4 py-2 rounded-xl bg-[#EE1D45] text-white text-xs font-bold shadow-xs hover:bg-[#D8143C]"
          >
            + Create New Offer
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const status = getOfferComputedStatus(offer);

            return (
              <div
                key={offer.id}
                className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4 transition hover:border-[#EE1D45]/30"
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getStatusBadge(status)}

                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EE1D45] px-2 py-0.5 rounded bg-rose-50 border border-rose-100">
                      {offer.shortLabel || 'SPECIAL OFFER'}
                    </span>

                    {offer.category && (
                      <span className="text-xs text-zinc-500 font-medium">
                        • {offer.category}
                      </span>
                    )}

                    {offer.promoCode && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                        CODE: {offer.promoCode}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {status === 'Expired' && (
                      <button
                        type="button"
                        onClick={() => onExtendDate(offer.id)}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Extend 30 days"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Extend +30d</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onToggleActive(offer.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        offer.isActive
                          ? 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                          : 'border-zinc-300 bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {offer.isActive ? 'Active' : 'Disabled'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateOffer(offer)}
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditOffer(offer)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete offer "${offer.title}"?`)) {
                          onDeleteOffer(offer.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-2">
                    <h4 className="text-base font-bold text-zinc-950 leading-snug">
                      {offer.title}
                    </h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {offer.description}
                    </p>

                    {offer.limitedSlotsBadge && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                        <Clock className="w-3 h-3" />
                        <span>{offer.limitedSlotsBadge}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="md:col-span-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        Pricing Structure
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-black font-mono text-zinc-950">
                          {offer.currency}
                          {offer.offerPrice.toLocaleString('en-IN')}
                        </span>
                        {offer.originalPrice > offer.offerPrice && (
                          <span className="text-xs text-zinc-400 line-through font-mono">
                            {offer.currency}
                            {offer.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                        {offer.discount && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EE1D45] text-white">
                            {offer.discount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-200 mt-2">
                      CTA: <strong>{offer.ctaText || 'Start a Project'}</strong> ({offer.ctaAction})
                    </div>
                  </div>
                </div>

                {/* Footer Info: Display Locations & Date Window */}
                <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-zinc-600">Active Locations:</span>
                    {offer.displayLocations.map((loc) => (
                      <span
                        key={loc}
                        className="px-2 py-0.5 rounded bg-zinc-100 text-[10px] text-zinc-700 font-medium"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span>
                      From: <strong>{offer.startDate || 'Immediate'}</strong>
                    </span>
                    <span>
                      To: <strong>{offer.endDate || 'No expiration'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

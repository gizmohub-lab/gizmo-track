import React from 'react';
import {
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Percent,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { PublicSiteOffer } from '../../types';

interface PublicOfferCardProps {
  offer: PublicSiteOffer;
  onClaimOffer?: (offer: PublicSiteOffer) => void;
  variant?: 'light' | 'dark' | 'compact';
  className?: string;
}

export const PublicOfferCard: React.FC<PublicOfferCardProps> = ({
  offer,
  onClaimOffer,
  variant = 'light',
  className = '',
}) => {
  const isDark = variant === 'dark';

  const handleAction = () => {
    if (offer.ctaAction === 'whatsapp') {
      const text = encodeURIComponent(
        `Hello Gizmo Design! I am interested in claiming the offer: "${offer.title}" (${offer.currency}${offer.offerPrice}). Please share the next steps!`
      );
      window.open(`https://wa.me/919845879017?text=${text}`, '_blank');
      return;
    }

    if (offer.ctaAction === 'custom_url' && offer.ctaUrl) {
      window.open(offer.ctaUrl, '_blank');
      return;
    }

    if (onClaimOffer) {
      onClaimOffer(offer);
    }
  };

  const discountPercent =
    offer.discount ||
    (offer.originalPrice > offer.offerPrice
      ? `${Math.round(((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100)}% OFF`
      : undefined);

  if (variant === 'compact') {
    return (
      <div
        className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-white'
            : 'bg-white border-zinc-200/90 text-zinc-900 shadow-2xs'
        } ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center shrink-0 mt-0.5">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#EE1D45]">
                {offer.shortLabel || 'SPECIAL OFFER'}
              </span>
              {discountPercent && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#EE1D45] text-white">
                  {discountPercent}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold mt-0.5">{offer.title}</h4>
            <p className="text-xs text-zinc-500 line-clamp-1">{offer.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
          <div className="text-right">
            {offer.originalPrice > offer.offerPrice && (
              <span className="text-xs text-zinc-400 line-through mr-1.5">
                {offer.currency}
                {offer.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-base font-black text-zinc-950 font-mono">
              {offer.currency}
              {offer.offerPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAction}
            className="px-4 py-2 rounded-lg bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{offer.ctaText || 'Claim'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative group hover:shadow-lg hover:-translate-y-0.5 ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-800 text-white'
          : 'bg-white border-zinc-200/90 text-zinc-900 shadow-xs'
      } ${className}`}
    >
      {/* Decorative top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#EE1D45] via-rose-400 to-[#EE1D45]" />

      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EE1D45]/10 text-[#EE1D45] border border-[#EE1D45]/20">
              <Sparkles className="w-3 h-3" />
              <span>{offer.shortLabel || 'SPECIAL OFFER'}</span>
            </span>

            {offer.category && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {offer.category}
              </span>
            )}
          </div>

          {discountPercent && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#EE1D45] text-white shadow-2xs">
              {discountPercent}
            </span>
          )}
        </div>

        {/* Title and Description */}
        <div>
          <h3
            className={`text-lg sm:text-xl font-black tracking-tight leading-snug group-hover:text-[#EE1D45] transition-colors ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}
          >
            {offer.title}
          </h3>
          <p
            className={`text-xs sm:text-sm mt-2 leading-relaxed ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            {offer.description}
          </p>
        </div>

        {/* Urgency Badge (if provided) */}
        {offer.limitedSlotsBadge && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-200/80 dark:border-amber-900/60">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{offer.limitedSlotsBadge}</span>
          </div>
        )}

        {/* Promo Code tag if present */}
        {offer.promoCode && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">Use code:</span>
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-[#EE1D45] border border-dashed border-[#EE1D45]/40 select-all">
              {offer.promoCode}
            </span>
          </div>
        )}
      </div>

      {/* Pricing & CTA Footer */}
      <div
        className={`p-5 sm:p-6 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark ? 'border-zinc-800/80 bg-zinc-950/40' : 'border-zinc-100 bg-zinc-50/50'
        }`}
      >
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
            Offer Price
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}
            >
              {offer.currency}
              {offer.offerPrice.toLocaleString('en-IN')}
            </span>
            {offer.originalPrice > offer.offerPrice && (
              <span className="text-sm font-medium text-zinc-400 line-through font-mono">
                {offer.currency}
                {offer.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAction}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] active:bg-[#B80D30] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#EE1D45]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
        >
          {offer.ctaAction === 'whatsapp' ? (
            <>
              <MessageCircle className="w-4 h-4" />
              <span>{offer.ctaText || 'Claim via WhatsApp'}</span>
            </>
          ) : (
            <>
              <span>{offer.ctaText || 'Start a Project'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Terms footnote if present */}
      {offer.terms && (
        <div
          className={`px-5 py-2 text-[10px] text-zinc-400 border-t ${
            isDark ? 'border-zinc-900 bg-zinc-950' : 'border-zinc-100 bg-white'
          }`}
        >
          * {offer.terms}
        </div>
      )}
    </div>
  );
};

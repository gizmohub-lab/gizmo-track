import React from 'react';
import {
  Globe,
  Sparkles,
  Rocket,
  Eye,
  Plus,
  Calendar,
  Layers,
  Palette,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  PublicSiteContentData,
  PublicSiteOffer,
  PublicSiteService,
  PublicSiteWorkItem,
  PublicSiteMediaItem,
  PublicSiteMeta,
} from '../../../../types';
import { getOfferComputedStatus } from '../../../../services/publicSiteCmsService';

interface CMSOverviewTabProps {
  content: PublicSiteContentData;
  offers: PublicSiteOffer[];
  services: PublicSiteService[];
  workItems: PublicSiteWorkItem[];
  media: PublicSiteMediaItem[];
  meta: PublicSiteMeta;
  onNavigateTab: (tabId: string) => void;
  onOpenOfferModal: () => void;
  onOpenServiceModal: () => void;
  onOpenWorkModal: () => void;
  onOpenMediaModal: () => void;
  onOpenPublishModal: () => void;
  onPreviewPublicSite: () => void;
}

export const CMSOverviewTab: React.FC<CMSOverviewTabProps> = ({
  content,
  offers,
  services,
  workItems,
  media,
  meta,
  onNavigateTab,
  onOpenOfferModal,
  onOpenServiceModal,
  onOpenWorkModal,
  onOpenMediaModal,
  onOpenPublishModal,
  onPreviewPublicSite,
}) => {
  const activeOffersCount = offers.filter(
    (o) => getOfferComputedStatus(o) === 'Active'
  ).length;

  const scheduledOffersCount = offers.filter(
    (o) => getOfferComputedStatus(o) === 'Scheduled'
  ).length;

  const visibleServicesCount = services.filter((s) => s.isVisible).length;
  const visibleWorkCount = workItems.filter((w) => w.isVisible).length;

  return (
    <div className="space-y-6">
      {/* Status Bar / Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-zinc-800">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EE1D45] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white tracking-tight">
                Gizmo Public Site Control Center
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  meta.hasUnpublishedChanges
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {meta.hasUnpublishedChanges
                  ? 'Draft Revisions Pending'
                  : 'Live & Synchronized'}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                v{meta.publishedVersion || 1}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live website: <span className="text-zinc-300 font-medium">https://gizmo-track.vercel.app/</span> · Last published:{' '}
              {meta.lastPublishedAt
                ? new Date(meta.lastPublishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Initial default state'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPreviewPublicSite}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-zinc-700"
          >
            <Eye className="w-4 h-4 text-zinc-400" />
            <span>Preview Website</span>
          </button>

          <button
            type="button"
            onClick={onOpenPublishModal}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
              meta.hasUnpublishedChanges
                ? 'bg-[#EE1D45] hover:bg-[#D8143C] text-white shadow-[#EE1D45]/30 animate-pulse'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Active Offers */}
        <div
          onClick={() => onNavigateTab('offers')}
          className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-[#EE1D45]/40 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Offers
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#EE1D45] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-zinc-950 font-mono">
              {activeOffersCount}
            </span>
            <span className="text-[10px] text-zinc-400">Live</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 flex items-center gap-1 group-hover:text-[#EE1D45] transition">
            <span>{scheduledOffersCount} scheduled</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* 2. Services */}
        <div
          onClick={() => onNavigateTab('services')}
          className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-[#EE1D45]/40 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Services
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-zinc-950 font-mono">
              {visibleServicesCount}
            </span>
            <span className="text-[10px] text-zinc-400">Public</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 flex items-center gap-1 group-hover:text-[#EE1D45] transition">
            <span>Manage specs</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* 3. Showcase Work */}
        <div
          onClick={() => onNavigateTab('work')}
          className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-[#EE1D45]/40 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Portfolio
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Palette className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-zinc-950 font-mono">
              {visibleWorkCount}
            </span>
            <span className="text-[10px] text-zinc-400">Works</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 flex items-center gap-1 group-hover:text-[#EE1D45] transition">
            <span>Curated items</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* 4. Stats Counter */}
        <div
          onClick={() => onNavigateTab('content')}
          className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-[#EE1D45]/40 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Statistics
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-zinc-950 font-mono">
              {content.stats.filter((s) => s.isVisible).length}
            </span>
            <span className="text-[10px] text-zinc-400">Counters</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 flex items-center gap-1 group-hover:text-[#EE1D45] transition">
            <span>Edit metrics</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* 5. Media Vault */}
        <div
          onClick={() => onNavigateTab('media')}
          className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-[#EE1D45]/40 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Media
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-zinc-950 font-mono">
              {media.length}
            </span>
            <span className="text-[10px] text-zinc-400">Assets</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 flex items-center gap-1 group-hover:text-[#EE1D45] transition">
            <span>Media vault</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* 6. Pages Managed */}
        <div
          onClick={() => onNavigateTab('content')}
          className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-[#EE1D45]/40 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Pages
            </span>
            <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-zinc-950 font-mono">5</span>
            <span className="text-[10px] text-zinc-400">Views</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 flex items-center gap-1 group-hover:text-[#EE1D45] transition">
            <span>Home, Srv, Work...</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
          <span>Quick Studio Actions</span>
          <span className="text-[11px] text-zinc-400 font-normal">
            Directly update public assets without code edits
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onOpenOfferModal}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#EE1D45] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-[#EE1D45]/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Special Offer</span>
          </button>

          <button
            type="button"
            onClick={onOpenServiceModal}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Service</span>
          </button>

          <button
            type="button"
            onClick={onOpenWorkModal}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Feature Portfolio Work</span>
          </button>

          <button
            type="button"
            onClick={onOpenMediaModal}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Upload Image / Logo</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('content')}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Edit Section Copy</span>
          </button>
        </div>
      </div>

      {/* Active Offers & Live Highlights Section */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#EE1D45]" />
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Live Offers &amp; Studio Highlights
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('offers')}
            className="text-xs font-bold text-[#EE1D45] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All ({offers.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {offers.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl space-y-2">
            <p className="text-xs text-zinc-500">No promotional offers created yet.</p>
            <button
              type="button"
              onClick={onOpenOfferModal}
              className="text-xs font-bold text-[#EE1D45] hover:underline"
            >
              + Create your first special offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.slice(0, 3).map((offer) => {
              const status = getOfferComputedStatus(offer);
              return (
                <div
                  key={offer.id}
                  className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#EE1D45] uppercase tracking-wider">
                        {offer.shortLabel || 'OFFER'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                      {offer.title}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {offer.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                    <div className="font-mono text-sm font-bold text-zinc-950">
                      {offer.currency}
                      {offer.offerPrice.toLocaleString('en-IN')}{' '}
                      {offer.originalPrice > offer.offerPrice && (
                        <span className="text-xs text-zinc-400 line-through font-normal">
                          {offer.currency}
                          {offer.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {offer.displayLocations.length} locations
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Production Protection Note */}
      <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200/90 text-xs text-zinc-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-zinc-900 block">
            Production Safe Mode Active
          </span>
          <p className="text-zinc-600 mt-0.5">
            Public Site CMS operations are isolated from director operational data. Your client database, invoices, project vaults, and notifications will never be overwritten or reset.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Rocket,
  Eye,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { PublicSiteContentData, PublicSiteMeta } from '../../../../types';

interface CMSPreviewPublishTabProps {
  draftContent: PublicSiteContentData;
  publishedContent: PublicSiteContentData;
  meta: PublicSiteMeta;
  onOpenPublishModal: () => void;
  onDiscardDraft: () => void;
  onPreviewPublicSite: () => void;
}

export const CMSPreviewPublishTab: React.FC<CMSPreviewPublishTabProps> = ({
  draftContent,
  publishedContent,
  meta,
  onOpenPublishModal,
  onDiscardDraft,
  onPreviewPublicSite,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#EE1D45]" />
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Deployment &amp; Publication Center
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Review changes, verify public appearance, and push drafts to the live production site.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviewPublicSite}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#EE1D45]" />
            <span>Open Interactive Preview</span>
          </button>

          <button
            type="button"
            onClick={onOpenPublishModal}
            className="px-5 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#EE1D45]/20"
          >
            <Rocket className="w-4 h-4" />
            <span>Publish Now</span>
          </button>
        </div>
      </div>

      {/* Deployment Status & Versioning Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Production Release Status
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                meta.hasUnpublishedChanges
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {meta.hasUnpublishedChanges ? 'Unpublished Revisions' : 'Live Sync Complete'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-600">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Current Live Version:</span>
              <span className="font-mono font-bold text-zinc-900">
                v{meta.publishedVersion || 1}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Last Published:</span>
              <span className="font-medium text-zinc-900">
                {meta.lastPublishedAt
                  ? new Date(meta.lastPublishedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Initial Setup'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Publisher:</span>
              <span className="font-medium text-zinc-900 truncate max-w-[200px]">
                {meta.lastPublishedBy || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Draft Revision State
            </span>
            <span className="text-xs text-zinc-400 font-mono">Working Copy</span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-600">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Pending Changes:</span>
              <span
                className={`font-bold ${
                  meta.hasUnpublishedChanges ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {meta.hasUnpublishedChanges ? 'Yes (Draft modified)' : 'None (Up to date)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Last Modified:</span>
              <span className="font-medium text-zinc-900">
                {meta.lastUpdatedAt
                  ? new Date(meta.lastUpdatedAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : '—'}
              </span>
            </div>
          </div>

          {meta.hasUnpublishedChanges && (
            <div className="pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Discard all uncommitted draft changes and revert to live version?')) {
                    onDiscardDraft();
                  }
                }}
                className="w-full py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert Draft to Live State</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Changes Comparison Snippet */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
          <History className="w-4 h-4" />
          <span>Active Hero Headlines Comparison</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Currently Live
            </div>
            <div className="text-sm font-bold text-zinc-900">
              {publishedContent.hero.headlineLine1}{' '}
              <span className="text-[#EE1D45]">
                {publishedContent.hero.headlineHighlight}
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
              {publishedContent.hero.description}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#EE1D45]/30 bg-rose-50/20 space-y-2">
            <div className="text-[10px] font-bold text-[#EE1D45] uppercase tracking-wider flex items-center justify-between">
              <span>Working Draft</span>
              {meta.hasUnpublishedChanges && <span>(Pending Deploy)</span>}
            </div>
            <div className="text-sm font-bold text-zinc-900">
              {draftContent.hero.headlineLine1}{' '}
              <span className="text-[#EE1D45]">
                {draftContent.hero.headlineHighlight}
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
              {draftContent.hero.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

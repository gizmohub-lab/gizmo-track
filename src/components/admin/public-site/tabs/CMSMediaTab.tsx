import React, { useState } from 'react';
import {
  Upload,
  Plus,
  Image as ImageIcon,
  Copy,
  Trash2,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PublicSiteMediaItem } from '../../../../types';

interface CMSMediaTabProps {
  media: PublicSiteMediaItem[];
  onUploadMedia: () => void;
  onDeleteMedia: (mediaId: string) => void;
}

export const CMSMediaTab: React.FC<CMSMediaTabProps> = ({
  media,
  onUploadMedia,
  onDeleteMedia,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMedia = media.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleCopyUrl = (item: PublicSiteMediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Public Site Media &amp; Asset Vault ({media.length})
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Store vector logos, hero photography, production machinery imagery, and showcase assets.
          </p>
        </div>

        <button
          type="button"
          onClick={onUploadMedia}
          className="px-4 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Asset</span>
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Logos', 'Banners', 'Works', 'Facility', 'General'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat.toLowerCase())}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.toLowerCase()
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-800">No media assets in this category</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Upload new brand assets to use across headers, sections, or showcase cards.
          </p>
          <button
            type="button"
            onClick={onUploadMedia}
            className="px-4 py-2 rounded-xl bg-[#EE1D45] text-white text-xs font-bold"
          >
            Upload First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xs flex flex-col justify-between group"
            >
              {/* Image Preview Container */}
              <div className="h-36 bg-zinc-100 relative flex items-center justify-center p-2 overflow-hidden border-b border-zinc-100">
                <img
                  src={item.url}
                  alt={item.altText || item.title}
                  className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-black/60 text-white backdrop-blur-xs">
                  {item.category}
                </span>
                {item.fileSize && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/90 text-zinc-700 shadow-2xs">
                    {item.fileSize}
                  </span>
                )}
              </div>

              {/* Details & Copy */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-950 truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 truncate" title={item.usageLocation}>
                    {item.usageLocation || 'Public Website'}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item)}
                    className="text-xs font-semibold text-zinc-600 hover:text-[#EE1D45] flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove asset "${item.title}"?`)) {
                        onDeleteMedia(item.id);
                      }
                    }}
                    className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-600 flex items-center gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Existing client attachments and production project files stored in the vault are isolated and strictly preserved.
        </span>
      </div>
    </div>
  );
};

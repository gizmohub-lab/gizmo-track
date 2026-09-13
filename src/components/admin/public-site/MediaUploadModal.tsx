import React, { useState, useRef } from 'react';
import { X, Check, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { PublicSiteMediaItem } from '../../../types';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mediaItem: PublicSiteMediaItem) => void;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [category, setCategory] = useState('Logos');
  const [usageLocation, setUsageLocation] = useState('Header, Footer');
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Calculate readable file size
    const kb = Math.round(file.size / 1024);
    setFileSizeStr(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    if (!altText) {
      setAltText(`Gizmo Design asset - ${file.name}`);
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      alert('Please upload an image file or paste an image URL');
      return;
    }

    const newMedia: PublicSiteMediaItem = {
      id: `med-${Date.now()}`,
      title: title || 'Studio Image Asset',
      altText: altText || 'Gizmo Design image asset',
      url: previewUrl,
      fileSize: fileSizeStr || '150 KB',
      category,
      usageLocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newMedia);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-950">
              Upload Public Site Media
            </h2>
            <p className="text-xs text-zinc-500">
              Add logos, hero banners, showcase graphics, or production photos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Upload Area */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1.5">
              Select or Drop File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 hover:border-[#EE1D45] rounded-xl p-6 text-center cursor-pointer transition bg-zinc-50/50 hover:bg-rose-50/20"
            >
              {previewUrl ? (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-zinc-200 bg-white p-1">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#EE1D45]">
                    Click to change image ({fileSizeStr})
                  </span>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-zinc-600">
                    <span className="font-bold text-[#EE1D45]">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-[10px] text-zinc-400">PNG, JPG, SVG, WebP up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Or Paste Image URL */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Or Image URL
            </label>
            <input
              type="url"
              value={previewUrl.startsWith('data:') ? '' : previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or /icon.png"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          {/* Title & Alt Text */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Asset Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Official Studio Compass Vector Logo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
              >
                <option value="Logos">Logos &amp; Marks</option>
                <option value="Banners">Banners &amp; Heros</option>
                <option value="Works">Showcase Works</option>
                <option value="Facility">Print Facility</option>
                <option value="General">General Collateral</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Usage Location
              </label>
              <input
                type="text"
                value={usageLocation}
                onChange={(e) => setUsageLocation(e.target.value)}
                placeholder="e.g. Header, Hero, Footer"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Alt Description (SEO &amp; Accessibility)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive text for accessibility..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold shadow-md shadow-[#EE1D45]/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save to Media Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

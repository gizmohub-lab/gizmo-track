import React, { useState } from 'react';
import { Save, Check, Plus, X } from 'lucide-react';
import { PublicSiteFooterConfig } from '../../../../types';

interface CMSFooterTabProps {
  footerConfig: PublicSiteFooterConfig;
  onSaveFooter: (updatedFooter: PublicSiteFooterConfig) => void;
  onOpenPublishModal: () => void;
}

export const CMSFooterTab: React.FC<CMSFooterTabProps> = ({
  footerConfig,
  onSaveFooter,
  onOpenPublishModal,
}) => {
  const [formData, setFormData] = useState<PublicSiteFooterConfig>({
    ...footerConfig,
    capabilities: [...footerConfig.capabilities],
  });
  const [newCapability, setNewCapability] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onSaveFooter(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleAddCapability = () => {
    if (!newCapability.trim()) return;
    setFormData((prev) => ({
      ...prev,
      capabilities: [...prev.capabilities, newCapability.trim()],
    }));
    setNewCapability('');
  };

  const handleRemoveCapability = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Public Website Footer Settings
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure contact addresses, GSTIN registration, capabilities catalog, and legal copyright.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved to Draft</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Draft</span>
          </button>
        </div>
      </div>

      {/* Main Details */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Studio Details &amp; Registration
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Public Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Public Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Studio Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              GSTIN Tax Identification
            </label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) =>
                setFormData({ ...formData, gstin: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono font-bold"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-700 block mb-1">
            Studio Bio / Description
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-700 block mb-1">
            Copyright Line
          </label>
          <input
            type="text"
            value={formData.copyrightText}
            onChange={(e) =>
              setFormData({ ...formData, copyrightText: e.target.value })
            }
            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium"
          />
        </div>
      </div>

      {/* Capabilities List */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Studio Capabilities List
        </h4>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCapability}
            onChange={(e) => setNewCapability(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCapability();
              }
            }}
            placeholder="e.g. Backlit Star Flex Signages"
            className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs"
          />
          <button
            type="button"
            onClick={handleAddCapability}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {formData.capabilities.map((cap, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800"
            >
              <span>{cap}</span>
              <button
                type="button"
                onClick={() => handleRemoveCapability(idx)}
                className="text-zinc-400 hover:text-rose-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

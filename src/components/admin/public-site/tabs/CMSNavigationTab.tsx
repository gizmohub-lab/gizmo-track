import React, { useState } from 'react';
import { Save, Check, Plus, Trash2, Globe, ArrowUp, ArrowDown } from 'lucide-react';
import { PublicSiteContentData, PublicSiteHeaderConfig } from '../../../../types';

interface CMSNavigationTabProps {
  headerConfig: PublicSiteHeaderConfig;
  onSaveHeader: (updatedHeader: PublicSiteHeaderConfig) => void;
  onOpenPublishModal: () => void;
}

export const CMSNavigationTab: React.FC<CMSNavigationTabProps> = ({
  headerConfig,
  onSaveHeader,
  onOpenPublishModal,
}) => {
  const [formData, setFormData] = useState<PublicSiteHeaderConfig>(headerConfig);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onSaveHeader(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleToggleLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customLinks: prev.customLinks.map((link) =>
        link.id === id ? { ...link, isVisible: !link.isVisible } : link
      ),
    }));
  };

  const handleUpdateLinkLabel = (id: string, label: string) => {
    setFormData((prev) => ({
      ...prev,
      customLinks: prev.customLinks.map((link) =>
        link.id === id ? { ...link, label } : link
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Header &amp; Navigation Configuration
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure header typography, navigation links, and action buttons.
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

      {/* Brand & Subtitles */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Studio Brand Identity
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Brand Name (Primary)
            </label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) =>
                setFormData({ ...formData, brandName: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Brand Subtitle (Red Accent)
            </label>
            <input
              type="text"
              value={formData.brandSubtitle}
              onChange={(e) =>
                setFormData({ ...formData, brandSubtitle: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-[#EE1D45] focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Studio Subtitle Text
            </label>
            <input
              type="text"
              value={formData.studioSubtitle}
              onChange={(e) =>
                setFormData({ ...formData, studioSubtitle: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45]"
            />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Navigation Links
        </h4>

        <div className="space-y-2">
          {formData.customLinks.map((link) => (
            <div
              key={link.id}
              className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleUpdateLinkLabel(link.id, e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-bold w-44 bg-white"
                />
                <span className="text-xs text-zinc-400 font-mono">
                  Route: /{link.route}
                </span>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={link.isVisible}
                  onChange={() => handleToggleLink(link.id)}
                  className="w-4 h-4 rounded text-[#EE1D45]"
                />
                <span>Visible</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Header Action Buttons */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Header Action Buttons
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              WhatsApp Button Text
            </label>
            <input
              type="text"
              value={formData.whatsappText}
              onChange={(e) =>
                setFormData({ ...formData, whatsappText: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Director CRM Button Text
            </label>
            <input
              type="text"
              value={formData.directorCrmText}
              onChange={(e) =>
                setFormData({ ...formData, directorCrmText: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Start a Project Button Text
            </label>
            <input
              type="text"
              value={formData.startProjectText}
              onChange={(e) =>
                setFormData({ ...formData, startProjectText: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-[#EE1D45]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Check,
  Save,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Workflow,
  Info,
  Layers,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import {
  PublicSiteContentData,
  PublicSiteStatItem,
  PublicSiteWorkflowItem,
} from '../../../../types';

interface CMSContentTabProps {
  content: PublicSiteContentData;
  onSaveContent: (updatedContent: PublicSiteContentData) => void;
  onOpenPublishModal: () => void;
}

export const CMSContentTab: React.FC<CMSContentTabProps> = ({
  content,
  onSaveContent,
  onOpenPublishModal,
}) => {
  const [formData, setFormData] = useState<PublicSiteContentData>(content);
  const [activeSection, setActiveSection] = useState<
    'hero' | 'stats' | 'workflow' | 'about' | 'cta' | 'general'
  >('hero');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onSaveContent(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // Stat item helpers
  const handleUpdateStat = (id: string, field: keyof PublicSiteStatItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const handleAddStat = () => {
    const newStat: PublicSiteStatItem = {
      id: `stat-${Date.now()}`,
      value: '100+',
      label: 'New Metric Label',
      isHighlighted: false,
      orderIndex: formData.stats.length + 1,
      isVisible: true,
    };
    setFormData((prev) => ({
      ...prev,
      stats: [...prev.stats, newStat],
    }));
  };

  const handleRemoveStat = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((s) => s.id !== id),
    }));
  };

  // Workflow step helpers
  const handleUpdateWorkflow = (
    id: string,
    field: keyof PublicSiteWorkflowItem,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      workflow: prev.workflow.map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'hero', label: 'Hero Section' },
            { id: 'stats', label: 'Statistics' },
            { id: 'workflow', label: 'Workflow (01-04)' },
            { id: 'about', label: 'About Story' },
            { id: 'cta', label: 'Call to Action' },
            { id: 'general', label: 'Studio Info' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-[#EE1D45] text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Draft Saved</span>
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

      {/* 1. HERO SECTION */}
      {activeSection === 'hero' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Hero Section Copy &amp; Actions
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              The first impression of the Gizmo public website above the fold.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Top Eyebrow Badge Text
              </label>
              <input
                type="text"
                value={formData.hero.badgeText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, badgeText: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold focus:outline-none focus:border-[#EE1D45]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Headline Line 1 (Dark Text)
                </label>
                <input
                  type="text"
                  value={formData.hero.headlineLine1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, headlineLine1: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-black focus:outline-none focus:border-[#EE1D45]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Headline Highlight (Red/Accent Text)
                </label>
                <input
                  type="text"
                  value={formData.hero.headlineHighlight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, headlineHighlight: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-black text-[#EE1D45] focus:outline-none focus:border-[#EE1D45]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Lead Description Paragraph
              </label>
              <textarea
                rows={3}
                value={formData.hero.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, description: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs leading-relaxed focus:outline-none focus:border-[#EE1D45]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={formData.hero.primaryCtaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, primaryCtaText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold focus:outline-none focus:border-[#EE1D45]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={formData.hero.secondaryCtaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, secondaryCtaText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold focus:outline-none focus:border-[#EE1D45]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Client Portal Button Text
                </label>
                <input
                  type="text"
                  value={formData.hero.tertiaryCtaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, tertiaryCtaText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold focus:outline-none focus:border-[#EE1D45]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATISTICS SECTION */}
      {activeSection === 'stats' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
                Homepage Statistics &amp; Metrics
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Proof points displayed directly beneath the hero section.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddStat}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#EE1D45] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Metric</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formData.stats.map((stat, idx) => (
              <div
                key={stat.id}
                className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400">
                    Stat #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(stat.id)}
                    className="text-zinc-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block mb-1">
                    Value (e.g. 450+, 24–48h)
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) =>
                      handleUpdateStat(stat.id, 'value', e.target.value)
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-base font-black font-mono focus:outline-none focus:border-[#EE1D45]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) =>
                      handleUpdateStat(stat.id, 'label', e.target.value)
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stat.isHighlighted}
                      onChange={(e) =>
                        handleUpdateStat(stat.id, 'isHighlighted', e.target.checked)
                      }
                      className="w-3.5 h-3.5 rounded text-[#EE1D45]"
                    />
                    <span>Red Accent</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stat.isVisible}
                      onChange={(e) =>
                        handleUpdateStat(stat.id, 'isVisible', e.target.checked)
                      }
                      className="w-3.5 h-3.5 rounded text-[#EE1D45]"
                    />
                    <span>Visible</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WORKFLOW STEPS */}
      {activeSection === 'workflow' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Client Engagement Workflow (01–04)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Defines the transparent 4-stage process displayed on the homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.workflow.map((step) => (
              <div
                key={step.id}
                className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                    {step.stepNumber}
                  </span>
                  <input
                    type="text"
                    value={step.badge || ''}
                    onChange={(e) =>
                      handleUpdateWorkflow(step.id, 'badge', e.target.value)
                    }
                    placeholder="Badge e.g. Immediate Review"
                    className="px-2 py-1 rounded text-[11px] font-bold bg-white border border-zinc-300 text-[#EE1D45] w-36 text-right"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Step Title
                  </label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) =>
                      handleUpdateWorkflow(step.id, 'title', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Step Description
                  </label>
                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) =>
                      handleUpdateWorkflow(step.id, 'description', e.target.value)
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ABOUT STORY */}
      {activeSection === 'about' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              About Gizmo Studio Narrative
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              The studio ethos, manufacturing infrastructure, and credentials.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Badge Header
              </label>
              <input
                type="text"
                value={formData.about.badgeText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    about: { ...formData.about, badgeText: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Headline
              </label>
              <input
                type="text"
                value={formData.about.headline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    about: { ...formData.about, headline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Story Paragraph 1
              </label>
              <textarea
                rows={3}
                value={formData.about.storyP1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    about: { ...formData.about, storyP1: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Story Paragraph 2
              </label>
              <textarea
                rows={3}
                value={formData.about.storyP2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    about: { ...formData.about, storyP2: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Location Text
                </label>
                <input
                  type="text"
                  value={formData.about.locationText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, locationText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Experience Years Badge
                </label>
                <input
                  type="text"
                  value={formData.about.experienceYears}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, experienceYears: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-[#EE1D45]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CALL TO ACTION */}
      {activeSection === 'cta' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Bottom Call to Action Banner
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              The high-conversion closing block at the bottom of public pages.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Headline
              </label>
              <input
                type="text"
                value={formData.cta.headline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cta: { ...formData.cta, headline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.cta.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cta: { ...formData.cta, description: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={formData.cta.primaryCtaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cta: { ...formData.cta, primaryCtaText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  WhatsApp Button Text
                </label>
                <input
                  type="text"
                  value={formData.cta.whatsappCtaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cta: { ...formData.cta, whatsappCtaText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. GENERAL STUDIO INFO */}
      {activeSection === 'general' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Studio Contact &amp; Brand Settings
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Phone numbers, WhatsApp destination, studio address, and brand color.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                WhatsApp Phone Number (with Country Code)
              </label>
              <input
                type="text"
                value={formData.general.whatsappNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, whatsappNumber: e.target.value },
                  })
                }
                placeholder="+919845879017"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.general.contactPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, contactPhone: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Studio Email Address
              </label>
              <input
                type="email"
                value={formData.general.contactEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, contactEmail: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Studio Physical Address
              </label>
              <input
                type="text"
                value={formData.general.businessAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, businessAddress: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Draft Floating or Bottom Bar */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
        <div className="text-xs text-zinc-500">
          Save your modifications to draft, then click <strong>Publish Changes</strong> whenever you are ready to make them live.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save to Draft</span>
          </button>
          <button
            type="button"
            onClick={onOpenPublishModal}
            className="px-5 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Publish Live</span>
          </button>
        </div>
      </div>
    </div>
  );
};

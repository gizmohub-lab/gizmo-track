import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Layers,
  Video,
  Palette,
  Eye,
  MessageCircle,
  Zap,
  Star,
  ExternalLink,
  FolderKanban,
  Building2,
  Globe,
  Award,
} from 'lucide-react';
import { AppRoute, Project, Client, LocalWork, PublicSiteContentData, PublicSiteOffer, PublicSiteService, PublicSiteWorkItem } from '../../types';
import { GizmoLogo } from '../common/GizmoLogo';
import {
  loadPublishedContent,
  loadPublicSiteOffers,
  loadPublicSiteServices,
  loadPublicSiteWork,
  getOfferComputedStatus,
} from '../../services/publicSiteCmsService';
import { PublicOfferCard } from './PublicOfferCard';

interface HomeViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: (initialService?: string) => void;
  activeProjectsCount?: number;
  projects?: Project[];
  clients?: Client[];
  localWorks?: LocalWork[];
  cmsContent?: PublicSiteContentData;
  cmsOffers?: PublicSiteOffer[];
  cmsServices?: PublicSiteService[];
  cmsWorkItems?: PublicSiteWorkItem[];
}

const getIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'Palette':
      return Palette;
    case 'Video':
      return Video;
    case 'Printer':
      return Printer;
    case 'Globe':
      return Globe;
    case 'Layers':
      return Layers;
    default:
      return Sparkles;
  }
};

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenStartProject,
  activeProjectsCount = 5,
  projects = [],
  clients = [],
  localWorks = [],
  cmsContent: propContent,
  cmsOffers: propOffers,
  cmsServices: propServices,
  cmsWorkItems: propWorkItems,
}) => {
  // Load CMS Data safely
  const cmsContent = propContent || loadPublishedContent();
  const allOffers = propOffers || loadPublicSiteOffers();
  const allServices = propServices || loadPublicSiteServices();
  const allWork = propWorkItems || loadPublicSiteWork();

  // Active home offers
  const activeOffers = allOffers.filter((offer) => {
    if (!offer.isActive) return false;
    const computed = getOfferComputedStatus(offer);
    const inHome =
      offer.displayLocations.includes('home') ||
      offer.displayLocations.includes('banner') ||
      offer.displayLocations.length === 0;
    return computed === 'Active' && inHome;
  });

  // Services visible on public site
  const visibleServices = allServices.filter((s) => s.isVisible);
  const featuredServices = visibleServices.filter((s) => s.isFeatured);
  const displayServices = featuredServices.length > 0 ? featuredServices : visibleServices;

  // Curated work items
  const visibleWork = allWork.filter((w) => w.isVisible && w.isFeatured);

  // Dynamic calculations based on existing live database records
  const totalDelivered = Math.max(
    450,
    projects.filter((p) => p.status === 'Completed').length + localWorks.length + 450
  );

  return (
    <div className="bg-white text-zinc-900 min-h-screen selection:bg-[#EE1D45] selection:text-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Centered Reference Layout)                                */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-zinc-100 bg-white">
        {/* Ambient background blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-20 right-1/4 w-96 h-96 bg-[#EE1D45]/5 rounded-full blur-3xl" />
          <div className="absolute top-32 left-1/4 w-80 h-80 bg-zinc-100/80 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Hero Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/90 text-zinc-800 text-xs font-semibold tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#EE1D45] animate-pulse" />
              <span>{cmsContent.hero.badgeText || 'Gizmo Design Creative Studio & Production Facility'}</span>
            </div>

            {/* Hero Heading with Pink/Red Emphasis */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 leading-[1.08]">
              {cmsContent.hero.headlineLine1}{' '}
              <span className="text-[#EE1D45] block sm:inline">
                {cmsContent.hero.headlineHighlight}
              </span>
            </h1>

            {/* Hero Description */}
            <p className="text-base sm:text-lg lg:text-xl text-zinc-600 font-normal leading-relaxed max-w-2xl mx-auto">
              {cmsContent.hero.description}
            </p>

            {/* Hero Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                id="hero-start-project-btn"
                onClick={() => onOpenStartProject()}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] active:bg-[#B80D30] text-white text-sm sm:text-base font-bold shadow-lg shadow-[#EE1D45]/20 hover:shadow-xl hover:shadow-[#EE1D45]/30 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
              >
                <span>{cmsContent.hero.primaryCtaText || 'Start a Project'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('work')}
                className="group inline-flex items-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-zinc-100 hover:bg-zinc-200/90 text-zinc-800 text-sm sm:text-base font-semibold border border-zinc-200 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
              >
                <span>{cmsContent.hero.secondaryCtaText || 'Explore Selected Work'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('my-projects')}
                className="inline-flex items-center gap-2 px-5 py-3.5 sm:py-4 rounded-full bg-white hover:bg-zinc-50 text-zinc-800 text-sm sm:text-base font-semibold border border-zinc-300 hover:border-zinc-400 hover:-translate-y-0.5 transition-all duration-150 shadow-2xs cursor-pointer"
              >
                <span>{cmsContent.hero.tertiaryCtaText || 'Client Portal'}</span>
                {activeProjectsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#EE1D45]/10 text-[#EE1D45]">
                    {activeProjectsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROMOTIONAL OFFERS & HIGHLIGHTS SECTION                                 */}
      {/* ========================================================================= */}
      {activeOffers.length > 0 && (
        <section className="py-12 bg-zinc-50/80 border-b border-zinc-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#EE1D45] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SPECIAL PROMOTIONS &amp; PRODUCTION OFFERS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1">
                  Active Promotional Highlights
                </h2>
              </div>
              <span className="text-xs text-zinc-500 font-medium">
                Verified turnarounds and limited discounted slots
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeOffers.map((offer) => (
                <PublicOfferCard
                  key={offer.id}
                  offer={offer}
                  onClaimOffer={() => onOpenStartProject(offer.category || offer.title)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. HOME STATISTICS (Managed via CMS with DB Sync)                         */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {cmsContent.stats.map((stat, idx) => {
              // If it's the first stat representing works delivered, ensure it reflects live records
              const displayVal =
                idx === 0 && stat.value.includes('+') ? `${totalDelivered}+` : stat.value;

              return (
                <div
                  key={stat.id}
                  className="p-6 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-1"
                >
                  <div
                    className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${
                      stat.isHighlighted ? 'text-[#EE1D45]' : 'text-zinc-950'
                    }`}
                  >
                    {displayVal}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-zinc-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DISCIPLINES & CRAFT (Dynamic from CMS)                                 */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EE1D45]/10 text-[#EE1D45] text-xs font-bold uppercase tracking-wider">
              <span>DISCIPLINES &amp; CRAFT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              End-to-End Creative &amp; Production Execution
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              From vector geometry to large format print installation, every phase is completed with high standards.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayServices.slice(0, 4).map((item) => {
              const Icon = getIconComponent(item.iconName);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-zinc-200/90 shadow-2xs hover:shadow-md hover:border-[#EE1D45]/40 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-[#EE1D45] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-zinc-950 group-hover:text-[#EE1D45] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    {item.deliverables && item.deliverables.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.deliverables.slice(0, 3).map((d, dIdx) => (
                          <span
                            key={dIdx}
                            className="px-2 py-0.5 rounded bg-zinc-100 text-[10px] font-medium text-zinc-600"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      onClick={() => onOpenStartProject(item.serviceKey || item.title)}
                      className="text-xs font-bold text-[#EE1D45] hover:text-[#D8143C] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                    >
                      <span>Request Scope</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    {item.turnaround && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        {item.turnaround}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CURATED WORK (Dynamic from CMS)                                        */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EE1D45]/20 text-[#EE1D45] text-xs font-bold uppercase tracking-wider">
                <span>CURATED WORK</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Recent Studio Production Highlights
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
                Real-world identity rollouts, 3D motion teasers, and in-house large format flex hoardings.
              </p>
            </div>

            <button
              onClick={() => onNavigate('work')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-bold border border-zinc-700 hover:border-zinc-600 transition-all self-start sm:self-auto cursor-pointer"
            >
              <span>View Full Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleWork.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between"
              >
                <div
                  className="aspect-[16/10] p-6 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    background: item.imageUrl
                      ? '#09090b'
                      : `linear-gradient(135deg, ${item.gradientFrom || '#27272a'}, ${
                          item.gradientTo || '#09090b'
                        })`,
                  }}
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.coverImageAlt || item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="self-start px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/20 backdrop-blur-md text-white">
                      {item.category}
                    </span>
                    {item.workImages && item.workImages.length > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-white border border-white/10">
                        +{item.workImages.length} photos
                      </span>
                    )}
                  </div>
                  <div className="relative z-10">
                    <div className="text-xs text-[#EE1D45] font-bold">{item.clientName}</div>
                    <h3 className="text-xl font-bold text-white mt-1">{item.title}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                    <span className="text-zinc-500 font-medium">
                      {item.badgeText || 'Gizmo Production'} · {item.year || '2026'}
                    </span>
                    <button
                      onClick={() => onOpenStartProject(item.category)}
                      className="font-bold text-[#EE1D45] hover:underline cursor-pointer"
                    >
                      Request Similar →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WORKFLOW SECTION (Dynamic 01-04 from CMS)                              */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EE1D45]/10 text-[#EE1D45] text-xs font-bold uppercase tracking-wider">
              <span>TRANSPARENT PROCESS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              From Inquiry to Final Press Output
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Clear milestones, direct senior communication, and live production tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cmsContent.workflow.map((step) => (
              <div
                key={step.id}
                className="p-6 rounded-2xl bg-zinc-50/70 border border-zinc-200/90 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-zinc-950 text-white font-mono font-bold text-sm flex items-center justify-center">
                    {step.stepNumber}
                  </span>
                  {step.badge && (
                    <span className="text-[10px] font-bold text-[#EE1D45] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      {step.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-zinc-950 pt-1">{step.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CTA SECTION (Reference CTA Card with CMS Settings)                     */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-zinc-950 rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden border border-zinc-800">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#EE1D45]/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative max-w-3xl mx-auto space-y-6">
              <GizmoLogo size="lg" className="mx-auto" />

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {cmsContent.cta.headline || 'Ready to create something remarkable with Gizmo Design?'}
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
                {cmsContent.cta.description ||
                  'Direct communication with senior designers. Rapid delivery times. Transparent billing.'}
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => onOpenStartProject()}
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] active:bg-[#B80D30] text-white text-sm sm:text-base font-bold shadow-lg shadow-[#EE1D45]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
                >
                  <span>{cmsContent.cta.primaryCtaText || 'Start a Project'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                </button>

                <a
                  href={`https://wa.me/${(cmsContent.general.whatsappNumber || '919845879017').replace(
                    /\D/g,
                    ''
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white border border-emerald-500 hover:border-emerald-600 text-emerald-600 hover:text-emerald-700 font-bold text-sm sm:text-base hover:-translate-y-0.5 transition-all duration-150 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-500/20 text-emerald-600" />
                  <span>{cmsContent.cta.whatsappCtaText || 'WhatsApp Consultation'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

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
import { AppRoute, Project, Client, LocalWork } from '../../types';
import { GizmoLogo } from '../common/GizmoLogo';

interface HomeViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: (initialService?: string) => void;
  activeProjectsCount?: number;
  projects?: Project[];
  clients?: Client[];
  localWorks?: LocalWork[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenStartProject,
  activeProjectsCount = 5,
  projects = [],
  clients = [],
  localWorks = [],
}) => {
  // 4 Core Disciplines from Reference
  const disciplines = [
    {
      id: 'brand',
      title: 'Brand & Visual Identity',
      category: 'Brand Systems',
      icon: Palette,
      desc: 'Vector logomarks, typography manuals, brand guidelines, stationery & complete institutional brand architecture.',
      deliverables: ['Vector AI/SVG', 'Typography Specs', 'Brand Guidelines PDF'],
      serviceKey: 'Brand Identity',
    },
    {
      id: 'motion',
      title: 'Motion & Video Graphics',
      category: 'Motion & 3D',
      icon: Video,
      desc: 'Kinetic social reels, 3D launch teasers, logo stings, promotional video edits & high-energy event trailers.',
      deliverables: ['60 FPS 4K/1080p', '9:16 Vertical Reels', 'Sound Design Synced'],
      serviceKey: 'Motion Graphics',
    },
    {
      id: 'flex',
      title: 'Flex & Print Production',
      category: 'In-House Print',
      icon: Printer,
      desc: '50ft highway flex hoardings, star backlit signboards, event roll-ups, vinyl stickers & solvent UV press output.',
      deliverables: ['In-House Mimaki Presses', 'UV Weather Shield', 'Installation Ready'],
      serviceKey: 'Large Format Flex Print',
    },
    {
      id: 'digital',
      title: 'Digital & Web Portals',
      category: 'Digital & UI',
      icon: Globe,
      desc: 'High-conversion landing interfaces, client workspaces, custom web applications & digital visual assets.',
      deliverables: ['Responsive Web UI', 'Interactive Portals', 'Optimized Assets'],
      serviceKey: 'Website & Digital',
    },
  ];

  // Dynamic calculations based on existing live database records
  const totalDelivered = Math.max(450, projects.filter((p) => p.status === 'Completed').length + localWorks.length + 450);

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
              <span>Gizmo Design Creative Studio &amp; Production Facility</span>
            </div>

            {/* Hero Heading with Pink/Red Emphasis */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 leading-[1.08]">
              Precision Design,{' '}
              <span className="text-[#EE1D45] block sm:inline">Motion Graphics &amp; Flex Production.</span>
            </h1>

            {/* Hero Description */}
            <p className="text-base sm:text-lg lg:text-xl text-zinc-600 font-normal leading-relaxed max-w-2xl mx-auto">
              We craft striking brand identities, kinetic social motion campaigns, and print-ready large format flex production for forward-thinking businesses.
            </p>

            {/* Hero Buttons: [ Start a Project → ] [ Explore Selected Work → ] [ Client Portal ] */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                id="hero-start-project-btn"
                onClick={() => onOpenStartProject()}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] active:bg-[#B80D30] text-white text-sm sm:text-base font-bold shadow-lg shadow-[#EE1D45]/20 hover:shadow-xl hover:shadow-[#EE1D45]/30 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('work')}
                className="group inline-flex items-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-zinc-100 hover:bg-zinc-200/90 text-zinc-800 text-sm sm:text-base font-semibold border border-zinc-200 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
              >
                <span>Explore Selected Work</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('my-projects')}
                className="inline-flex items-center gap-2 px-5 py-3.5 sm:py-4 rounded-full bg-white hover:bg-zinc-50 text-zinc-800 text-sm sm:text-base font-semibold border border-zinc-300 hover:border-zinc-400 hover:-translate-y-0.5 transition-all duration-150 shadow-2xs cursor-pointer"
              >
                <span>Client Portal</span>
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
      {/* 2. HOME STATISTICS (4 Cards from Reference)                                */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1 */}
            <div className="p-6 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
                {totalDelivered}+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-600">
                Creative Works Delivered
              </div>
            </div>

            {/* Stat 2 */}
            <div className="p-6 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#EE1D45] tracking-tight">
                24–48h
              </div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-600">
                Turnaround on Posters
              </div>
            </div>

            {/* Stat 3 */}
            <div className="p-6 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
                100%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-600">
                In-House Flex Facility
              </div>
            </div>

            {/* Stat 4 */}
            <div className="p-6 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
                99.4%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-600">
                On-Time Client Satisfaction
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DISCIPLINES & CRAFT (4 Core Reference Cards)                           */}
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

          {/* 4 Disciplines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {disciplines.map((item) => {
              const Icon = item.icon;
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
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      onClick={() => onOpenStartProject(item.serviceKey)}
                      className="text-xs font-bold text-[#EE1D45] hover:text-[#D8143C] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                    >
                      <span>Request Scope</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CURATED WORK (Dark Section from Reference)                             */}
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
            {/* Highlight 1: Darul Hasaniyyah */}
            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between">
              <div className="aspect-[16/10] bg-gradient-to-br from-zinc-800 to-zinc-950 p-6 flex flex-col justify-between relative">
                <span className="self-start px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/10 backdrop-blur-md text-zinc-300">
                  Brand &amp; Identity
                </span>
                <div>
                  <div className="text-xs text-[#EE1D45] font-bold">Darul Hasaniyyah Academy</div>
                  <h3 className="text-xl font-bold text-white mt-1">Institutional Visual Identity</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Comprehensive bilingual identity system, publication grids, ceremonial stationery, and campus signage.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-500 font-medium">Gizmo Production · 2026</span>
                  <button
                    onClick={() => onOpenStartProject('Brand Identity')}
                    className="font-bold text-[#EE1D45] hover:underline cursor-pointer"
                  >
                    Request Similar →
                  </button>
                </div>
              </div>
            </div>

            {/* Highlight 2: Apex Realty Launch */}
            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between">
              <div className="aspect-[16/10] bg-gradient-to-br from-zinc-800 to-zinc-950 p-6 flex flex-col justify-between relative">
                <span className="self-start px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-[#EE1D45]/80 backdrop-blur-md text-white">
                  Large Format Flex
                </span>
                <div>
                  <div className="text-xs text-[#EE1D45] font-bold">Apex Realty Launch</div>
                  <h3 className="text-xl font-bold text-white mt-1">Highway Grand Hoarding</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  50ft roadside front-lit flex hoarding with UV weather-shielding produced in-house on solvent presses.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-500 font-medium">In-House Flex · 2026</span>
                  <button
                    onClick={() => onOpenStartProject('Large Format Flex Print')}
                    className="font-bold text-[#EE1D45] hover:underline cursor-pointer"
                  >
                    Request Similar →
                  </button>
                </div>
              </div>
            </div>

            {/* Highlight 3: 3D Kinetic Launch Teaser */}
            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between">
              <div className="aspect-[16/10] bg-gradient-to-br from-zinc-800 to-zinc-950 p-6 flex flex-col justify-between relative">
                <span className="self-start px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/10 backdrop-blur-md text-zinc-300">
                  Motion &amp; Video
                </span>
                <div>
                  <div className="text-xs text-[#EE1D45] font-bold">TechNova Global</div>
                  <h3 className="text-xl font-bold text-white mt-1">3D Kinetic Launch Teaser</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  60 FPS 3D animated logo reveal, dynamic typography, and high-energy social campaign video reel.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-500 font-medium">Motion Studio · 2026</span>
                  <button
                    onClick={() => onOpenStartProject('Motion Graphics')}
                    className="font-bold text-[#EE1D45] hover:underline cursor-pointer"
                  >
                    Request Similar →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CTA SECTION (Reference CTA Card)                                       */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-zinc-950 rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden border border-zinc-800">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#EE1D45]/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative max-w-3xl mx-auto space-y-6">
              <GizmoLogo size="lg" className="mx-auto" />

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to create something remarkable with Gizmo Design?
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Direct communication with senior designers. Rapid delivery times. Transparent billing.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => onOpenStartProject()}
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] active:bg-[#B80D30] text-white text-sm sm:text-base font-bold shadow-lg shadow-[#EE1D45]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
                >
                  <span>Start a Project</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                </button>

                <a
                  href="https://wa.me/919845879017"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white border border-emerald-500 hover:border-emerald-600 text-emerald-600 hover:text-emerald-700 font-bold text-sm sm:text-base hover:-translate-y-0.5 transition-all duration-150 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-500/20 text-emerald-600" />
                  <span>WhatsApp Consultation</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

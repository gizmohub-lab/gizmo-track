import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Layers,
  Video,
  Printer,
  Palette,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Star,
} from 'lucide-react';
import { AppRoute, Project } from '../../types';

interface HomeViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: () => void;
  activeProjectsCount?: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenStartProject,
  activeProjectsCount = 3,
}) => {
  return (
    <div className="space-y-20 pb-20 pt-8 sm:pt-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Studio Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-xs font-bold text-zinc-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#FF5738] animate-pulse" />
            <span>Gizmo Design Creative Studio &amp; Production Facility</span>
          </div>

          {/* Display Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-zinc-950 tracking-tight leading-[1.08]">
              Precision Design, <span className="text-[#FF5738]">Motion Graphics</span> &amp; Flex Production.
            </h1>
            <p className="text-base sm:text-xl text-zinc-600 max-w-2xl mx-auto font-medium leading-relaxed">
              We craft striking brand identities, kinetic social motion campaigns, and print-ready
              large format flex production for forward-thinking businesses.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={onOpenStartProject}
              className="px-6 py-3.5 bg-[#FF5738] hover:bg-[#ff4220] text-white rounded-xl text-sm font-extrabold transition shadow-md shadow-[#FF5738]/20 flex items-center gap-2"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('work')}
              className="px-6 py-3.5 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-xl text-sm font-extrabold transition shadow-2xs flex items-center gap-2"
            >
              <span>Explore Selected Work</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              onClick={() => onNavigate('my-projects')}
              className="px-5 py-3.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 rounded-xl text-sm font-bold transition flex items-center gap-2"
            >
              <span>Client Portal</span>
              <span className="px-1.5 py-0.2 rounded-full text-xs font-mono bg-[#FF5738] text-white">
                {activeProjectsCount}
              </span>
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
              <div className="text-3xl font-black text-zinc-950 tracking-tight">450+</div>
              <div className="text-xs font-semibold text-zinc-500 mt-1">Creative Works Delivered</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
              <div className="text-3xl font-black text-zinc-950 tracking-tight">24–48h</div>
              <div className="text-xs font-semibold text-zinc-500 mt-1">Turnaround on Posters</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
              <div className="text-3xl font-black text-zinc-950 tracking-tight">100%</div>
              <div className="text-xs font-semibold text-zinc-500 mt-1">In-House Flex Facility</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
              <div className="text-3xl font-black text-zinc-950 tracking-tight">99.4%</div>
              <div className="text-xs font-semibold text-zinc-500 mt-1">On-Time Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES (4 PILLARS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#FF5738]">
              Disciplines &amp; Craft
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
              End-to-End Creative &amp; Production Execution
            </h2>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="text-xs font-bold text-zinc-950 hover:text-[#FF5738] transition flex items-center gap-1.5"
          >
            <span>Detailed service offerings &amp; deliverables</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Brand & Visual Identity */}
          <div
            onClick={() => onNavigate('services')}
            className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-zinc-950 group-hover:text-[#FF5738] transition-colors">
                Brand &amp; Visual Identity
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Logomarks, design systems, visual standards, stationery packs, and strategic brand positioning.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-600">
              <span>Brand Guidelines</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Card 2: Motion & Video Graphics */}
          <div
            onClick={() => onNavigate('services')}
            className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-zinc-950 group-hover:text-[#FF5738] transition-colors">
                Motion &amp; Video Graphics
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                High-energy promotional reels, kinetic typography, 3D stings, animated poster sequences, and event countdowns.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-600">
              <span>60fps Kinetic</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Card 3: Print & Flex Production */}
          <div
            onClick={() => onNavigate('services')}
            className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-zinc-950 group-hover:text-[#FF5738] transition-colors">
                Flex &amp; Print Production
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Large-format hoardings, backlit star flex, commercial vinyl banners, foam board mounting, and precision offset printing.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-600">
              <span>In-House RIP</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Card 4: Digital UI & Systems */}
          <div
            onClick={() => onNavigate('services')}
            className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-zinc-950 group-hover:text-[#FF5738] transition-colors">
                Digital &amp; Web Portals
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Interactive web applications, brand landing experiences, component libraries, and custom client portals.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-600">
              <span>React &amp; Tailwind</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED WORK SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#FF5738]">
                Curated Work
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Recent Studio Production Highlights
              </h2>
            </div>
            <button
              onClick={() => onNavigate('work')}
              className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-extrabold transition flex items-center gap-2 self-start md:self-auto"
            >
              <span>View Full Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Project 1 */}
            <div
              onClick={() => onNavigate('work')}
              className="group cursor-pointer rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-all"
            >
              <div className="h-48 bg-gradient-to-tr from-violet-950 via-zinc-900 to-zinc-800 p-6 flex flex-col justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white w-max">
                  Branding · Identity
                </span>
                <div>
                  <h4 className="text-lg font-black text-white group-hover:text-[#FF5738] transition-colors">
                    Darul Hasaniyyah Academy
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Complete institutional visual language, stationery &amp; publication format.
                  </p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80">
                <span>Completed September 2026</span>
                <span className="font-bold text-white group-hover:text-[#FF5738] flex items-center gap-1">
                  View Case →
                </span>
              </div>
            </div>

            {/* Project 2 */}
            <div
              onClick={() => onNavigate('work')}
              className="group cursor-pointer rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-all"
            >
              <div className="h-48 bg-gradient-to-tr from-purple-950 via-zinc-900 to-zinc-800 p-6 flex flex-col justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#FF5738]/20 text-[#FF5738] w-max">
                  Motion · Reel
                </span>
                <div>
                  <h4 className="text-lg font-black text-white group-hover:text-[#FF5738] transition-colors">
                    Apex Realty Launch
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    3D architectural animated walkthrough, social reels &amp; hoardings.
                  </p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80">
                <span>Completed August 2026</span>
                <span className="font-bold text-white group-hover:text-[#FF5738] flex items-center gap-1">
                  View Case →
                </span>
              </div>
            </div>

            {/* Project 3 */}
            <div
              onClick={() => onNavigate('work')}
              className="group cursor-pointer rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-all"
            >
              <div className="h-48 bg-gradient-to-tr from-emerald-950 via-zinc-900 to-zinc-800 p-6 flex flex-col justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 w-max">
                  Print · Large Format Flex
                </span>
                <div>
                  <h4 className="text-lg font-black text-white group-hover:text-[#FF5738] transition-colors">
                    Highway Grand Hoarding
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    40x20 ft high-resolution front-lit vinyl flex print with weather coating.
                  </p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80">
                <span>Completed August 2026</span>
                <span className="font-bold text-white group-hover:text-[#FF5738] flex items-center gap-1">
                  View Case →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BOTTOM DIRECT CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-zinc-100 via-white to-orange-50/40 border border-zinc-200 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Ready to create something remarkable with Gizmo Design?
            </h3>
            <p className="text-sm text-zinc-600">
              Direct communication with senior designers. Rapid delivery times. Transparent billing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenStartProject}
              className="px-6 py-3 bg-[#FF5738] hover:bg-[#ff4220] text-white rounded-xl text-xs font-black transition shadow-xs flex items-center gap-2"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://wa.me/919845879017?text=Hello%20Gizmo%20Design%2C%20I%20would%20like%20to%20consult%20on%20a%20new%20creative%20brief"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>WhatsApp Consultation</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

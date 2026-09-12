import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Layers,
  Printer,
  Video,
  Palette,
  Eye,
  Zap,
  FolderKanban,
  Building2,
  Award,
  Flame,
} from 'lucide-react';
import { AppRoute } from '../../types';

interface ServicesViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: (initialService?: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onNavigate,
  onOpenStartProject,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const services = [
    {
      id: 'logo',
      name: 'Logo Design',
      category: 'Brand',
      icon: Palette,
      desc: 'Vector logomarks, monograms, lockups and wordmarks with full scalable formats.',
      turnaround: '3–5 Days',
      deliverables: ['Vector AI/SVG/EPS', 'Color Variations', 'Social Kit', 'Brand Mark Sheet'],
    },
    {
      id: 'brand-identity',
      name: 'Brand Identity',
      category: 'Brand',
      icon: Layers,
      desc: 'Complete identity systems, typography rules, color formulas, and stationery suites.',
      turnaround: '1–2 Weeks',
      deliverables: ['Brand Manual PDF', 'Typography Specs', 'Letterhead & Business Cards', 'Asset Library'],
    },
    {
      id: 'packaging',
      name: 'Packaging Design',
      category: 'Brand',
      icon: FolderKanban,
      desc: 'Rigid gift boxes, custom pouch dielines, foil-stamped labels, and retail packaging.',
      turnaround: '5–7 Days',
      deliverables: ['3D Mockups', 'Production Dielines', 'Foil Stamping Specs', 'Press Ready PDF'],
    },
    {
      id: 'poster',
      name: 'Poster & Key Visuals',
      category: 'Design',
      icon: Flame,
      desc: 'High-impact promotional posters, conference key visuals, and marketing assets.',
      turnaround: '24–48 Hours',
      deliverables: ['High-Res Print PDF', 'Digital 9:16 Story Format', 'CMYK Calibrated'],
    },
    {
      id: 'social',
      name: 'Social Media Kit',
      category: 'Social',
      icon: Sparkles,
      desc: 'Curated Instagram visual systems, carousel templates, and seasonal campaign assets.',
      turnaround: '2–4 Days',
      deliverables: ['Template System', 'Story & Post Formats', 'Vector Elements'],
    },
    {
      id: 'website',
      name: 'Website & Digital',
      category: 'Digital',
      icon: Building2,
      desc: 'Bespoke portfolio websites, responsive studio showcases, and landing experiences.',
      turnaround: '2–3 Weeks',
      deliverables: ['Modern Web Architecture', 'Responsive Layout', 'Fast Loading', 'SEO Basics'],
    },
    {
      id: 'ui-ux',
      name: 'UI/UX Design',
      category: 'Digital',
      icon: Zap,
      desc: 'Interactive wireframes, clickable prototypes, and design component systems.',
      turnaround: '1–2 Weeks',
      deliverables: ['Figma Prototypes', 'Component Specs', 'Design Token System'],
    },
    {
      id: 'video',
      name: 'Motion Graphics & Reels',
      category: 'Motion',
      icon: Video,
      desc: '60 FPS kinetic typography, 3D animated logo stings, and promotional campaign reels.',
      turnaround: '48–72 Hours',
      deliverables: ['4K / 1080p MP4', '9:16 Vertical Reel', 'Sound Design Synced'],
    },
    {
      id: 'photography',
      name: 'Photography & Art Dir.',
      category: 'Media',
      icon: Eye,
      desc: 'Product art direction, editorial staging, retouching, and calibrated color grading.',
      turnaround: '3–5 Days',
      deliverables: ['Retouched Master TIFFs', 'Web-Optimized JPEGs', 'Color Graded'],
    },
    {
      id: 'printing',
      name: 'Large Format Flex Print',
      category: 'Production',
      icon: Printer,
      desc: 'Large format star flex, highway hoardings, backlit signboards, and offset press runs.',
      turnaround: 'Same Day / 24h',
      deliverables: ['In-House Mimaki Solvent Print', 'UV Weather Shield', 'Installation Ready'],
    },
    {
      id: 'ai-creative',
      name: 'AI Creative Synthesis',
      category: 'Frontier',
      icon: Sparkles,
      desc: 'Generative concept exploration, visual synthesis, and rapid creative art direction.',
      turnaround: '24–48 Hours',
      deliverables: ['High-Concept Moodboards', 'Synthesized Artboards', 'Creative Briefs'],
    },
    {
      id: 'custom',
      name: 'Custom Creative Scope',
      category: 'Custom',
      icon: Award,
      desc: 'Bespoke creative scopes, custom architectural installations, and specialized commissions.',
      turnaround: 'Tailored',
      deliverables: ['Tailored Execution', 'Direct Creative Director Consultation'],
    },
  ];

  const faqs = [
    {
      q: 'How fast can Gizmo Design deliver urgent print jobs or event posters?',
      a: 'We offer an expedited 24-hour turnaround for graphic posters and same-day in-house large format flex production. You can specify urgent timelines directly in our project submission form.',
    },
    {
      q: 'Do you provide open vector source files?',
      a: 'Yes. All completed identity projects include open vector files (AI, SVG, PDF) alongside production-ready master assets.',
    },
    {
      q: 'Can I track my project progress online?',
      a: 'Yes. Using our Client Portal, you can track milestone revisions, download work in progress, and manage invoices with instant UPI payment confirmation.',
    },
    {
      q: 'How does payment and billing work?',
      a: 'We issue official GST-compliant tax invoices with QR codes for instant UPI settlement, bank transfer (NEFT/IMPS), or card payment.',
    },
  ];

  return (
    <div className="bg-slate-50 text-zinc-900 min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EE1D45]/10 text-[#EE1D45] text-xs font-bold">
          <span>CREATIVE &amp; PRODUCTION SERVICES</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
          What We Create &amp; Deliver
        </h1>
        <p className="text-base sm:text-lg text-zinc-600">
          From brand systems and kinetic motion to in-house large-format flex production, we offer seamless end-to-end design and manufacturing under one roof.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {services.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.id}
              className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs hover:shadow-md hover:border-[#EE1D45]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#EE1D45]/10 flex items-center justify-center text-[#EE1D45] group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {srv.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-zinc-900 group-hover:text-[#EE1D45] transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                {/* Deliverables tags */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Included Deliverables
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {srv.deliverables.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-zinc-100 text-[11px] text-zinc-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{srv.turnaround}</span>
                </div>

                <button
                  onClick={() => onOpenStartProject(srv.name)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition-colors"
                >
                  <span>Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQs Section */}
      <div className="max-w-3xl space-y-6 mb-16">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#EE1D45]">
            Common Inquiries
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-zinc-200 bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="p-5">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-zinc-900 hover:text-[#EE1D45] transition-colors text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#EE1D45]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mt-3 pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 text-white text-center space-y-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold">
          Ready to Commission a Project?
        </h2>
        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
          Start in 2 minutes. We will review your brief and supply a comprehensive timeline and quote.
        </p>
        <button
          onClick={() => onOpenStartProject()}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-sm font-bold shadow-lg shadow-[#EE1D45]/30 hover:shadow-xl transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start a Project</span>
        </button>
      </div>
    </div>
  );
};

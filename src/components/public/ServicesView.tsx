import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronDown,
  Layers,
  Printer,
  Video,
  Palette,
  Globe,
  MessageCircle,
  FileText,
  Sliders,
  Check,
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

  // 4 Core Reference Services (Two-column layout)
  const coreServices = [
    {
      id: 'brand-identity',
      title: 'Brand & Visual Identity',
      category: 'Brand Systems',
      icon: Palette,
      turnaround: '3–5 Days Average',
      desc: 'Complete identity systems, vector logomarks, typography rules, color formulas, and stationery suites designed for lasting distinction.',
      deliverables: [
        'Vector Master Formats (AI, EPS, SVG, PDF)',
        'Comprehensive Brand Guidelines Manual',
        'Color Hierarchy (Pantone, CMYK, RGB, HEX)',
        'Corporate Stationery Suite & Business Cards',
        'Social Media Profile & Cover Templates',
      ],
      bestFor: 'Startups, corporate rebrands, institutional identities & retail product lines.',
      serviceKey: 'Brand Identity',
    },
    {
      id: 'motion-video',
      title: 'Motion & Video Graphics',
      category: 'Motion & 3D',
      icon: Video,
      turnaround: '48–72 Hours Average',
      desc: 'High-octane 3D animated logo stings, 60 FPS kinetic typography reels, product launch teasers, and broadcast-quality social campaigns.',
      deliverables: [
        '60 FPS Ultra-HD 4K & 1080p Master Files',
        '9:16 Vertical Instagram Reels & TikTok Formats',
        'Synchronized Sound Effects & Audio Mastering',
        'Alpha Channel Transparent Overlay Assets',
        'Storyboard & Visual Narrative Progression',
      ],
      bestFor: 'Product launches, event promotions, Instagram viral reels & brand announcements.',
      serviceKey: 'Motion Graphics',
    },
    {
      id: 'flex-print',
      title: 'Flex & Large-Format Production',
      category: 'In-House Print Facility',
      icon: Printer,
      turnaround: 'Same Day / 24h Rush Available',
      desc: 'Large format outdoor hoardings, backlit signboards, exhibition roll-ups, and commercial event prints manufactured on our in-house solvent presses.',
      deliverables: [
        'Direct Output from In-House Mimaki Presses',
        'Star Flex & Heavy GSM Backlit Media',
        'UV Protective Weather-Shield Coating',
        'Reinforced Grommets & Mounting Margins',
        'Expedited Kerala-wide Logistics & Delivery',
      ],
      bestFor: 'Highway hoardings, retail shopfronts, political/cultural conventions & outdoor ads.',
      serviceKey: 'Large Format Flex Print',
    },
    {
      id: 'digital-ui',
      title: 'Digital & Product UI',
      category: 'Digital Architecture',
      icon: Globe,
      turnaround: '1–2 Weeks Average',
      desc: 'Modern conversion-optimized landing interfaces, interactive client dashboards, and responsive web systems with clean aesthetics.',
      deliverables: [
        'Responsive Figma Design System & Tokens',
        'Clickable Interactive Prototypes',
        'Production-Ready Component Specs',
        'Mobile-First Touch Optimized Viewports',
        'High-Resolution SVG Web Graphics',
      ],
      bestFor: 'SaaS platforms, web agencies, modern portfolio sites & digital startups.',
      serviceKey: 'Website & Digital',
    },
  ];

  // 4-Stage Rapid Delivery Process
  const workflowStages = [
    {
      step: '01',
      title: 'Brief & Specs',
      desc: 'Submit your requirements via our rapid submission form or WhatsApp desk. We clarify dimensions, branding targets, and delivery milestones.',
    },
    {
      step: '02',
      title: 'Design Artboard',
      desc: 'Senior designers craft initial concepts, typography lockups, and high-fidelity artboards for your immediate review.',
    },
    {
      step: '03',
      title: 'Review & Refine',
      desc: 'Interactive feedback loop with milestone approvals, color calibration checks, and swift revision turnarounds.',
    },
    {
      step: '04',
      title: 'Press & Delivery',
      desc: 'Final master vector export or direct transfer to our in-house Mimaki solvent presses for instant flex printing and dispatch.',
    },
  ];

  const faqs = [
    {
      q: 'How fast can Gizmo Design deliver urgent print jobs or event posters?',
      a: 'We offer an expedited 24-hour turnaround for graphic posters and same-day in-house large format flex production. You can specify urgent timelines directly in our project submission form.',
    },
    {
      q: 'Do you provide open vector source files?',
      a: 'Yes. All completed identity projects include open vector files (AI, SVG, EPS, PDF) alongside production-ready master assets.',
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
    <div className="bg-white text-zinc-900 min-h-screen selection:bg-[#EE1D45] selection:text-white">
      {/* ========================================================================= */}
      {/* 1. SERVICES HEADER                                                        */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-20 border-b border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EE1D45]/10 text-[#EE1D45] text-xs font-bold uppercase tracking-wider">
              <span>STUDIO CAPABILITIES</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-tight">
              Crafted to Elevate Your Brand Presence
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
              Whether you need a complete corporate visual identity, high-octane 3D motion reels, or in-house large format flex printing, we provide complete production under one roof.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE SERVICES GRID (2-Column Reference Layout)                         */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-zinc-50/60 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {coreServices.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="bg-white rounded-3xl p-7 sm:p-9 border border-zinc-200/90 shadow-2xs hover:shadow-md hover:border-[#EE1D45]/40 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    {/* Header: Icon + Turnaround Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-950 group-hover:bg-[#EE1D45] group-hover:text-white transition-colors">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200/80">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{srv.turnaround}</span>
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-2xl font-bold text-zinc-950 group-hover:text-[#EE1D45] transition-colors">
                        {srv.title}
                      </h3>
                      <p className="text-sm text-zinc-600 mt-2.5 leading-relaxed">
                        {srv.desc}
                      </p>
                    </div>

                    {/* Included Deliverables */}
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                        INCLUDED DELIVERABLES
                      </div>
                      <ul className="space-y-2">
                        {srv.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 font-medium">
                            <Check className="w-4 h-4 text-[#EE1D45] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Best For Tag */}
                    <div className="pt-3 border-t border-zinc-100 text-xs text-zinc-500">
                      <span className="font-bold text-zinc-700">Best for: </span>
                      <span>{srv.bestFor}</span>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">
                      {srv.category}
                    </span>

                    <button
                      onClick={() => onOpenStartProject(srv.serviceKey)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                    >
                      <span>Book Brief</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. STUDIO WORKFLOW (Dark 4-Stage Section)                                  */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EE1D45]/20 text-[#EE1D45] text-xs font-bold uppercase tracking-wider">
              <span>STUDIO WORKFLOW</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              4-Stage Rapid Delivery Process
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Clear timelines, direct designer communication, and rapid turnaround cycles.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowStages.map((stage) => (
              <div
                key={stage.step}
                className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="text-3xl font-black text-[#EE1D45] tracking-tight">
                  {stage.step}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {stage.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FAQS SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#EE1D45]">
              Common Inquiries
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-zinc-200 bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="p-5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-bold text-zinc-900 hover:text-[#EE1D45] transition-colors text-sm sm:text-base cursor-pointer"
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
      </section>

      {/* ========================================================================= */}
      {/* 5. BOTTOM CTA CARD                                                        */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-zinc-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-zinc-950 text-white text-center space-y-4 max-w-4xl mx-auto border border-zinc-800">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Commission a Project?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
              Start in 2 minutes. We will review your brief and supply a comprehensive timeline and quote.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onOpenStartProject()}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] text-white text-sm font-bold shadow-lg shadow-[#EE1D45]/30 hover:shadow-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start a Project</span>
              </button>
              <a
                href="https://wa.me/919845879017"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border border-emerald-500 text-emerald-600 font-bold text-sm hover:bg-emerald-50 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
                <span>WhatsApp Consultation</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


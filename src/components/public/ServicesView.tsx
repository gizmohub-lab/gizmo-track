import React, { useState } from 'react';
import {
  Palette,
  Video,
  Printer,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  MessageCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { AppRoute } from '../../types';

interface ServicesViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onNavigate,
  onOpenStartProject,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const servicesList = [
    {
      id: 'brand',
      icon: Palette,
      title: 'Brand & Visual Identity',
      subtitle: 'Distinctive visual foundations engineered to scale across media.',
      color: 'blue',
      turnaround: '3–7 Days',
      deliverables: [
        'Vector Primary & Secondary Logomarks',
        'Typographic Pairing & Hierarchy Guides',
        'Color Palette Formulae (HEX, CMYK, Pantone)',
        'Full Brand Identity Guidelines PDF',
        'Social Media Profile & Cover Assets',
        'Business Card, Letterhead & Envelope Print Ready PDFs',
      ],
      idealFor: 'Startups, academic institutions, retail brands, rebranding initiatives.',
    },
    {
      id: 'motion',
      icon: Video,
      title: 'Motion & Video Graphics',
      subtitle: 'Dynamic kinetic storytelling that commands screen attention.',
      color: 'purple',
      turnaround: '24–72 Hours',
      deliverables: [
        'Social Media Motion Posters (9:16 & 1:1)',
        'Event Countdown & Speaker Reveal Reels',
        '3D Logo Stingers & Animated Openers',
        'Product Feature Teaser Animations',
        'Kinetic Typography for Music & Quotes',
        '60 FPS MP4 / ProRes Master Files',
      ],
      idealFor: 'Conferences, festivals, product launches, Instagram / YouTube growth.',
    },
    {
      id: 'print',
      icon: Printer,
      title: 'Flex & Large-Format Production',
      subtitle: 'In-house press & large-format flex printing with calibrated color fidelity.',
      color: 'emerald',
      turnaround: '12–24 Hours',
      deliverables: [
        'Roadside & Building Front-Lit Hoardings (Up to 60ft)',
        'Backlit Glow Signboards & Star Flex',
        'Event Backdrops, Stage Fascias & Standees',
        'Frosted Glass & Vinyl Wall Graphics',
        'Foam Board & Sun Board Mounting',
        'Delivery & Installation Coordination in Kerala',
      ],
      idealFor: 'Events, retail shops, grand openings, outdoor brand visibility.',
    },
    {
      id: 'digital',
      icon: Layers,
      title: 'Digital & Product UI',
      subtitle: 'Modern interfaces and design systems crafted for high conversion.',
      color: 'amber',
      turnaround: '1–2 Weeks',
      deliverables: [
        'Responsive Web Application Design',
        'Interactive Figma Clickable Prototypes',
        'Design Systems & Reusable Component Specs',
        'Clean Tailwind CSS Front-End Integration',
        'Client Dashboards & Billing Portals',
      ],
      idealFor: 'SaaS platforms, digital agencies, internal operations portals.',
    },
  ];

  const faqs = [
    {
      q: 'How fast can Gizmo Design deliver urgent print jobs or event posters?',
      a: 'For urgent requirements, we offer an express 24-hour turnaround for graphic posters and same-day in-house large format flex production. You can tag orders as "Urgent" directly in our Director CRM or WhatsApp.',
    },
    {
      q: 'Do you provide the open editable source files?',
      a: 'Yes! All client orders include final production-ready files (High-Res PDF, TIFF with CMYK for print, MP4 for motion) along with open editable design vectors upon request.',
    },
    {
      q: 'Can I track my project progress online?',
      a: 'Absolutely. Using the "My Projects" tab in our portal, you can monitor current status, view revision milestones, and download deliverables at any stage.',
    },
    {
      q: 'How does payment and billing work?',
      a: 'We issue official GST-compliant tax invoices with Darul Hasaniyyah compliant formatting and instant UPI QR codes. Payments can be settled via UPI, NEFT/IMPS, or card.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5738]" />
          <span>Services &amp; Creative Deliverables</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight">
          Crafted to Elevate Your Brand Presence
        </h1>
        <p className="text-sm sm:text-base text-zinc-600">
          Whether you need a complete corporate visual identity, high-octane 3D motion reels, or in-house large format flex printing, we provide complete production under one roof.
        </p>
      </div>

      {/* Services Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {servicesList.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.id}
              className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-2xs hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#FF5738]" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-mono font-bold text-zinc-700">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Avg: {srv.turnaround}</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-zinc-950">{srv.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">{srv.subtitle}</p>

                <div className="mt-6 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Included Deliverables:
                  </div>
                  <ul className="space-y-2">
                    {srv.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-medium text-zinc-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-zinc-100 flex items-center justify-between">
                <div className="text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-600">Best for: </span>
                  {srv.idealFor}
                </div>
                <button
                  onClick={onOpenStartProject}
                  className="px-4 py-2 bg-zinc-950 hover:bg-[#FF5738] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ml-3"
                >
                  <span>Book Brief</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Production Workflow */}
      <div className="p-8 sm:p-12 rounded-3xl bg-zinc-950 text-white space-y-8">
        <div className="max-w-2xl">
          <div className="text-xs font-black uppercase tracking-wider text-[#FF5738]">
            Studio Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            4-Stage Rapid Delivery Process
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl font-black text-[#FF5738] font-mono">01</div>
            <h4 className="text-base font-bold text-white mt-2">Brief &amp; Specs</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Submit dimensions, copy, references and delivery deadline via WhatsApp or web portal.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl font-black text-[#FF5738] font-mono">02</div>
            <h4 className="text-base font-bold text-white mt-2">Design Artboard</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Senior designers craft custom concepts adhering to typography standards and color science.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl font-black text-[#FF5738] font-mono">03</div>
            <h4 className="text-base font-bold text-white mt-2">Review &amp; Refine</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Real-time proofing and iterative client feedback loops with zero hassle.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl font-black text-[#FF5738] font-mono">04</div>
            <h4 className="text-base font-bold text-white mt-2">Press &amp; Delivery</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              High-res export or immediate in-house flex roll printing with GST billing settlement.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-zinc-950">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-500">Everything you need to know about working with our team.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-zinc-200 transition-all cursor-pointer"
                onClick={() => setActiveFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between font-bold text-sm text-zinc-900">
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform ${
                      isOpen ? 'rotate-180 text-[#FF5738]' : ''
                    }`}
                  />
                </div>
                {isOpen && (
                  <p className="text-xs text-zinc-600 mt-2.5 pt-2.5 border-t border-zinc-100 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

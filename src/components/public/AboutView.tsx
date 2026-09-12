import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Users,
  Printer,
  Heart,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { AppRoute } from '../../types';

interface AboutViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigate,
  onOpenStartProject,
}) => {
  const team = [
    {
      name: 'Muhammed Shamveel',
      role: 'Founder & Creative Director',
      bio: 'Over 8 years guiding brand identity, typography systems, and print architecture for leading commercial entities.',
      initials: 'MS',
    },
    {
      name: 'Salih K.',
      role: 'Lead Motion & 3D Designer',
      bio: 'Specialist in kinetic typography, 3D product stings, and high-impact social media campaign reels.',
      initials: 'SK',
    },
    {
      name: 'Rashid V.',
      role: 'Print & Production Head',
      bio: 'Master of large-format flex printing, CMYK color profiles, star flex media, and outdoor mounting durability.',
      initials: 'RV',
    },
    {
      name: 'Fathima N.',
      role: 'Senior Visual Designer',
      bio: 'Crafting modern logo systems, publication layouts, stationery suites, and digital presentation artboards.',
      initials: 'FN',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
          <Sparkles className="w-3.5 h-3.5 text-[#EE1D45]" />
          <span>About Gizmo Design Studio</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight">
          Where Aesthetic Rigor Meets Real-World Production
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Founded with a commitment to visual excellence, Gizmo Design operates as a hybrid creative agency and industrial flex printing facility based in Kerala, India.
        </p>
      </div>

      {/* Manifesto / Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950 text-white space-y-5">
          <div className="text-xs font-black uppercase tracking-wider text-[#EE1D45]">
            Our Philosophy
          </div>
          <h2 className="text-2xl sm:text-3xl font-black leading-snug">
            Design isn't just decoration. It is commercial clarity.
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Too often, digital designs look magnificent on a MacBook retina screen, only to wash out when printed on a 40-foot outdoor hoarding. We bridge this gap by uniting high-end graphic design with direct in-house production control.
          </p>
          <div className="pt-3 border-t border-zinc-800 flex items-center gap-4 text-xs text-zinc-300">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Pantone &amp; CMYK Certified</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Ultra-Fast Express SLA</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center font-bold font-mono">
                01
              </div>
              <div>
                <h4 className="text-sm font-black text-zinc-950">In-House Large Format Flex Facility</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  State-of-the-art Mimaki solvent and latex roll printers for crisp, vivid outdoor prints.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center font-bold font-mono">
                02
              </div>
              <div>
                <h4 className="text-sm font-black text-zinc-950">Direct WhatsApp Collaboration</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  No convoluted agency layers. Talk directly to lead designers for rapid revisions.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center font-bold font-mono">
                03
              </div>
              <div>
                <h4 className="text-sm font-black text-zinc-950">GST Invoicing &amp; Instant UPI</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Clear accounting, instant QR code payments, and clean transaction histories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-zinc-950">Leadership &amp; Studio Team</h2>
          <p className="text-xs text-zinc-500">The creative minds behind every pixel and press roll.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white font-black text-lg flex items-center justify-center mx-auto shadow-xs">
                {member.initials}
              </div>
              <div>
                <h4 className="text-sm font-black text-zinc-950">{member.name}</h4>
                <span className="text-[11px] font-bold text-[#EE1D45]">{member.role}</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Location & Studio Contacts */}
      <div className="p-8 rounded-3xl bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-lg font-black text-zinc-950">Gizmo Design Creative Studio</h3>
          <p className="text-xs text-zinc-600 flex items-center justify-center md:justify-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#EE1D45]" />
            <span>Malappuram / Kozhikode Hub, Kerala, India - 676505</span>
          </p>
          <p className="text-xs text-zinc-500">
            Official Email: <span className="font-mono text-zinc-700">gizmo.hub.in@gmail.com</span> | Phone / WhatsApp: <span className="font-mono text-zinc-700">+91 98458 79017</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/919845879017?text=Hello%20Gizmo%20Design%2C%20I%20would%20like%20to%20visit%20or%20inquire"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>Connect on WhatsApp</span>
          </a>
          <button
            onClick={onOpenStartProject}
            className="px-4 py-2.5 bg-zinc-950 hover:bg-[#EE1D45] text-white rounded-xl text-xs font-black transition"
          >
            Start a Project
          </button>
        </div>
      </div>
    </div>
  );
};

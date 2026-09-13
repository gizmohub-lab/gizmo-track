import React, { useMemo } from 'react';
import {
  Sparkles,
  Printer,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Layers,
  Award,
  Zap,
  Star,
  Globe,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { AppRoute, PublicSiteTeamMember } from '../../types';
import { GizmoLogo } from '../common/GizmoLogo';
import { MagneticButton } from '../common/MagneticButton';
import { loadPublicSiteTeamMembers } from '../../services/publicSiteCmsService';

interface AboutViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigate,
  onOpenStartProject,
}) => {
  const teamMembers = useMemo(() => {
    const loaded = loadPublicSiteTeamMembers();
    return loaded
      .filter((m) => m.isPublished !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, []);

  return (
    <div className="bg-slate-50 text-zinc-900 min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-[#EE1D45] selection:text-white">
      {/* Header */}
      <div className="max-w-3xl space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EE1D45]/10 text-[#EE1D45] text-xs font-bold">
          <span>ABOUT GIZMO DESIGN</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
          Where Creative Vision Meets Industrial Print Power.
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
          Founded in Kerala, Gizmo Design bridges the gap between high-end digital agency craft and precision physical flex printing manufacturing.
        </p>
      </div>

      {/* Story / Mission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200 shadow-xs space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            The Hybrid Agency Model
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-zinc-600 leading-relaxed">
            <p>
              Traditional agencies create designs that look stunning on monitors but break down during production due to poor color profiles, improper vector traps, or weak material knowledge.
            </p>
            <p>
              Gizmo was founded on a simple principle: <strong className="text-zinc-900">Total control from pixel to print.</strong> By running our own in-house Mimaki solvent roll presses, large format cutters, and finishing setups right here in Kerala, we guarantee that what you approve on screen is exactly what gets installed on the highway or in your retail space.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-extrabold text-[#EE1D45]">500+</div>
              <div className="text-xs text-zinc-500 font-medium">Delivered Projects</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-extrabold text-zinc-900">100%</div>
              <div className="text-xs text-zinc-500 font-medium">In-House Production</div>
            </div>
          </div>
        </div>

        {/* Machinery Specs Card */}
        <div className="lg:col-span-5 bg-zinc-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">
              <Printer className="w-3.5 h-3.5 text-[#EE1D45]" />
              <span>FACILITY CAPABILITIES</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              In-House Print Technology
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#EE1D45] shrink-0" />
                <span>Mimaki Wide-Format Solvent Presses (Up to 10ft Width)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#EE1D45] shrink-0" />
                <span>Star Flex Media &amp; Heavyweight Frontlit / Backlit Vinyl</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#EE1D45] shrink-0" />
                <span>UV Weather-Shield Coating &amp; Matte/Gloss Laminators</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#EE1D45] shrink-0" />
                <span>Gold/Silver Hot Foil Stamping &amp; Rigid Box Die-Cutters</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-400">
            Calibrated for outdoor weatherproof durability across all Indian weather conditions.
          </div>
        </div>
      </div>

      {/* Leadership & Creative Team */}
      <div className="space-y-8 mb-20">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#EE1D45]">
            Creative Collective
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Meet the Studio Team
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-6 border border-zinc-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between group relative"
            >
              <div>
                {/* Avatar with optional leadership badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    {member.avatarUrl ? (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-zinc-200 group-hover:border-[#EE1D45] transition bg-zinc-900 shadow-xs">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center font-black text-lg border border-zinc-200 group-hover:border-[#EE1D45] transition">
                        {member.name
                          ? member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)
                              .toUpperCase()
                          : 'GZ'}
                      </div>
                    )}

                    {member.isFeatured && (
                      <div
                        className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-amber-400 text-black shadow-xs"
                        title="Key Leadership"
                      >
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    )}
                  </div>

                  <span className="font-mono text-[10px] text-zinc-400 font-bold">
                    #{member.displayOrder}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-zinc-900 group-hover:text-zinc-950">
                    {member.name}
                  </h4>
                  <div className="text-xs font-semibold text-[#EE1D45] mt-0.5">
                    {member.role}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-normal mt-3 line-clamp-4">
                  {member.bio}
                </p>
              </div>

              {/* Social / Contact Links */}
              {(member.whatsapp || member.email || member.portfolioUrl || member.instagram) && (
                <div className="flex items-center gap-2.5 pt-4 mt-4 border-t border-zinc-100 text-zinc-400">
                  {member.whatsapp && (
                    <a
                      href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Chat with ${member.name}`}
                      className="hover:text-emerald-600 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      title={`Email ${member.name}`}
                      className="hover:text-zinc-900 transition"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {member.portfolioUrl && (
                    <a
                      href={member.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Portfolio"
                      className="hover:text-[#EE1D45] transition"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Studio Location & Contacts */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-zinc-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-[#EE1D45]" />
            <span>KERALA STUDIO &amp; PRESS</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Let's Talk About Your Next Big Project.
          </h3>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Drop by our Kerala studio or reach out digitally for immediate consultations, quotes, and sample press proofs.
          </p>

          <div className="space-y-2 pt-2 text-sm text-zinc-700 font-medium">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#EE1D45]" />
              <a href="tel:+919845879017" className="hover:text-[#EE1D45] transition-colors">
                +91 98458 79017
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#EE1D45]" />
              <a href="mailto:gizmo.hub.in@gmail.com" className="hover:text-[#EE1D45] transition-colors">
                gizmo.hub.in@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col sm:flex-row gap-4 justify-end">
          <MagneticButton strength={0.3} maxDistance={12}>
            <a
              href="https://wa.me/919845879017"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Consultation</span>
            </a>
          </MagneticButton>

          <MagneticButton strength={0.35} maxDistance={14}>
            <button
              onClick={onOpenStartProject}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] text-white font-bold text-sm shadow-md shadow-[#EE1D45]/25 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start a Project</span>
            </button>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
};

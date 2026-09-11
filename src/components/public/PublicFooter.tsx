import React from 'react';
import {
  ArrowRight,
  Sparkles,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Heart,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { AppRoute } from '../../types';

interface PublicFooterProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onNavigate,
  onOpenStartProject,
}) => {
  return (
    <footer className="bg-zinc-950 text-white pt-16 pb-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Studio Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black text-sm">
                G
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                GIZMO DESIGN <sup className="text-[9px]">®</sup>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Design &amp; Creative Studio producing high-impact visual identity systems, kinetic motion reels, and in-house flex production.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Kerala, India (676505)</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Studio Portal
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition"
                >
                  Services &amp; Capabilities
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('work')}
                  className="hover:text-white transition"
                >
                  Curated Work Archive
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition"
                >
                  About Studio &amp; Team
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-projects')}
                  className="hover:text-white transition"
                >
                  Client Project Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Production Disciplines
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>Brand Identity &amp; Logo Systems</li>
              <li>Motion Graphics &amp; 3D Teasers</li>
              <li>Large-Format Flex Hoardings</li>
              <li>Backlit Star Flex &amp; Glow Signs</li>
              <li>Commercial Stationery &amp; Packaging</li>
              <li>GST Compliant Tax Invoicing</li>
            </ul>
          </div>

          {/* Col 4: Director Access & Connect */}
          <div className="space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Operations &amp; Studio Chat
            </div>
            <p className="text-xs text-zinc-400">
              Direct access for authorized directors, production leads, and client account managers.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center justify-between border border-zinc-800"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF5738]" />
                  <span>Director CRM Access</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <a
                href="https://wa.me/919845879017?text=Hello%20Gizmo%20Design"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold transition flex items-center justify-between border border-emerald-800/60"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  <span>Studio WhatsApp Desk</span>
                </div>
                <span className="text-[10px] font-mono">+91 98458 79017</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} GIZMO DESIGN ® Studio. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>GSTIN: 32ABCDE1234F1Z5</span>
            <span>•</span>
            <button
              onClick={onOpenStartProject}
              className="text-[#FF5738] hover:underline font-bold"
            >
              Commission a Project
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

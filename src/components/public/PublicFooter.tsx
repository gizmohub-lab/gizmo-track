import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Heart,
} from 'lucide-react';
import { AppRoute } from '../../types';
import { GizmoLogo } from '../common/GizmoLogo';

interface PublicFooterProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onNavigate,
  onOpenStartProject,
}) => {
  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <GizmoLogo size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    GIZMO
                  </span>
                  <span className="font-light text-lg tracking-tight text-zinc-400">
                    DESIGN
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
                  Creative Studio &amp; Flex Works
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Premier creative studio in Kerala specializing in brand identity systems, 3D motion graphics, UI/UX, and in-house large-format flex printing manufacturing.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenStartProject}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start a Project</span>
              </button>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Pages
            </span>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('work')}
                  className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Work
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-projects')}
                  className="text-zinc-300 hover:text-[#EE1D45] transition-colors cursor-pointer"
                >
                  My Projects
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services Directory */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Capabilities
            </span>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li>• Brand Identity &amp; Logomarks</li>
              <li>• In-House Flex &amp; Hoarding Printing</li>
              <li>• Motion Graphics &amp; 3D Launch Reels</li>
              <li>• Packaging Dielines &amp; Foil Stamping</li>
              <li>• Backlit Star Flex Signages</li>
              <li>• Digital Web &amp; UI/UX Systems</li>
            </ul>
          </div>

          {/* Col 4: Contact & Director Portal */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Direct Contact
            </span>

            <div className="space-y-2 text-xs">
              <a
                href="tel:+919845879017"
                className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#EE1D45]" />
                <span>+91 98458 79017</span>
              </a>

              <a
                href="mailto:gizmo.hub.in@gmail.com"
                className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#EE1D45]" />
                <span>gizmo.hub.in@gmail.com</span>
              </a>

              <a
                href="https://wa.me/919845879017"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-400" />
                <span>WhatsApp Studio Desk</span>
              </a>
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#EE1D45]" />
                <span>Studio Director Access</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} GIZMO DESIGN ® STUDIO. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Crafted with precision in Kerala, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import {
  ArrowRight,
  Menu,
  X,
  Shield,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { AppRoute } from '../../types';
import { GizmoLogo } from '../common/GizmoLogo';
import {
  loadPublishedContent,
  loadPublicSiteOffers,
  getOfferComputedStatus,
} from '../../services/publicSiteCmsService';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  activeProjectsCount?: number;
  onOpenStartProject: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  isAdminAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  activeProjectsCount = 5,
  unreadNotificationsCount = 4,
  onOpenStartProject,
  isAdminAuthenticated = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load published CMS content and offers safely
  const cmsContent = loadPublishedContent();
  const allOffers = loadPublicSiteOffers();
  const headerOffer = allOffers.find(
    (o) =>
      o.isActive &&
      getOfferComputedStatus(o) === 'Active' &&
      (o.displayLocations.includes('Header') ||
        o.displayLocations.includes('Banner') ||
        o.displayLocations.includes('Home Hero'))
  );

  const navLinks: { label: string; route: AppRoute }[] = (
    cmsContent.header?.navLinks || [
      { label: 'Services', route: 'services' },
      { label: 'Work', route: 'work' },
      { label: 'About', route: 'about' },
    ]
  ).map((nl) => ({
    label: nl.label,
    route: (nl.route as AppRoute) || 'home',
  }));

  const handleDirectorCrmClick = () => {
    setMobileMenuOpen(false);
    if (isAdminAuthenticated) {
      onNavigate('admin-dashboard');
    } else {
      onNavigate('admin-login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80 transition-all">
      {/* Top Promotional Offer Ticker Banner */}
      {headerOffer && (
        <div className="bg-zinc-950 text-white text-xs px-4 py-2 border-b border-zinc-800 flex items-center justify-between sm:justify-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EE1D45] animate-pulse shrink-0" />
            <span className="font-bold text-[#EE1D45] uppercase tracking-wider text-[10px] shrink-0">
              {headerOffer.shortLabel || 'OFFER'}:
            </span>
            <span className="text-zinc-200 font-medium truncate">
              {headerOffer.title}
            </span>
            {headerOffer.discount && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#EE1D45] text-white shrink-0">
                {headerOffer.discount}
              </span>
            )}
          </div>
          <button
            onClick={onOpenStartProject}
            className="text-xs font-bold text-white underline hover:text-[#EE1D45] transition-colors shrink-0 cursor-pointer"
          >
            Claim Offer →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer relative"
            >
              <div className="relative">
                <GizmoLogo size="md" className="group-hover:scale-105 transition-transform duration-200" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#EE1D45] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs border-2 border-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-950 leading-none group-hover:text-[#EE1D45] transition-colors">
                    GIZMO
                  </span>
                  <span className="font-light text-lg sm:text-xl tracking-tight text-zinc-500 leading-none">
                    DESIGN
                  </span>
                </div>
                <div className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase leading-none mt-1">
                  DESIGN &amp; PRODUCTION STUDIO
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Clean Minimal Center) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => onNavigate(link.route)}
                  className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-150 relative cursor-pointer ${
                    isActive
                      ? 'text-zinc-950 font-bold bg-zinc-100/90'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#EE1D45] rounded-full" />
                  )}
                </button>
              );
            })}

            {/* My Projects Link with Badge */}
            <button
              onClick={() => onNavigate('my-projects')}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer relative ${
                currentRoute === 'my-projects'
                  ? 'text-zinc-950 font-bold bg-zinc-100/90'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60'
              }`}
            >
              <span>My Projects</span>
              {activeProjectsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300/80">
                  {activeProjectsCount}
                </span>
              )}
              {currentRoute === 'my-projects' && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#EE1D45] rounded-full" />
              )}
            </button>
          </nav>

          {/* Desktop Actions Group: [ WhatsApp ] [ Director CRM ] [ Start a Project → ] */}
          <div className="hidden md:flex items-center gap-2.5 sm:gap-3">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/919845879017"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-emerald-500 hover:border-emerald-600 hover:bg-emerald-50/60 text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-bold shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
              title="Official Gizmo WhatsApp: +91 9845879017"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-500/20 text-emerald-600 shrink-0" />
              <span>WhatsApp</span>
            </a>

            {/* Director CRM Button */}
            <button
              onClick={handleDirectorCrmClick}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
              title="Director & Admin CRM Access"
            >
              <Shield className="w-4 h-4 text-white shrink-0" />
              <span>Director CRM</span>
            </button>

            {/* Start a Project Primary CTA */}
            <button
              id="nav-start-project-btn"
              onClick={onOpenStartProject}
              className="group inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] active:bg-[#B80D30] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#EE1D45]/20 hover:shadow-md hover:shadow-[#EE1D45]/30 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Mobile Menu Trigger & Fast CTA */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenStartProject}
              className="h-9 px-3.5 rounded-full bg-[#EE1D45] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Start</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold flex items-center justify-between cursor-pointer ${
                currentRoute === 'home'
                  ? 'text-zinc-950 font-bold bg-zinc-100'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <span>Home</span>
              {currentRoute === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-[#EE1D45]" />}
            </button>

            {navLinks.map((link) => {
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => {
                    onNavigate(link.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'text-zinc-950 font-bold bg-zinc-100'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#EE1D45]" />}
                </button>
              );
            })}

            <button
              onClick={() => {
                onNavigate('my-projects');
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold flex items-center justify-between cursor-pointer ${
                currentRoute === 'my-projects'
                  ? 'text-zinc-950 font-bold bg-zinc-100'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <span>My Projects</span>
              {activeProjectsCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {activeProjectsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile Action Buttons Group */}
          <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onOpenStartProject();
                setMobileMenuOpen(false);
              }}
              className="group w-full h-11 rounded-full bg-[#EE1D45] text-white text-center font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://wa.me/919845879017"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-10 rounded-full bg-white border border-emerald-500 text-emerald-600 text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={handleDirectorCrmClick}
                className="w-full h-10 rounded-full bg-zinc-950 text-white text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-white" />
                <span>Director CRM</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


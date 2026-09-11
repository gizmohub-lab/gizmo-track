import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  MessageCircle,
  ExternalLink,
  Flame,
  Palette,
  Video,
  Printer,
  Globe,
  Briefcase,
  UserCheck,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AppRoute } from '../../types';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  activeProjectsCount?: number;
  onOpenStartProject?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  activeProjectsCount = 3,
  onOpenStartProject,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic scroll listener: shrinks padding, adds bottom border #E4E4E7 and subtle shadow when scrolled past 20px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnterServices = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeaveServices = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 180);
  };

  const handleNavigate = (route: AppRoute) => {
    onNavigate(route);
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
  };

  // Service categories for the MegaMenu
  const serviceCategories = [
    {
      id: 'brand',
      icon: Palette,
      title: 'Brand & Visual Identity',
      desc: 'Logo systems, typography rules, brand book guidelines & vector visual assets.',
      badge: 'Core Specialty',
    },
    {
      id: 'motion',
      icon: Video,
      title: 'Motion & Video Graphics',
      desc: 'Dynamic promo reels, kinetic motion posters, title sequences & social clips.',
      badge: 'Trending',
    },
    {
      id: 'print',
      icon: Printer,
      title: 'Print & Flex Production',
      desc: 'Large hoardings, backlit signages, offset packaging & vinyl printing specs.',
      badge: 'In-House Flex',
    },
    {
      id: 'digital',
      icon: Globe,
      title: 'Digital & Product UI',
      desc: 'Interactive UI/UX prototypes, bespoke studio websites & responsive design systems.',
      badge: 'Modern Web',
    },
  ];

  return (
    <>
      <header
        id="public-client-navbar"
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 backdrop-blur-md ${
          isScrolled
            ? 'bg-white/90 border-b border-[#E4E4E7] shadow-xs py-2.5 sm:py-3'
            : 'bg-white/70 border-b border-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Identity */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavigate('home')}
            className="group flex items-center gap-2.5 text-left transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-lg tracking-tighter group-hover:bg-[#FF5738] transition-colors shadow-xs">
              G
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-zinc-950 group-hover:text-[#FF5738] transition-colors">
                GIZMO DESIGN <sup className="text-[10px] font-mono">®</sup>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                Design &amp; Production Studio
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Services with MegaMenu */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnterServices}
              onMouseLeave={handleMouseLeaveServices}
            >
              <button
                id="nav-link-services"
                onClick={() => handleNavigate('services')}
                className={`relative px-3.5 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 rounded-lg ${
                  currentRoute === 'services'
                    ? 'text-zinc-950 font-bold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60'
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    megaMenuOpen ? 'rotate-180 text-[#FF5738]' : 'text-zinc-400'
                  }`}
                />
                {currentRoute === 'services' && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#FF5738] rounded-full" />
                )}
              </button>

              {/* MegaMenu Dropdown */}
              {megaMenuOpen && (
                <div
                  id="navbar-megamenu"
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[660px] pt-3 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="bg-white/98 backdrop-blur-xl border border-zinc-200 rounded-2xl p-5 shadow-2xl ring-1 ring-black/5">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-zinc-400">
                          Creative Capabilities
                        </div>
                        <div className="text-sm font-bold text-zinc-900">
                          Full-Stack Graphic, Motion &amp; Print Execution
                        </div>
                      </div>
                      <button
                        onClick={() => handleNavigate('services')}
                        className="text-xs font-bold text-[#FF5738] hover:underline flex items-center gap-1"
                      >
                        <span>View All Services</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {serviceCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => handleNavigate('services')}
                            className="group p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50/80 transition-all cursor-pointer flex gap-3"
                          >
                            <div className="w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-[#FF5738]/10 group-hover:text-[#FF5738] text-zinc-700 flex items-center justify-center shrink-0 transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-950 group-hover:text-[#FF5738] transition-colors">
                                  {cat.title}
                                </span>
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded">
                                  {cat.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-snug">
                                {cat.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Spotlight strip */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/90 -mx-5 -mb-5 p-3 px-5 rounded-b-2xl">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-zinc-600 font-medium">
                          Accepting new production cycles for September 2026
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setMegaMenuOpen(false);
                          if (onOpenStartProject) onOpenStartProject();
                          else handleNavigate('work');
                        }}
                        className="text-xs font-bold text-zinc-950 hover:text-[#FF5738] flex items-center gap-1 transition-colors"
                      >
                        <span>Schedule Briefing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Work */}
            <button
              id="nav-link-work"
              onClick={() => handleNavigate('work')}
              className={`relative px-3.5 py-2 text-sm font-semibold transition-colors rounded-lg ${
                currentRoute === 'work'
                  ? 'text-zinc-950 font-bold'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60'
              }`}
            >
              <span>Work</span>
              {currentRoute === 'work' && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#FF5738] rounded-full" />
              )}
            </button>

            {/* About */}
            <button
              id="nav-link-about"
              onClick={() => handleNavigate('about')}
              className={`relative px-3.5 py-2 text-sm font-semibold transition-colors rounded-lg ${
                currentRoute === 'about'
                  ? 'text-zinc-950 font-bold'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60'
              }`}
            >
              <span>About</span>
              {currentRoute === 'about' && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#FF5738] rounded-full" />
              )}
            </button>

            {/* My Projects with real-time active badge */}
            <button
              id="nav-link-my-projects"
              onClick={() => handleNavigate('my-projects')}
              className={`relative px-3.5 py-2 text-sm font-semibold transition-colors rounded-lg flex items-center gap-2 ${
                currentRoute === 'my-projects'
                  ? 'text-zinc-950 font-bold'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60'
              }`}
            >
              <span>My Projects</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black font-mono bg-[#FF5738] text-white shadow-xs">
                {activeProjectsCount}
              </span>
              {currentRoute === 'my-projects' && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#FF5738] rounded-full" />
              )}
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* WhatsApp Direct Action */}
            <a
              id="navbar-whatsapp-cta"
              href="https://wa.me/919845879017?text=Hello%20Gizmo%20Design%2C%20I%20would%20like%20to%20inquire%20about%20a%20new%20project"
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp (+91 98458 79017)"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span className="hidden lg:inline">WhatsApp</span>
            </a>

            {/* Switch to Director CRM or Start a Project */}
            <button
              id="navbar-admin-switch-btn"
              onClick={() => {
                const isAuthed =
                  (typeof window !== 'undefined' && sessionStorage.getItem('gizmo_admin_auth') === 'true') ||
                  (typeof window !== 'undefined' && localStorage.getItem('gizmo_admin_auth_persistent') === 'true');
                if (isAuthed) {
                  handleNavigate('admin-dashboard');
                } else {
                  handleNavigate('admin-login');
                }
              }}
              className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5738]" />
              <span className="hidden sm:inline">Director CRM</span>
              <span className="sm:hidden">CRM</span>
            </button>

            {/* High-Contrast Primary CTA Button */}
            <button
              id="navbar-start-project-btn"
              onClick={() => {
                if (onOpenStartProject) onOpenStartProject();
                else handleNavigate('work');
              }}
              className="px-4 py-2 bg-[#FF5738] hover:bg-[#ff4220] text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-100 transition"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-sm">
                    G
                  </div>
                  <span className="font-black text-base text-zinc-950">GIZMO DESIGN</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-black rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => handleNavigate('home')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between ${
                    currentRoute === 'home'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span>Home</span>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => handleNavigate('services')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between ${
                    currentRoute === 'services'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span>Services &amp; Capabilities</span>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => handleNavigate('work')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between ${
                    currentRoute === 'work'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span>Work &amp; Showcase</span>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => handleNavigate('about')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between ${
                    currentRoute === 'about'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span>About Studio</span>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => handleNavigate('my-projects')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between ${
                    currentRoute === 'my-projects'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>My Projects</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#FF5738] text-white">
                      {activeProjectsCount}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                </button>
              </nav>

              {/* Services quick pills in drawer */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Quick Service Links
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold text-zinc-700">
                  <div
                    onClick={() => handleNavigate('services')}
                    className="p-1.5 rounded hover:bg-white cursor-pointer"
                  >
                    • Brand Identity
                  </div>
                  <div
                    onClick={() => handleNavigate('services')}
                    className="p-1.5 rounded hover:bg-white cursor-pointer"
                  >
                    • Motion Graphics
                  </div>
                  <div
                    onClick={() => handleNavigate('services')}
                    className="p-1.5 rounded hover:bg-white cursor-pointer"
                  >
                    • Flex &amp; Print
                  </div>
                  <div
                    onClick={() => handleNavigate('services')}
                    className="p-1.5 rounded hover:bg-white cursor-pointer"
                  >
                    • Digital UI/UX
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Footer CTAs */}
            <div className="space-y-2.5 pt-6 border-t border-zinc-100">
              <a
                href="https://wa.me/919845879017?text=Hello%20Gizmo%20Design%2C%20I%20would%20like%20to%20inquire%20about%20a%20new%20project"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                <span>Chat on WhatsApp Support</span>
              </a>

              <button
                onClick={() => handleNavigate('admin-dashboard')}
                className="w-full py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#FF5738]" />
                <span>Director Studio CRM</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenStartProject) onOpenStartProject();
                  else handleNavigate('work');
                }}
                className="w-full py-2.5 rounded-xl bg-[#FF5738] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

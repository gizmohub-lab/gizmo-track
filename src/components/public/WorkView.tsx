import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Tag,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Video,
  Printer,
  Palette,
} from 'lucide-react';
import { AppRoute } from '../../types';

interface WorkViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: () => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
  onNavigate,
  onOpenStartProject,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const portfolioItems = [
    {
      id: 'w-1',
      title: 'Darul Hasaniyyah Visual Identity',
      category: 'Branding',
      client: 'Darul Hasaniyyah Islamic Academy',
      date: 'Aug 2026',
      description: 'Comprehensive brand identity system including typography, publication standards, signage guidelines and event stationery.',
      tags: ['Identity', 'Logo', 'Stationery', 'Guidelines'],
      gradient: 'from-violet-900 to-indigo-950',
    },
    {
      id: 'w-2',
      title: 'Apex Prime Commercial Hoarding',
      category: 'Print & Flex',
      client: 'Apex Developers Group',
      date: 'Sep 2026',
      description: 'Massive 50x20 ft high-definition backlit roadside hoarding print with weather-shield lamination.',
      tags: ['Flex Print', 'Outdoor', 'Hoarding', 'Large Format'],
      gradient: 'from-emerald-900 to-zinc-950',
    },
    {
      id: 'w-3',
      title: '3D Kinetic Launch Teaser Reel',
      category: 'Motion',
      client: 'TechNova Solutions',
      date: 'Aug 2026',
      description: '60 FPS 3D logo reveal and kinetic Instagram promotional reel campaign garnering 150k+ views.',
      tags: ['Motion Graphics', 'Reel', '3D Animation', 'Social'],
      gradient: 'from-purple-950 to-pink-950',
    },
    {
      id: 'w-4',
      title: 'Kerala Design Conclave 2026',
      category: 'Motion',
      client: 'Kerala Creative Guild',
      date: 'Jul 2026',
      description: 'Event visual package: Animated speaker introduction loops, LED stage backdrops, and physical badges.',
      tags: ['Motion', 'Event Graphics', 'Stage Backdrop'],
      gradient: 'from-amber-950 to-orange-950',
    },
    {
      id: 'w-5',
      title: 'Malabar Heritage Gold Packaging',
      category: 'Branding',
      client: 'Malabar Heritage Jewellers',
      date: 'Jul 2026',
      description: 'Luxury gold-foiled rigid gift box packaging, certificate sleeves, and premium offset bag printing.',
      tags: ['Packaging', 'Gold Foil', 'Offset Print'],
      gradient: 'from-yellow-950 to-zinc-950',
    },
    {
      id: 'w-6',
      title: 'Metro Star Backlit Signboard',
      category: 'Print & Flex',
      client: 'Metro Super Specialty Hospital',
      date: 'Jun 2026',
      description: 'High-translucency backlit vinyl signboards with uniform LED light transmission and aluminum extrusion framing.',
      tags: ['Backlit Star Flex', 'Signage', 'Architectural'],
      gradient: 'from-blue-950 to-slate-950',
    },
  ];

  const categories = [
    { id: 'ALL', label: 'All Projects' },
    { id: 'Branding', label: 'Brand & Identity' },
    { id: 'Motion', label: 'Motion & Video' },
    { id: 'Print & Flex', label: 'Large Format Flex & Print' },
  ];

  const filteredItems = portfolioItems.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5738]" />
          <span>Selected Studio Archive</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight">
          Visual Precision in Every Detail
        </h1>
        <p className="text-sm sm:text-base text-zinc-600">
          Browse through our curated catalog of brand identities, kinetic motion sequences, and in-house flex production projects.
        </p>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl bg-white border border-zinc-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Graphic Banner */}
              <div
                className={`h-56 bg-gradient-to-br ${item.gradient} p-6 flex flex-col justify-between text-white relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/15 backdrop-blur-xs text-white">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono opacity-60">{item.date}</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-white/70">{item.client}</span>
                  <h3 className="text-xl font-black tracking-tight text-white mt-0.5 group-hover:text-[#FF5738] transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Description & Tags */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-6 pt-0 flex items-center justify-between border-t border-zinc-100 mt-2">
              <span className="text-xs font-bold text-zinc-400">Gizmo Production</span>
              <button
                onClick={onOpenStartProject}
                className="text-xs font-bold text-[#FF5738] hover:underline flex items-center gap-1"
              >
                <span>Request Similar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Consultation Banner */}
      <div className="p-8 rounded-3xl bg-zinc-100 border border-zinc-200 text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="text-xl font-black text-zinc-950">Have a custom vision in mind?</h3>
        <p className="text-xs text-zinc-600 max-w-md mx-auto">
          We handle custom dimensions, complex motion storyboards, and special media printing with turnkey installation.
        </p>
        <button
          onClick={onOpenStartProject}
          className="px-6 py-2.5 bg-zinc-950 hover:bg-[#FF5738] text-white rounded-xl text-xs font-black transition"
        >
          Start Your Project Consultation
        </button>
      </div>
    </div>
  );
};

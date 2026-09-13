import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Filter,
  Layers,
  Printer,
  Video,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { AppRoute, Project } from '../../types';

interface WorkViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: (initialService?: string) => void;
  projects?: Project[];
}

export const WorkView: React.FC<WorkViewProps> = ({
  onNavigate,
  onOpenStartProject,
  projects = [],
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const portfolioItems = [
    {
      id: 'w-1',
      title: 'Darul Hasaniyyah SNEC Visual Identity',
      category: 'Brand & Identity',
      client: 'Darul Hasaniyyah Islamic Academy',
      year: '2026',
      description:
        'Comprehensive institutional brand identity system including bilingual Arabic/English typography rules, publication standards, ceremonial stationery, and campus signage guidelines.',
      tags: ['Identity', 'Logo System', 'Stationery', 'Guidelines', 'Bilingual'],
      gradient: 'from-zinc-900 to-black',
      serviceKey: 'Brand Identity',
    },
    {
      id: 'w-2',
      title: 'Apex Prime Commercial Hoarding',
      category: 'Large Format Flex & Print',
      client: 'Apex Commercial Infrastructure',
      year: '2026',
      description:
        'Massive 50x20 ft high-definition backlit roadside flex hoarding print with weather-shield UV lamination produced in-house on solvent presses.',
      tags: ['Flex Print', 'Outdoor', 'Hoarding', 'Large Format', 'Solvent RIP'],
      gradient: 'from-slate-900 to-zinc-950',
      serviceKey: 'Large Format Flex Print',
    },
    {
      id: 'w-3',
      title: '3D Kinetic Launch Teaser Reel',
      category: 'Motion & Video',
      client: 'TechNova Global',
      year: '2026',
      description:
        '60 FPS 3D logo reveal and kinetic Instagram promotional reel campaign garnering 150k+ views across digital channels.',
      tags: ['Motion Graphics', 'Reel', '3D Animation', 'Social', 'Kinetic'],
      gradient: 'from-neutral-900 to-zinc-900',
      serviceKey: 'Motion Graphics',
    },
    {
      id: 'w-4',
      title: 'Kerala Design Conclave 2026',
      category: 'Motion & Video',
      client: 'Kerala Creative Guild',
      year: '2026',
      description:
        'Event visual package: Animated speaker introduction loops, LED stage backdrop animations, and physical credential badges.',
      tags: ['Motion', 'Event Graphics', 'Stage Backdrop', 'Key Visual'],
      gradient: 'from-zinc-900 to-stone-900',
      serviceKey: 'Motion Graphics',
    },
    {
      id: 'w-5',
      title: 'Malabar Heritage Gold Packaging',
      category: 'Brand & Identity',
      client: 'Malabar Heritage Jewellers',
      year: '2026',
      description:
        'Luxury gold-foiled rigid gift box packaging, certificate sleeves, and premium offset retail bag printing.',
      tags: ['Packaging', 'Gold Foil', 'Offset Print', 'Rigid Box'],
      gradient: 'from-stone-900 to-neutral-950',
      serviceKey: 'Brand Identity',
    },
    {
      id: 'w-6',
      title: 'Metro Star Backlit Signboard',
      category: 'Large Format Flex & Print',
      client: 'Metro Super Specialty Hospital',
      year: '2026',
      description:
        'High-translucency backlit star flex signboards with uniform LED light transmission and aluminum extrusion framing.',
      tags: ['Backlit Star Flex', 'Signage', 'Architectural', 'Outdoor'],
      gradient: 'from-zinc-950 to-neutral-900',
      serviceKey: 'Large Format Flex Print',
    },
  ];

  const categories = [
    { id: 'ALL', label: 'All Projects' },
    { id: 'Brand & Identity', label: 'Brand & Identity' },
    { id: 'Motion & Video', label: 'Motion & Video' },
    { id: 'Large Format Flex & Print', label: 'Large Format Flex & Print' },
  ];

  const filteredItems = portfolioItems.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="bg-white text-zinc-900 min-h-screen selection:bg-[#EE1D45] selection:text-white">
      {/* Top Header */}
      <section className="py-12 sm:py-20 border-b border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EE1D45]/10 text-[#EE1D45] text-xs font-bold uppercase tracking-wider">
              <span>PORTFOLIO ARCHIVE</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-tight">
              Selected Studio Archive
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
              Visual Precision in Every Detail. Explore recent brand identity systems, kinetic motion sequences, and in-house flex production rollouts crafted for ambitious clients.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 sm:py-16 bg-zinc-50/60 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2.5 flex-wrap mb-10 pb-4 border-b border-zinc-200">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'bg-white text-zinc-700 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-zinc-200/90 shadow-2xs hover:shadow-lg hover:border-[#EE1D45]/30 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Gradient Area */}
                  <div
                    className={`aspect-[16/10] bg-gradient-to-br ${item.gradient} p-6 flex flex-col justify-between text-white relative`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/20 backdrop-blur-md text-white">
                        {item.category}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{item.year}</span>
                    </div>

                    <div>
                      <div className="text-xs text-[#EE1D45] font-bold tracking-wide">{item.client}</div>
                      <h3 className="text-xl font-black text-white mt-1 group-hover:text-zinc-100 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-700 border border-zinc-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      onClick={() => onOpenStartProject(item.serviceKey || 'Brand Identity')}
                      className="text-xs font-bold text-[#EE1D45] hover:text-[#D8143C] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Start Similar Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-medium text-zinc-400">Gizmo Studio</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="p-8 sm:p-12 rounded-3xl bg-zinc-950 text-white text-center space-y-4 max-w-4xl mx-auto border border-zinc-800">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Have a Custom Brief in Mind?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
              We handle everything from rapid single-day poster prints to full multi-channel brand launch campaigns.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onOpenStartProject()}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#EE1D45] hover:bg-[#D8143C] text-white text-sm font-bold shadow-lg shadow-[#EE1D45]/30 hover:shadow-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Commission a Project</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

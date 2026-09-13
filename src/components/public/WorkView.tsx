import React, { useState, useMemo } from 'react';
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
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Tag,
  Building2,
  Calendar,
} from 'lucide-react';
import { AppRoute, Project, PublicSiteWorkItem } from '../../types';
import { loadPublicSiteWork } from '../../services/publicSiteCmsService';

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
  const [lightboxWork, setLightboxWork] = useState<PublicSiteWorkItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Load from CMS
  const rawWorkItems = useMemo(() => {
    return loadPublicSiteWork();
  }, []);

  // Filter only visible items
  const publicWorkItems = useMemo(() => {
    return rawWorkItems
      .filter((w) => w.isVisible !== false)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [rawWorkItems]);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const list = [{ id: 'ALL', label: 'All Projects' }];
    const unique = new Set<string>();
    publicWorkItems.forEach((w) => {
      if (w.category) unique.add(w.category);
    });
    unique.forEach((cat) => {
      list.push({ id: cat, label: cat });
    });
    return list;
  }, [publicWorkItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'ALL') return publicWorkItems;
    return publicWorkItems.filter(
      (item) => item.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [publicWorkItems, activeCategory]);

  const openLightbox = (work: PublicSiteWorkItem, initialIndex = 0) => {
    setLightboxWork(work);
    setActiveImageIndex(initialIndex);
  };

  const closeLightbox = () => {
    setLightboxWork(null);
    setActiveImageIndex(0);
  };

  // Compile all images for the current lightbox work (cover + gallery)
  const lightboxImages = useMemo(() => {
    if (!lightboxWork) return [];
    const images: { url: string; caption?: string }[] = [];
    if (lightboxWork.imageUrl) {
      images.push({
        url: lightboxWork.imageUrl,
        caption: lightboxWork.coverImageAlt || `${lightboxWork.title} (Cover)`,
      });
    }
    if (lightboxWork.workImages && lightboxWork.workImages.length > 0) {
      lightboxWork.workImages.forEach((img) => {
        images.push({
          url: img.url,
          caption: img.caption || img.alt || lightboxWork.title,
        });
      });
    }
    return images;
  }, [lightboxWork]);

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
            {filteredItems.map((item) => {
              const galleryCount = item.workImages?.length || 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-zinc-200/90 shadow-2xs hover:shadow-lg hover:border-[#EE1D45]/30 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail Gradient Area / Cover image */}
                    <div
                      onClick={() => {
                        if (item.imageUrl || galleryCount > 0) {
                          openLightbox(item, 0);
                        }
                      }}
                      className={`aspect-[16/10] p-6 flex flex-col justify-between text-white relative overflow-hidden ${
                        item.imageUrl || galleryCount > 0 ? 'cursor-pointer' : ''
                      }`}
                      style={{
                        background: item.imageUrl
                          ? '#09090b'
                          : `linear-gradient(135deg, ${item.gradientFrom || '#18181b'}, ${
                              item.gradientTo || '#09090b'
                            })`,
                      }}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.coverImageAlt || item.title}
                          className={`absolute inset-0 w-full h-full group-hover:scale-105 transition duration-500 ${
                            item.coverImageFit === 'contain'
                              ? 'object-contain p-3 bg-zinc-950'
                              : 'object-cover'
                          }`}
                        />
                      )}

                      {/* Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/20 backdrop-blur-md text-white">
                          {item.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {galleryCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                              <ImageIcon className="w-3 h-3" />
                              <span>+{galleryCount} photos</span>
                            </span>
                          )}
                          <span className="text-xs font-mono text-zinc-300">{item.year}</span>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <div className="text-xs text-[#EE1D45] font-bold tracking-wide">
                          {item.clientName || 'Private Client'}
                        </div>
                        <h3 className="text-xl font-black text-white mt-1 group-hover:text-zinc-100 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    {/* Body details */}
                    <div className="p-6 space-y-4">
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                        {item.desc}
                      </p>

                      {item.tags && item.tags.length > 0 && (
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
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0 mt-auto">
                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <button
                        onClick={() => onOpenStartProject(item.serviceKey || item.category)}
                        className="text-xs font-bold text-[#EE1D45] hover:text-[#D8143C] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Start Similar Project</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {galleryCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => openLightbox(item, 0)}
                          className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>View Gallery</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-zinc-400">Gizmo Studio</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* ======================================================================= */}
      {/* WORK GALLERY LIGHTBOX MODAL                                             */}
      {/* ======================================================================= */}
      {lightboxWork && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between text-white">
              <div>
                <span className="text-xs font-bold text-[#EE1D45] uppercase tracking-wider block">
                  {lightboxWork.clientName} · {lightboxWork.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {lightboxWork.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-400">
                  {activeImageIndex + 1} / {lightboxImages.length}
                </span>
                <button
                  onClick={closeLightbox}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Stage Image */}
            <div className="flex-1 min-h-[320px] sm:min-h-[460px] relative flex items-center justify-center p-4 bg-black/60">
              <img
                src={lightboxImages[activeImageIndex].url}
                alt={lightboxImages[activeImageIndex].caption || lightboxWork.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />

              {/* Prev / Next controls */}
              {lightboxImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? lightboxImages.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === lightboxImages.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Caption & Thumbnails Strip */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-zinc-300 text-center sm:text-left">
                {lightboxImages[activeImageIndex].caption}
              </p>

              {/* Thumbnails */}
              {lightboxImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-md">
                  {lightboxImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#EE1D45] scale-105'
                          : 'border-zinc-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt="thumb"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  closeLightbox();
                  onOpenStartProject(lightboxWork.serviceKey || lightboxWork.category);
                }}
                className="px-4 py-2 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Start Project Like This</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

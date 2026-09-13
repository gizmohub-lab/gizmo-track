import React from 'react';
import {
  Plus,
  Layers,
  Palette,
  Video,
  Printer,
  Globe,
  Sparkles,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ArrowUp,
  ArrowDown,
  Clock,
  Tag,
  Star,
} from 'lucide-react';
import { PublicSiteService } from '../../../../types';

interface CMSServicesTabProps {
  services: PublicSiteService[];
  onAddService: () => void;
  onEditService: (service: PublicSiteService) => void;
  onDeleteService: (serviceId: string) => void;
  onDuplicateService: (service: PublicSiteService) => void;
  onToggleVisibility: (serviceId: string) => void;
  onToggleFeatured: (serviceId: string) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Palette':
      return Palette;
    case 'Video':
      return Video;
    case 'Printer':
      return Printer;
    case 'Globe':
      return Globe;
    case 'Layers':
      return Layers;
    default:
      return Sparkles;
  }
};

export const CMSServicesTab: React.FC<CMSServicesTabProps> = ({
  services,
  onAddService,
  onEditService,
  onDeleteService,
  onDuplicateService,
  onToggleVisibility,
  onToggleFeatured,
  onReorder,
}) => {
  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Public Disciplines &amp; Services ({services.length})
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage services, turnaround guarantees, deliverable lists, and homepage showcases.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddService}
          className="px-4 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Service</span>
        </button>
      </div>

      {/* Services List / Cards */}
      <div className="space-y-3">
        {services.map((service, index) => {
          const Icon = getIcon(service.iconName);

          return (
            <div
              key={service.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
                service.isVisible
                  ? 'bg-white border-zinc-200/90 shadow-2xs'
                  : 'bg-zinc-50 border-zinc-200 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Icon & Service Information */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#EE1D45]" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-zinc-950 tracking-tight">
                        {service.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-600">
                        {service.category}
                      </span>
                      {service.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-[#EE1D45] border border-[#EE1D45]/20">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Homepage Featured</span>
                        </span>
                      )}
                      {!service.isVisible && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-700">
                          Hidden
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
                      {service.desc}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap pt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{service.turnaround || 'Standard delivery'}</span>
                      </span>

                      {service.startingPrice && (
                        <span className="font-mono font-bold text-zinc-900">
                          Starting at ₹{service.startingPrice.toLocaleString('en-IN')}
                        </span>
                      )}

                      <span>
                        <strong>{service.deliverables.length}</strong> Deliverables
                      </span>
                    </div>

                    {/* Deliverables Chip Previews */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {service.deliverables.slice(0, 4).map((d, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-2 py-0.5 rounded bg-zinc-100 text-[10px] text-zinc-700 font-medium"
                        >
                          {d}
                        </span>
                      ))}
                      {service.deliverables.length > 4 && (
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-[10px] text-zinc-400 font-medium">
                          +{service.deliverables.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 w-full md:w-auto justify-end">
                  {/* Reorder Up/Down */}
                  <div className="flex items-center bg-zinc-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onReorder(index, 'up')}
                      className="p-1.5 rounded hover:bg-white text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === services.length - 1}
                      onClick={() => onReorder(index, 'down')}
                      className="p-1.5 rounded hover:bg-white text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => onToggleVisibility(service.id)}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      service.isVisible
                        ? 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        : 'border-zinc-300 bg-zinc-200 text-zinc-500'
                    }`}
                    title={service.isVisible ? 'Hide from public site' : 'Show on public site'}
                  >
                    {service.isVisible ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => onDuplicateService(service)}
                    className="p-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                    title="Duplicate Service"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => onEditService(service)}
                    className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete service "${service.title}"?`)) {
                        onDeleteService(service.id);
                      }
                    }}
                    className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

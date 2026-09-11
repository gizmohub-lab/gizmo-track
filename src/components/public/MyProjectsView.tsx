import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  MessageCircle,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
  FileText,
  Filter,
} from 'lucide-react';
import { AppRoute, Project } from '../../types';

interface MyProjectsViewProps {
  projects: Project[];
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: () => void;
}

export const MyProjectsView: React.FC<MyProjectsViewProps> = ({
  projects,
  onNavigate,
  onOpenStartProject,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback demo client projects if none exist
  const displayProjects: Project[] =
    projects.length > 0
      ? projects
      : [
          {
            id: 'proj-101',
            title: 'Darul Hasaniyyah Foundation Identity Suite',
            clientId: 'client-1',
            clientName: 'Darul Hasaniyyah Islamic Academy',
            category: 'Branding & Stationery',
            budget: 45000,
            status: 'In Progress',
            dueDate: '2026-09-18',
            description: 'Core logomark system, bilingual typography specs, certificate layouts and gold-foiled event covers.',
            createdAt: '2026-08-20',
          },
          {
            id: 'proj-102',
            title: 'Apex Prime Commercial Hoarding 50x20',
            clientId: 'client-2',
            clientName: 'Apex Developers Group',
            category: 'Print & Flex',
            budget: 68000,
            status: 'Review',
            dueDate: '2026-09-12',
            description: 'Large format outdoor front-lit flex print with UV resistant ink formulation and perimeter eyelets.',
            createdAt: '2026-08-28',
          },
          {
            id: 'proj-103',
            title: 'TechNova 3D Kinetic Logo Reveal Reel',
            clientId: 'client-3',
            clientName: 'TechNova Solutions',
            category: 'Motion Graphics',
            budget: 28000,
            status: 'In Progress',
            dueDate: '2026-09-15',
            description: '3D chrome logo animation, sound design, sound effects stings and 9:16 Instagram vertical format.',
            createdAt: '2026-09-01',
          },
          {
            id: 'proj-104',
            title: 'Malabar Heritage Gold Packaging Box',
            clientId: 'client-4',
            clientName: 'Malabar Heritage Jewellers',
            category: 'Packaging Design',
            budget: 35000,
            status: 'Completed',
            dueDate: '2026-08-30',
            description: 'Rigid luxury gift box packaging, die-line templates, CMYK press proofing and sample test.',
            createdAt: '2026-08-01',
          },
        ];

  const filteredProjects = displayProjects.filter((p) => {
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>In Production</span>
          </span>
        );
      case 'Review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Client Review</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed &amp; Delivered</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5738]" />
            <span>Client Project Workspace</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-950 tracking-tight">
            My Active Studio Projects
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Real-time milestones, delivery schedules, proof downloads, and WhatsApp support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenStartProject}
            className="px-4 py-2.5 bg-[#FF5738] hover:bg-[#ff4220] text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-2"
          >
            <span>Commission New Work</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {['ALL', 'In Progress', 'Review', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {st === 'ALL' ? 'All Projects' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search project or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl outline-none focus:border-[#FF5738] transition"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-zinc-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {project.category}
                  </span>
                  {getStatusBadge(project.status)}
                  <span className="text-xs text-zinc-400 font-mono">ID: {project.id}</span>
                </div>

                <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                  {project.title}
                </h3>

                <p className="text-xs text-zinc-500 line-clamp-2 max-w-2xl">
                  {project.description || 'Custom creative deliverable by Gizmo Design studio team.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1">
                  <span className="font-semibold text-zinc-700">Client: {project.clientName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Target Delivery: <strong className="text-zinc-800">{project.dueDate}</strong></span>
                  </span>
                  <span>•</span>
                  <span>Estimate: ₹{project.budget.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
                <a
                  href={`https://wa.me/919845879017?text=Hello%20Gizmo%20Design%2C%20status%20update%20request%20for%20project%20${encodeURIComponent(
                    project.title
                  )}%20(${project.id})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span>WhatsApp Project Chat</span>
                </a>

                <button
                  onClick={() => alert(`Downloading high-resolution proof pack for: ${project.title}`)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Proofs &amp; Assets</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-3">
            <Layers className="w-8 h-8 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-950">No projects match your search</h3>
            <p className="text-xs text-zinc-500">Try adjusting your status filter or search query.</p>
          </div>
        )}
      </div>

      {/* Support Box */}
      <div className="p-6 rounded-2xl bg-zinc-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-sm font-black">Need instant revision or express delivery?</div>
          <div className="text-xs text-zinc-400">
            Our creative directors are active on WhatsApp from 9:00 AM to 10:00 PM IST.
          </div>
        </div>
        <a
          href="https://wa.me/919845879017?text=Hello%20Gizmo%20Design%20Director%2C%20urgent%20inquiry"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-white text-white" />
          <span>Priority Studio Desk</span>
        </a>
      </div>
    </div>
  );
};

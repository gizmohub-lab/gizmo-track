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
  Inbox,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { AppRoute, Project, ProjectRequest } from '../../types';

interface MyProjectsViewProps {
  projects: Project[];
  requests?: ProjectRequest[];
  onNavigate: (route: AppRoute) => void;
  onOpenStartProject: () => void;
}

export const MyProjectsView: React.FC<MyProjectsViewProps> = ({
  projects,
  requests = [],
  onNavigate,
  onOpenStartProject,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'requests'>(
    requests.length > 0 && projects.length === 0 ? 'requests' : 'projects'
  );
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
            description:
              'Core logomark system, bilingual typography specs, certificate layouts and gold-foiled event covers.',
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
            description:
              'Large format outdoor front-lit flex print with UV resistant ink formulation and perimeter eyelets.',
            createdAt: '2026-08-28',
          },
        ];

  const filteredProjects = displayProjects.filter((p) => {
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
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

  const getRequestStatusBadge = (status: ProjectRequest['requestStatus']) => {
    switch (status) {
      case 'Pending Review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Pending Review</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Under Review</span>
          </span>
        );
      case 'Accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accepted · Active Project</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Declined</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
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
            My Creative Projects &amp; Commissions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Real-time milestones, submission review status, delivery schedules, and WhatsApp support.
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

      {/* Main View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Active Projects</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-200">
              {displayProjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Submitted Requests</span>
            {requests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-[#FF5738] text-white">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'projects'
                ? 'Search project or client...'
                : 'Search request title or ref...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl outline-none focus:border-[#FF5738] transition"
          />
        </div>
      </div>

      {/* VIEW 1: ACTIVE PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
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
                {st === 'ALL' ? 'All Active Projects' : st}
              </button>
            ))}
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
                        {project.category || 'Creative Work'}
                      </span>
                      {getStatusBadge(project.status)}
                      <span className="text-xs text-zinc-400 font-mono">
                        {project.projectCode || project.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                      {project.title}
                    </h3>

                    <p className="text-xs text-zinc-500 line-clamp-2 max-w-2xl">
                      {project.description ||
                        'Custom creative deliverable by Gizmo Design studio team.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1">
                      <span className="font-semibold text-zinc-700">
                        Client: {project.clientName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          Target Delivery:{' '}
                          <strong className="text-zinc-800">
                            {project.dueDate || project.deadlineDate || 'TBD'}
                          </strong>
                        </span>
                      </span>
                      {project.budget !== undefined && project.budget > 0 && (
                        <>
                          <span>•</span>
                          <span>Estimate: ₹{project.budget.toLocaleString('en-IN')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
                    <a
                      href={`https://wa.me/919845879017?text=Hello%20Gizmo%20Design%2C%20status%20update%20request%20for%20project%20${encodeURIComponent(
                        project.title
                      )}%20(${project.projectCode || project.id})`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      <span>WhatsApp Project Chat</span>
                    </a>

                    <button
                      onClick={() =>
                        alert(`Downloading high-resolution proof pack for: ${project.title}`)
                      }
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
                <h3 className="text-sm font-bold text-zinc-950">No projects match your filter</h3>
                <p className="text-xs text-zinc-500">
                  Try adjusting your status filter or search query.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SUBMITTED PROJECT REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-zinc-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded bg-zinc-900 text-white">
                      {req.requestNumber}
                    </span>
                    {getRequestStatusBadge(req.requestStatus)}
                    <span className="text-xs text-zinc-400 font-mono">
                      Submitted: {req.submittedAt ? req.submittedAt.split('T')[0] : 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                    {req.projectTitle}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {req.services.map((srv) => (
                      <span
                        key={srv}
                        className="px-2 py-0.5 rounded-md bg-orange-50 text-[#FF5738] border border-orange-100 text-[11px] font-bold"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-2 max-w-2xl pt-1">
                    {req.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 pt-1">
                    <span>
                      Budget: <strong className="text-zinc-800">{req.budgetRange}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Timeline:{' '}
                      <strong className="text-zinc-800">
                        {req.requestedDeadline || req.timelineOption}
                      </strong>
                    </span>
                    {req.attachments && req.attachments.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{req.attachments.length} attached brief files</span>
                      </>
                    )}
                  </div>

                  {req.requestStatus === 'Accepted' && req.convertedProjectId && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between gap-3 text-emerald-900 mt-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          This request has been accepted into studio production as project{' '}
                          <strong className="font-mono font-bold">
                            {req.convertedProjectCode || req.convertedProjectId}
                          </strong>
                          !
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('projects')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap"
                      >
                        View in Projects →
                      </button>
                    </div>
                  )}

                  {req.requestStatus === 'Rejected' && req.rejectionReason && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 mt-2">
                      <div className="font-bold flex items-center gap-1.5 text-rose-700">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Declined Notes from Creative Director:</span>
                      </div>
                      <p className="mt-1 text-rose-800">{req.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
                  <a
                    href={`https://wa.me/919845879017?text=Hello%20Gizmo%20Design%2C%20inquiry%20regarding%20request%20${encodeURIComponent(
                      req.requestNumber
                    )}%20for%20${encodeURIComponent(req.projectTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5738] flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950">No project requests submitted yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Ready to start your next creative initiative? Fill out our 8-step project brief to submit for studio review.
                </p>
              </div>
              <button
                onClick={onOpenStartProject}
                className="px-4 py-2.5 bg-zinc-950 hover:bg-[#FF5738] text-white rounded-xl text-xs font-extrabold transition shadow-xs inline-flex items-center gap-2"
              >
                <span>Submit a Project Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

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

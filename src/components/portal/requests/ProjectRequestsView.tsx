import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Mail,
  Phone,
  Building,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  User,
  Sparkles,
  Download,
  AlertCircle,
  ChevronRight,
  Check,
  X,
  History,
  Tag,
  ShieldCheck,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { ProjectRequest, ProjectRequestStatus, Project, Client } from '../../../types';
import { formatExactDateTimeString, formatDisplayDate } from '../../../utils/dateTimeUtils';
import {
  normalizeRequestStatus,
  getRequestStatusDisplayLabel,
  normalizeWhatsAppNumber,
  generateWhatsAppAcceptanceMessage,
} from '../../../services/projectRequestsService';

interface ProjectRequestsViewProps {
  requests: ProjectRequest[];
  projects: Project[];
  clients: Client[];
  onAcceptRequest: (request: ProjectRequest) => void;
  onRejectRequest: (request: ProjectRequest, reason?: string) => void;
  onMarkUnderReview: (request: ProjectRequest) => void;
  onOpenProjectWorkspace?: (projectId: string) => void;
  initialSelectedRequestId?: string | null;
  onClearSelectedRequest?: () => void;
}

export const ProjectRequestsView: React.FC<ProjectRequestsViewProps> = ({
  requests,
  projects,
  clients,
  onAcceptRequest,
  onRejectRequest,
  onMarkUnderReview,
  onOpenProjectWorkspace,
  initialSelectedRequestId,
  onClearSelectedRequest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(() => {
    if (initialSelectedRequestId) {
      return requests.find((r) => r.id === initialSelectedRequestId) || null;
    }
    return null;
  });

  // Modal confirmation states
  const [showAcceptConfirmModal, setShowAcceptConfirmModal] = useState<ProjectRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<ProjectRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [whatsappPreviewModal, setWhatsappPreviewModal] = useState<{
    request: ProjectRequest;
    normalizedPhone: string;
    message: string;
  } | null>(null);
  const [whatsappErrorNotice, setWhatsappErrorNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Keep selectedRequest updated when requests prop changes
  React.useEffect(() => {
    if (selectedRequest) {
      const fresh = requests.find((r) => r.id === selectedRequest.id);
      if (fresh) setSelectedRequest(fresh);
    }
  }, [requests]);

  // Handle external selection
  React.useEffect(() => {
    if (initialSelectedRequestId) {
      const matched = requests.find((r) => r.id === initialSelectedRequestId);
      if (matched) {
        setSelectedRequest(matched);
      }
    }
  }, [initialSelectedRequestId, requests]);

  // Status Counts (using normalized internal statuses)
  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => normalizeRequestStatus(r.requestStatus || (r as any).status) === 'pending_review').length,
      underReview: requests.filter((r) => normalizeRequestStatus(r.requestStatus || (r as any).status) === 'under_review').length,
      accepted: requests.filter((r) => normalizeRequestStatus(r.requestStatus || (r as any).status) === 'accepted').length,
      rejected: requests.filter((r) => normalizeRequestStatus(r.requestStatus || (r as any).status) === 'rejected').length,
    };
  }, [requests]);

  // Filtered requests (sorted by submittedAt DESC so newest appears first)
  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        const norm = normalizeRequestStatus(r.requestStatus || (r as any).status);
        const matchesTab =
          selectedStatusTab === 'ALL' ||
          (selectedStatusTab === 'Pending' && norm === 'pending_review') ||
          (selectedStatusTab === 'Under Review' && norm === 'under_review') ||
          (selectedStatusTab === 'Accepted' && norm === 'accepted') ||
          (selectedStatusTab === 'Rejected' && norm === 'rejected');

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          r.projectTitle.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          (r.companyName && r.companyName.toLowerCase().includes(q)) ||
          r.requestNumber.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.services.some((s) => s.toLowerCase().includes(q));

        return matchesTab && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.submittedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.submittedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }, [requests, selectedStatusTab, searchQuery]);

  // Status Badge Component
  const renderStatusBadge = (rawStatus?: string) => {
    const norm = normalizeRequestStatus(rawStatus);
    switch (norm) {
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-500" />
            Under Review
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            {rawStatus || 'Pending'}
          </span>
        );
    }
  };

  const handleConfirmAccept = () => {
    if (!showAcceptConfirmModal) return;
    const req = showAcceptConfirmModal;
    const isAlreadyAccepted = normalizeRequestStatus(req.requestStatus || (req as any).status) === 'accepted';

    if (isAlreadyAccepted) {
      setShowAcceptConfirmModal(null);
      setWhatsappErrorNotice('Project request already accepted.');
      setTimeout(() => setWhatsappErrorNotice(null), 4000);
      return;
    }

    onAcceptRequest(req);
    setShowAcceptConfirmModal(null);

    const matchedProject = projects.find((p) => p.id === req.projectId || p.title === req.projectTitle);
    const clientPhone = req.whatsapp || matchedProject?.clientPhone || '';
    const { normalized, isValid } = normalizeWhatsAppNumber(clientPhone);

    if (!isValid || !normalized) {
      setWhatsappErrorNotice(
        `Client WhatsApp number ("${req.whatsapp || 'Missing'}") is missing or invalid. Please update client contact details.`
      );
      setTimeout(() => setWhatsappErrorNotice(null), 6000);
      return;
    }

    const message = generateWhatsAppAcceptanceMessage(req, matchedProject);
    setWhatsappPreviewModal({
      request: req,
      normalizedPhone: normalized,
      message,
    });
  };

  const handleOpenWhatsAppPreview = () => {
    if (!whatsappPreviewModal) return;
    const { normalizedPhone, message, request } = whatsappPreviewModal;
    const url = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    setWhatsappPreviewModal(null);
    setSuccessToast(`WhatsApp acceptance message opened in WhatsApp for ${request.clientName}.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleConfirmReject = () => {
    if (!showRejectModal) return;
    onRejectRequest(showRejectModal, rejectionReason);
    setShowRejectModal(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-sm border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EE1D45]/20 border border-[#EE1D45]/30 text-[#EE1D45] text-xs font-black tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Client Inflow Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Project Requests &amp; Intake
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Direct client briefs submitted from the public Start a Project portal. Review requirements,
            assets, budget expectations, and accept them into official Gizmo Projects with one click.
          </p>
        </div>

        {/* Quick KPI badges */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Pending Review</span>
            <span className="text-xl font-black text-amber-400 font-mono">{counts.pending}</span>
          </div>
          <div className="px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Under Review</span>
            <span className="text-xl font-black text-blue-400 font-mono">{counts.underReview}</span>
          </div>
          <div className="px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Accepted</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{counts.accepted}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-zinc-100/80 rounded-2xl border border-zinc-200">
          {[
            { id: 'ALL', label: 'All Requests', count: counts.all },
            { id: 'Pending', label: 'Pending Review', count: counts.pending, alert: counts.pending > 0 },
            { id: 'Under Review', label: 'Under Review', count: counts.underReview },
            { id: 'Accepted', label: 'Accepted', count: counts.accepted },
            { id: 'Rejected', label: 'Rejected', count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                selectedStatusTab === tab.id
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  selectedStatusTab === tab.id
                    ? tab.alert
                      ? 'bg-amber-100 text-amber-800 font-extrabold'
                      : 'bg-zinc-100 text-zinc-800'
                    : tab.alert
                    ? 'bg-amber-100 text-amber-800 font-extrabold'
                    : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search request, client, company, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl outline-none focus:border-[#EE1D45] transition shadow-2xs"
          />
        </div>
      </div>

      {/* Requests Table / List */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Request #</th>
                  <th className="py-3.5 px-4">Client &amp; Company</th>
                  <th className="py-3.5 px-4">Project Title &amp; Services</th>
                  <th className="py-3.5 px-4">Budget Range</th>
                  <th className="py-3.5 px-4">Timeline / Deadline</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`hover:bg-zinc-50/70 transition cursor-pointer ${
                      selectedRequest?.id === req.id ? 'bg-[#EE1D45]/5' : ''
                    }`}
                  >
                    {/* Request # */}
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-950 font-black">{req.requestNumber}</span>
                        {req.attachments && req.attachments.length > 0 && (
                          <span
                            title={`${req.attachments.length} attachment(s)`}
                            className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-bold"
                          >
                            📎 {req.attachments.length}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client & Company */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                          <span>{req.clientName}</span>
                        </div>
                        {req.companyName && (
                          <div className="text-[11px] text-zinc-500 font-medium">
                            {req.companyName}
                          </div>
                        )}
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {req.whatsapp}
                        </div>
                      </div>
                    </td>

                    {/* Project Title & Services */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div>
                        <div className="font-extrabold text-zinc-950 truncate max-w-xs" title={req.projectTitle}>
                          {req.projectTitle}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {req.services.slice(0, 3).map((srv, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold"
                            >
                              {srv}
                            </span>
                          ))}
                          {req.services.length > 3 && (
                            <span className="text-[10px] text-zinc-400 font-semibold">
                              +{req.services.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Budget Range */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-zinc-800 bg-zinc-100 px-2 py-1 rounded-md text-[11px]">
                        {req.budgetRange}
                      </span>
                    </td>

                    {/* Timeline / Requested Deadline */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-zinc-800 block text-xs">
                          {req.timelineOption}
                        </span>
                        {req.requestedDeadline ? (
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <span>{formatDisplayDate(req.requestedDeadline)}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Standard Studio Pace</span>
                        )}
                      </div>
                    </td>

                    {/* Submitted At */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500 text-[11px]">
                      {formatExactDateTimeString(req.submittedAt)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(req.requestStatus)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition"
                        >
                          View
                        </button>

                        {normalizeRequestStatus(req.requestStatus || (req as any).status) !== 'accepted' &&
                          normalizeRequestStatus(req.requestStatus || (req as any).status) !== 'rejected' && (
                          <>
                            <button
                              onClick={() => setShowAcceptConfirmModal(req)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-2xs"
                              title="Accept into real project"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept</span>
                            </button>

                            <button
                              onClick={() => {
                                setShowRejectModal(req);
                                setRejectionReason('');
                              }}
                              className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Reject request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {normalizeRequestStatus(req.requestStatus || (req as any).status) === 'accepted' && req.projectId && (
                          <button
                            onClick={() => {
                              if (onOpenProjectWorkspace && req.projectId) {
                                onOpenProjectWorkspace(req.projectId);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition flex items-center gap-1 shadow-2xs"
                          >
                            <ExternalLink className="w-3 h-3 text-[#EE1D45]" />
                            <span>Open Project</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Inbox className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-900">No Project Requests found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No briefs match your current filter. When prospective clients submit via "Start a Project",
              they will appear here for review and acceptance.
            </p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between shrink-0 bg-zinc-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {selectedRequest.requestNumber.replace('REQ-', '#')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      {selectedRequest.requestNumber}
                    </span>
                    {renderStatusBadge(selectedRequest.requestStatus)}
                  </div>
                  <h2 className="text-base font-extrabold text-zinc-950 line-clamp-1">
                    {selectedRequest.projectTitle}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Accept Button in header if pending */}
                {normalizeRequestStatus(selectedRequest.requestStatus || (selectedRequest as any).status) !== 'accepted' &&
                  normalizeRequestStatus(selectedRequest.requestStatus || (selectedRequest as any).status) !== 'rejected' && (
                  <button
                    onClick={() => setShowAcceptConfirmModal(selectedRequest)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Accept Project</span>
                  </button>
                )}

                {normalizeRequestStatus(selectedRequest.requestStatus || (selectedRequest as any).status) === 'accepted' && selectedRequest.projectId && (
                  <button
                    onClick={() => {
                      if (onOpenProjectWorkspace && selectedRequest.projectId) {
                        onOpenProjectWorkspace(selectedRequest.projectId);
                      }
                    }}
                    className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#EE1D45]" />
                    <span>View Project in Portal</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    if (onClearSelectedRequest) onClearSelectedRequest();
                  }}
                  className="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-200/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Accepted Banner */}
              {normalizeRequestStatus(selectedRequest.requestStatus || (selectedRequest as any).status) === 'accepted' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">
                        Project Request Accepted &amp; Active
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        Linked to Gizmo Project:{' '}
                        <strong>{selectedRequest.projectCode || selectedRequest.projectId}</strong>{' '}
                        • Accepted on {formatExactDateTimeString(selectedRequest.acceptedAt)} by{' '}
                        {selectedRequest.acceptedBy || 'Admin'}.
                      </div>
                    </div>
                  </div>

                  {selectedRequest.projectId && (
                    <button
                      onClick={() => {
                        if (onOpenProjectWorkspace && selectedRequest.projectId) {
                          onOpenProjectWorkspace(selectedRequest.projectId);
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shrink-0 self-start sm:self-auto flex items-center gap-1.5"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Rejected Banner */}
              {normalizeRequestStatus(selectedRequest.requestStatus || (selectedRequest as any).status) === 'rejected' && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-900">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-extrabold text-xs">Project Request Rejected</div>
                    <div className="text-[11px] text-rose-700">
                      Reason: <em>{selectedRequest.rejectionReason || 'Production capacity constraint.'}</em>
                    </div>
                  </div>
                </div>
              )}

              {/* 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column (2 cols): Brief Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* Services Requested */}
                  <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <Layers className="w-3.5 h-3.5 text-[#EE1D45]" />
                      <span>Services Requested</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedRequest.services.map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-white border border-zinc-200 font-bold text-xs text-zinc-900 shadow-2xs"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Project Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Project Brief &amp; Description</span>
                    </h3>
                    <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-xs text-zinc-800 leading-relaxed whitespace-pre-line font-medium">
                      {selectedRequest.description || 'No detailed description provided.'}
                    </div>
                  </div>

                  {/* Goals & Target Audience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Primary Goals
                      </span>
                      {selectedRequest.goals && selectedRequest.goals.length > 0 ? (
                        <ul className="text-xs text-zinc-800 space-y-1 font-semibold list-disc list-inside">
                          {selectedRequest.goals.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-zinc-400">Not specified</p>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Target Audience
                      </span>
                      <p className="text-xs text-zinc-800 font-medium">
                        {selectedRequest.targetAudience || 'General / Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Reference Links & Custom Requirements */}
                  {(selectedRequest.referenceLinks || selectedRequest.customRequirements) && (
                    <div className="space-y-3">
                      {selectedRequest.referenceLinks && (
                        <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Reference Links / Moodboard
                          </span>
                          <p className="text-xs text-zinc-800 break-all font-mono">
                            {selectedRequest.referenceLinks}
                          </p>
                        </div>
                      )}

                      {selectedRequest.customRequirements && (
                        <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Special Requirements &amp; Notes
                          </span>
                          <p className="text-xs text-zinc-800 whitespace-pre-line font-medium">
                            {selectedRequest.customRequirements}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uploaded Assets & Files */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Download className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Uploaded Client Assets ({selectedRequest.attachments?.length || 0})</span>
                      </span>
                    </h3>

                    {selectedRequest.attachments && selectedRequest.attachments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedRequest.attachments.map((file) => (
                          <div
                            key={file.id}
                            className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3 hover:border-zinc-300 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileCheck className="w-5 h-5 text-zinc-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-zinc-950 truncate">{file.name}</p>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {file.size || 'Attachment'} • {file.category || 'Brief'}
                                </span>
                              </div>
                            </div>

                            {file.url ? (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200 transition shrink-0"
                                title="Open or download file"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-400 shrink-0">Stored</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-xs text-zinc-400">
                        No files or briefs attached to this request.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (1 col): Client Contact, Budget, Timeline & History */}
                <div className="space-y-6">
                  {/* Client Card */}
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-zinc-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                          Client Contact
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Name</span>
                        <span className="text-xs font-bold text-zinc-950">{selectedRequest.clientName}</span>
                      </div>

                      {selectedRequest.companyName && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Organization</span>
                          <span className="text-xs font-medium text-zinc-800">{selectedRequest.companyName}</span>
                        </div>
                      )}

                      {selectedRequest.industry && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Industry</span>
                          <span className="text-xs font-medium text-zinc-800">{selectedRequest.industry}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">WhatsApp Phone</span>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-xs font-mono font-bold text-zinc-900">
                            {selectedRequest.whatsapp}
                          </span>
                          <a
                            href={`https://wa.me/${selectedRequest.whatsapp.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(
                              selectedRequest.clientName
                            )}%2C%20regarding%20your%20Gizmo%20Design%20project%20request%20(${selectedRequest.requestNumber})`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            title="Chat with client on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Email</span>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-xs font-mono text-zinc-700 truncate max-w-[180px]">
                            {selectedRequest.email}
                          </span>
                          <a
                            href={`mailto:${selectedRequest.email}?subject=Gizmo%20Design%20Project%20Request%20${selectedRequest.requestNumber}`}
                            className="p-1 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition"
                            title="Send email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commercials: Budget & Timeline */}
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                      <DollarSign className="w-4 h-4 text-zinc-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                        Scope &amp; Budget
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Budget Expectation</span>
                        <span className="font-mono font-extrabold text-zinc-950 text-sm">
                          {selectedRequest.budgetRange}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Requested Pace</span>
                        <span className="font-bold text-zinc-800">{selectedRequest.timelineOption}</span>
                      </div>

                      {selectedRequest.requestedDeadline && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Target Deadline</span>
                          <span className="font-mono font-bold text-zinc-800">
                            {formatDisplayDate(selectedRequest.requestedDeadline)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Progression Workflow Actions */}
                  {normalizeRequestStatus(selectedRequest.requestStatus || (selectedRequest as any).status) !== 'accepted' &&
                    normalizeRequestStatus(selectedRequest.requestStatus || (selectedRequest as any).status) !== 'rejected' && (
                    <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                        Intake Decision
                      </span>

                      <button
                        onClick={() => setShowAcceptConfirmModal(selectedRequest)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>✓ Accept Project</span>
                      </button>

                      {normalizeRequestStatus(selectedRequest.requestStatus || (selectedRequest as any).status) === 'pending_review' && (
                        <button
                          onClick={() => onMarkUnderReview(selectedRequest)}
                          className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Mark as Under Review</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowRejectModal(selectedRequest);
                          setRejectionReason('');
                        }}
                        className="w-full py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>✕ Reject Request</span>
                      </button>
                    </div>
                  )}

                  {/* Activity History */}
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                      <History className="w-3.5 h-3.5 text-zinc-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                        Activity History
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      {selectedRequest.history && selectedRequest.history.length > 0 ? (
                        selectedRequest.history.map((act) => (
                          <div key={act.id} className="relative pl-4 border-l-2 border-zinc-200 space-y-0.5">
                            <div className="text-[10px] font-mono text-zinc-400">{act.timestamp}</div>
                            <div className="font-semibold text-zinc-800 text-[11px]">{act.action}</div>
                            {act.note && <div className="text-[10px] text-zinc-500 italic">{act.note}</div>}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-zinc-400">
                          Submitted on {formatExactDateTimeString(selectedRequest.submittedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between shrink-0 bg-zinc-50">
              <span className="text-xs text-zinc-400 font-mono">ID: {selectedRequest.id}</span>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  if (onClearSelectedRequest) onClearSelectedRequest();
                }}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCEPT CONFIRMATION MODAL */}
      {showAcceptConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-zinc-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-zinc-950">Accept this project request?</h3>
              <p className="text-xs text-zinc-500">
                Accepting this request will create a new project in the Gizmo Portal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Project:</span>
                <span className="font-bold text-zinc-900">{showAcceptConfirmModal.projectTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Client:</span>
                <span className="font-semibold text-zinc-900">{showAcceptConfirmModal.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Services:</span>
                <span className="font-medium text-zinc-800">{showAcceptConfirmModal.services.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Target Budget:</span>
                <span className="font-mono font-bold text-zinc-900">{showAcceptConfirmModal.budgetRange}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 text-center">
              ✓ Links client &amp; existing files • Dispatches in-app client notification
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowAcceptConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Accept &amp; Notify Client</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP CLIENT NOTIFICATION PREVIEW MODAL */}
      {whatsappPreviewModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-950">WhatsApp Client Notification</h3>
                  <p className="text-[11px] text-zinc-500">Ready to notify client via WhatsApp acceptance message</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappPreviewModal(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500 font-semibold">Recipient WhatsApp:</span>
                <span className="font-mono font-bold text-emerald-700">+{whatsappPreviewModal.normalizedPhone}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Prepared Message Preview:
                </label>
                <div className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-[11px] leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap select-all">
                  {whatsappPreviewModal.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
              <button
                onClick={() => setWhatsappPreviewModal(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition"
              >
                Cancel / Skip
              </button>
              <button
                onClick={handleOpenWhatsAppPreview}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast / Error Banners */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 border border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {whatsappErrorNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-zinc-950 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 border border-amber-600">
          <AlertCircle className="w-4 h-4 text-zinc-950" />
          <span>{whatsappErrorNotice}</span>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-zinc-950">Reject this project request?</h3>
              <p className="text-xs text-zinc-500">
                The client will be notified respectfully in their client portal.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 block">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Timeline does not currently fit our production schedule."
                rows={3}
                className="w-full p-3 text-xs border border-zinc-200 rounded-xl outline-none focus:border-rose-500 transition resize-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Timeline does not currently fit our production schedule.',
                  'Service out of current studio capacity.',
                  'Need more details to scope properly.',
                ].map((pre, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRejectionReason(pre)}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition"
                  >
                    {pre.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

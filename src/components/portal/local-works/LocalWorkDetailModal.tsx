import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  Building,
  MapPin,
  Tag,
  IndianRupee,
  Paperclip,
  Plus,
  Edit2,
  Copy,
  CheckCircle2,
  Trash2,
  FileText,
  History,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Download,
  Share2,
  Users,
} from 'lucide-react';
import {
  LocalWork,
  LocalWorkStatus,
  PaymentStatus,
  LocalWorkAttachment,
  CustomDesigner,
} from '../../../types';
import { formatINR } from '../../../utils/formatters';
import {
  getStatusConfig,
  calculateWorkDeadline,
  buildWhatsAppUrl,
  WORK_STATUSES,
  getWorkFinancials,
  getPaymentStatusBadgeStyle,
} from '../../../utils/localWorkUtils';
import { WorkTypeBadge } from './WorkTypeBadge';
import { QuickAssignDropdown } from './QuickAssignDropdown';

interface LocalWorkDetailModalProps {
  work: LocalWork | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (work: LocalWork) => void;
  onDuplicate: (work: LocalWork) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: LocalWorkStatus) => void;
  onUpdatePaymentStatus: (id: string, newPaymentStatus: PaymentStatus) => void;
  onOpenPaymentModal?: (work: LocalWork) => void;
  onAddRevision: (id: string, note: string) => void;
  onAddAttachment: (id: string, attachment: LocalWorkAttachment) => void;
  onCreateInvoice: (work: LocalWork) => void;
  designers?: CustomDesigner[];
  onQuickAssignDesigner?: (id: string, designer: string) => void;
  onAddCustomDesigner?: (designer: CustomDesigner) => void;
}

export const LocalWorkDetailModal: React.FC<LocalWorkDetailModalProps> = ({
  work,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onOpenPaymentModal,
  onAddRevision,
  onAddAttachment,
  onCreateInvoice,
  designers = [],
  onQuickAssignDesigner,
  onAddCustomDesigner,
}) => {
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentCategory, setAttachmentCategory] = useState<
    'Design reference' | 'Client image' | 'Brief' | 'Final design' | 'Other'
  >('Design reference');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  if (!isOpen || !work) return null;

  const statusCfg = getStatusConfig(work.status);
  const deadlineResult = calculateWorkDeadline(work.deadlineDate, work.deadlineTime);
  const waUrl = buildWhatsAppUrl(
    work.clientWhatsApp || work.clientPhone,
    `Hello ${work.clientName}, regarding your order *${work.title}* (${work.workId || work.id}) with Gizmo Design:`
  );

  // Find assigned designer info
  const assignedDesignerObj = designers.find((d) => d.name === work.assignedTo);
  const designerWaUrl = assignedDesignerObj?.whatsapp
    ? `https://wa.me/${assignedDesignerObj.whatsapp}?text=${encodeURIComponent(
        `Hi ${assignedDesignerObj.name}, here is the work order details for *${work.title}* (${work.workId || work.id}). Deadline: ${work.deadlineDate}`
      )}`
    : null;

  const handleSaveRevision = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRevision(work.id, revisionNote.trim() || 'Client requested design revision');
    setRevisionNote('');
    setShowRevisionInput(false);
  };

  const handleSaveAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentName.trim()) return;

    const newAtt: LocalWorkAttachment = {
      id: `att-${Date.now()}`,
      name: attachmentName.trim(),
      type: attachmentUrl.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      size: '1.2 MB',
      category: attachmentCategory,
      url: attachmentUrl.trim() || undefined,
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    onAddAttachment(work.id, newAtt);
    setAttachmentName('');
    setAttachmentUrl('');
    setShowAttachmentInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              {work.workId || work.id}
            </span>
            <WorkTypeBadge
              workType={work.workType}
              otherDetail={work.otherWorkTypeDetail}
            />
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeBg} ${statusCfg.textColor} ${statusCfg.borderColor}`}
            >
              <span>{statusCfg.symbol}</span>
              <span>{statusCfg.label}</span>
            </span>
            {work.priority === 'Urgent' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF5738] text-white">
                Urgent
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(work)}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
              title="Edit Work Order"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(work)}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
              title="Duplicate Work"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(work.id)}
              className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Delete Work"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-800">
          {/* Main Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-bold rounded-md text-[11px] border border-zinc-200">
                {work.category || 'General Design'}
              </span>
              <span className="text-zinc-400 text-[11px]">
                Booked on {work.receivedDate || work.date}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight leading-snug">
              {work.title}
            </h1>
          </div>

          {/* Grid 1: Client Information & Deadline Countdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Card */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Client Information
                </span>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Client</span>
                  </a>
                )}
              </div>

              <div className="text-sm font-black text-zinc-950">{work.clientName}</div>

              {work.clientOrg && (
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{work.clientOrg}</span>
                </div>
              )}

              {work.clientPhone && (
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <a href={`tel:${work.clientPhone}`} className="hover:underline font-mono">
                    {work.clientPhone}
                  </a>
                </div>
              )}

              {work.clientLocation && (
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{work.clientLocation}</span>
                </div>
              )}
            </div>

            {/* Deadline & Designer Card with Quick Assign */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Target Deadline
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border ${deadlineResult.badgeClass}`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{deadlineResult.relativeText}</span>
                  </span>
                </div>
                <div className="font-mono text-xs font-semibold text-zinc-800 mt-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{deadlineResult.exactFormatted}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-0.5">
                      Assigned Designer
                    </span>
                    {onQuickAssignDesigner ? (
                      <div className="flex items-center gap-2">
                        <QuickAssignDropdown
                          currentDesigner={work.assignedTo}
                          supportingDesigners={work.supportingDesigners}
                          designers={designers}
                          onAssign={(desName) => onQuickAssignDesigner(work.id, desName)}
                          onAddCustomDesigner={(newD) => {
                            if (onAddCustomDesigner) onAddCustomDesigner(newD);
                            if (onQuickAssignDesigner) onQuickAssignDesigner(work.id, newD.name);
                          }}
                          compact={false}
                        />
                        {designerWaUrl && (
                          <a
                            href={designerWaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                            title="WhatsApp Designer Brief"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="font-bold text-zinc-900">{work.assignedTo || 'Unassigned'}</div>
                    )}
                  </div>

                  {/* Quick Status Selector */}
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-0.5">Status</span>
                    <select
                      value={work.status}
                      onChange={(e) => onUpdateStatus(work.id, e.target.value as LocalWorkStatus)}
                      className="px-2 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-900 outline-none focus:border-[#FF5738]"
                    >
                      {WORK_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.symbol} {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Supporting Designers info */}
                {work.supportingDesigners && work.supportingDesigners.length > 0 && (
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
                    <Users className="w-3 h-3 text-zinc-400" />
                    <span>Supporting:</span>
                    <div className="flex flex-wrap gap-1">
                      {work.supportingDesigners.map((sName) => (
                        <span key={sName} className="px-1.5 py-0.2 bg-zinc-200/80 rounded font-medium text-zinc-800">
                          {sName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid 2: Payment Tracking & Financials (Total / Got / To Get) */}
          {(() => {
            const fin = getWorkFinancials(work);
            const badge = getPaymentStatusBadgeStyle(fin.paymentStatus);

            return (
              <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Payment &amp; Financial Tracking
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>

                    {onOpenPaymentModal && (
                      <button
                        onClick={() => onOpenPaymentModal(work)}
                        className="px-3 py-1 bg-[#FF5738] hover:bg-[#ff4220] text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition"
                      >
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>Update Payment</span>
                      </button>
                    )}

                    <button
                      onClick={() => onCreateInvoice(work)}
                      className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* 3 Metric Cards: Total / Got / To Get */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80">
                    <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Total Amount
                    </div>
                    <div className="text-lg font-black text-zinc-950 mt-0.5">
                      {formatINR(fin.totalAmount)}
                    </div>
                    <div className="text-[10px] text-zinc-400">Total charged</div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <div className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
                      Amount Got
                    </div>
                    <div className="text-lg font-black text-emerald-950 mt-0.5">
                      {formatINR(fin.amountGot)}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">Already received</div>
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      fin.amountToGet > 0
                        ? 'bg-[#FFF1EE] border-[#FFB2A1]'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div
                      className={`text-[10px] font-mono font-bold uppercase ${
                        fin.amountToGet > 0 ? 'text-[#FF5738]' : 'text-zinc-400'
                      }`}
                    >
                      Amount To Get
                    </div>
                    <div
                      className={`text-lg font-black mt-0.5 ${
                        fin.amountToGet > 0 ? 'text-[#FF5738]' : 'text-zinc-950'
                      }`}
                    >
                      {formatINR(fin.amountToGet)}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {fin.amountToGet > 0 ? 'Pending collection' : 'Fully settled'}
                    </div>
                  </div>
                </div>

                {/* Payment History Log if exists */}
                {work.paymentRecords && work.paymentRecords.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Payment History ({work.paymentRecords.length})
                    </span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {work.paymentRecords.map((pr) => (
                        <div
                          key={pr.id}
                          className="flex items-center justify-between p-2 rounded bg-zinc-50 text-xs border border-zinc-200/60"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 font-mono">
                              {formatINR(pr.amount)}
                            </span>
                            {pr.method && (
                              <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded">
                                {pr.method}
                              </span>
                            )}
                            {pr.note && <span className="text-zinc-500 text-[11px]">{pr.note}</span>}
                          </div>
                          <span className="text-zinc-400 font-mono text-[10px]">{pr.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Design Brief / Notes */}
          {work.notes && (
            <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Design Brief / Notes
              </span>
              <p className="text-zinc-800 whitespace-pre-line leading-relaxed font-sans">
                {work.notes}
              </p>
            </div>
          )}

          {/* Attachments & Files */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-zinc-500" />
                <span className="font-bold text-zinc-900">
                  Files &amp; Attachments ({work.attachments?.length || 0})
                </span>
              </div>
              <button
                onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                className="px-2.5 py-1 text-[11px] font-bold text-[#FF5738] hover:bg-[#FFF1EE] border border-[#FFB2A1] rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Attachment</span>
              </button>
            </div>

            {/* Inline Attachment Form */}
            {showAttachmentInput && (
              <form
                onSubmit={handleSaveAttachment}
                className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5 animate-in fade-in"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="File name (e.g. Draft_Banner_v2.png)"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs outline-none focus:border-[#FF5738]"
                  />
                  <select
                    value={attachmentCategory}
                    onChange={(e) => setAttachmentCategory(e.target.value as any)}
                    className="px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs outline-none focus:border-[#FF5738]"
                  >
                    <option value="Design reference">Design reference</option>
                    <option value="Client image">Client image</option>
                    <option value="Brief">Brief</option>
                    <option value="Final design">Final design</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <input
                  type="url"
                  placeholder="Optional preview / Drive / Cloud URL"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs outline-none focus:border-[#FF5738]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAttachmentInput(false)}
                    className="px-3 py-1 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-xs font-bold"
                  >
                    Save File
                  </button>
                </div>
              </form>
            )}

            {/* Attachment Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {work.attachments && work.attachments.length > 0 ? (
                work.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between gap-2 hover:border-zinc-300 transition shadow-2xs"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {att.category || 'Reference'}
                      </span>
                      <p className="font-bold text-zinc-900 truncate mt-1 text-xs">{att.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{att.size || '1.5 MB'}</p>
                    </div>
                    {att.url ? (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg cursor-pointer">
                        <Download className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-4 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                  No files attached yet. Click "+ Add Attachment" to link design assets.
                </div>
              )}
            </div>
          </div>

          {/* Client Revision Tracking */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-zinc-900">
                  Client Revisions ({work.revisionCount || 0})
                </span>
              </div>
              <button
                onClick={() => setShowRevisionInput(!showRevisionInput)}
                className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded-lg text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Revision</span>
              </button>
            </div>

            {showRevisionInput && (
              <form
                onSubmit={handleSaveRevision}
                className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2 animate-in fade-in"
              >
                <input
                  type="text"
                  required
                  placeholder="Revision note (e.g. Change typography, darker background, updated guest name)"
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-200"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRevisionInput(false)}
                    className="px-3 py-1 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-purple-700 text-white rounded-lg text-xs font-bold"
                  >
                    Record Revision
                  </button>
                </div>
              </form>
            )}

            {work.revisions && work.revisions.length > 0 ? (
              <div className="space-y-2">
                {work.revisions.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2.5"
                  >
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-bold text-[10px]">
                      Rev #{rev.revisionNo}
                    </span>
                    <div className="flex-1">
                      <p className="text-zinc-800 font-medium text-xs">{rev.note}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{rev.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-[11px]">No revisions logged for this design order.</p>
            )}
          </div>

          {/* Activity History */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
            <div className="flex items-center gap-2 text-zinc-900 font-bold">
              <History className="w-4 h-4 text-zinc-500" />
              <span>Activity History</span>
            </div>

            <div className="relative pl-5 border-l-2 border-zinc-200 space-y-3 py-1">
              {work.history && work.history.length > 0 ? (
                work.history.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#FF5738] border-2 border-white ring-1 ring-zinc-300" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <span className="font-bold text-zinc-900 text-xs">{item.action}</span>
                      <span className="font-mono text-[10px] text-zinc-400">{item.timestamp}</span>
                    </div>
                    {item.note && (
                      <p className="text-zinc-500 text-[11px] mt-0.5">{item.note}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-zinc-400 text-xs">No activity logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicate(work)}
              className="px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate Work</span>
            </button>
            <button
              onClick={() => onEdit(work)}
              className="px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {work.status !== 'Completed' ? (
              <button
                onClick={() => {
                  onUpdateStatus(work.id, 'Completed');
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Complete</span>
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(work.id, 'In Progress')}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-open Work</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

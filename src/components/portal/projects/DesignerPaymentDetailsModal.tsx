import React, { useState } from 'react';
import {
  X,
  DollarSign,
  User,
  Phone,
  Mail,
  MessageCircle,
  Briefcase,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  Receipt,
  Calendar,
  Filter,
} from 'lucide-react';
import { Project, CustomDesigner } from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { DesignerWorkloadItem } from '../../../utils/projectUtils';

interface DesignerPaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  designerItem: DesignerWorkloadItem | null;
  onOpenPayModal: (designerId: string, workId?: string) => void;
  onOpenProjectWorkspace?: (projectId: string) => void;
}

export const DesignerPaymentDetailsModal: React.FC<DesignerPaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  designerItem,
  onOpenPayModal,
  onOpenProjectWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'works' | 'payments'>('works');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Project' | 'Local Work'>('all');

  if (!isOpen || !designerItem) return null;

  const filteredItems = designerItem.itemsBreakdown.filter((item) => {
    if (typeFilter === 'all') return true;
    return item.type === typeFilter;
  });

  return (
    <div
      id="designer-payment-details-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="designer-payment-details-modal-container"
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-900 px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-lg font-bold">
              {designerItem.designerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{designerItem.designerName}</h2>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-700">
                  {designerItem.type}
                </span>
                {designerItem.paymentStatus === 'Paid' ? (
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                    All Paid
                  </span>
                ) : designerItem.paymentStatus === 'Partially Paid' ? (
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
                    Partial Pending
                  </span>
                ) : (
                  <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/30">
                    Payment Pending
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-zinc-400">
                {designerItem.roleSpecialization && (
                  <span>{designerItem.roleSpecialization}</span>
                )}
                {designerItem.phone && (
                  <a
                    href={`tel:${designerItem.phone}`}
                    className="hover:text-zinc-200 flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{designerItem.phone}</span>
                  </a>
                )}
                {designerItem.whatsapp && (
                  <a
                    href={`https://wa.me/${designerItem.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-designer-modal-pay-now"
              onClick={() => onOpenPayModal(designerItem.designerId)}
              className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5"
            >
              <DollarSign className="h-4 w-4" />
              <span>Pay Designer</span>
            </button>
            <button
              type="button"
              id="btn-close-designer-details-modal"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-6 bg-zinc-50/70 border-b border-zinc-200/80">
          <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Earnings (Fee)
            </div>
            <div className="text-lg font-bold text-zinc-900 mt-1">
              {formatINR(designerItem.totalEarnings)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Gizmo allocated fee</div>
          </div>

          <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Paid to Designer
            </div>
            <div className="text-lg font-bold text-emerald-600 mt-1">
              {formatINR(designerItem.amountPaid)}
            </div>
            <div className="text-[11px] text-emerald-600/70 mt-0.5">Disbursed</div>
          </div>

          <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
            <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              Pending to Pay
            </div>
            <div className="text-lg font-bold text-rose-600 mt-1">
              {formatINR(designerItem.amountPending)}
            </div>
            <div className="text-[11px] text-rose-600/70 mt-0.5">Outstanding payout</div>
          </div>

          <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Projects Count
            </div>
            <div className="text-lg font-bold text-zinc-900 mt-1">
              {designerItem.projectsCount}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {designerItem.pendingWorksCount} deliverables pending
            </div>
          </div>

          <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Local Works
            </div>
            <div className="text-lg font-bold text-zinc-900 mt-1">
              {designerItem.localWorksCount}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {designerItem.completedWorksCount} total completed
            </div>
          </div>
        </div>

        {/* Tabs & Filters Bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="tab-designer-assigned-works"
              onClick={() => setActiveTab('works')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'works'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Assigned Works & Breakdown ({designerItem.itemsBreakdown.length})
            </button>
          </div>

          {activeTab === 'works' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 text-[11px] font-medium mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-zinc-200 text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                All ({designerItem.itemsBreakdown.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('Project')}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  typeFilter === 'Project'
                    ? 'bg-zinc-200 text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                Projects ({designerItem.projectsCount})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('Local Work')}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  typeFilter === 'Local Work'
                    ? 'bg-zinc-200 text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                Local Works ({designerItem.localWorksCount})
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              No works found for this filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50/90 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                    <th className="py-2.5 px-3.5">Work / Project</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3 text-right">Work Total</th>
                    <th className="py-2.5 px-3 text-right">Designer Fee</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Pending</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {filteredItems.map((item) => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-900 line-clamp-1">
                            {item.title}
                          </span>
                          {item.code && (
                            <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                              {item.code}
                            </span>
                          )}
                        </div>
                        {item.deadline && (
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            Due: {item.deadline}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            item.type === 'Project'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-600">
                        {item.clientName}
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-600 font-mono">
                        {formatINR(item.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-900 font-bold font-mono">
                        {formatINR(item.designerFee)}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-600 font-bold font-mono">
                        {formatINR(item.designerPaid)}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-600 font-bold font-mono">
                        {formatINR(item.designerPending)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            item.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.paymentStatus === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.designerPending > 0 && (
                            <button
                              type="button"
                              onClick={() => onOpenPayModal(designerItem.designerId, item.id)}
                              className="rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1 text-[11px] font-semibold transition-colors"
                            >
                              Pay
                            </button>
                          )}
                          {item.type === 'Project' && onOpenProjectWorkspace && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenProjectWorkspace(item.id);
                              }}
                              className="rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2.5 py-1 text-[11px] font-medium transition-colors"
                            >
                              Open
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-6 py-3.5 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <div>
            Showing {filteredItems.length} assigned records for {designerItem.designerName}
          </div>
          <button
            type="button"
            id="btn-close-designer-details-bottom"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

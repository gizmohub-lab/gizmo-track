import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Plus,
  Check,
  User,
  Phone,
  MessageSquare,
  Tag,
  IndianRupee,
  UserPlus,
  Video,
  FileImage,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  LocalWork,
  Client,
  LocalWorkPriority,
  PaymentStatus,
  LocalWorkStatus,
  DesignCategory,
  CustomDesigner,
  WorkTypeItem,
} from '../../../types';
import {
  generateNextWorkId,
  calculateAmountToGet,
  calculatePaymentStatus,
  getPaymentStatusBadgeStyle,
} from '../../../utils/localWorkUtils';
import { formatINR } from '../../../utils/formatters';
import { loadSmartDefaults, saveSmartDefaults } from '../../../data/mockData';
import { AddCustomDesignerModal } from './AddCustomDesignerModal';

interface NewLocalWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (work: LocalWork) => void;
  clients: Client[];
  categories: DesignCategory[] | string[];
  designers: CustomDesigner[];
  workTypes?: WorkTypeItem[];
  existingWorks: LocalWork[];
  editingWork?: LocalWork | null;
  onOpenManageCategories?: () => void;
  onAddCustomDesigner?: (designer: CustomDesigner) => void;
}

export const NewLocalWorkModal: React.FC<NewLocalWorkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  categories,
  designers,
  workTypes = [],
  existingWorks,
  editingWork,
  onOpenManageCategories,
  onAddCustomDesigner,
}) => {
  // Convert categories to array of names/objects
  const activeCategoryList: string[] = categories
    .map((c) => (typeof c === 'string' ? c : c.isActive ? c.name : null))
    .filter((c): c is string => Boolean(c));

  // Form states ordered logically:
  // 1. Work Title
  const [title, setTitle] = useState('');

  // 2. Client
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [clientOrg, setClientOrg] = useState('');

  // 3. Work Type (Poster / Motion / Other)
  const [workType, setWorkType] = useState('Poster');
  const [otherWorkTypeDetail, setOtherWorkTypeDetail] = useState('');

  // 4. Design Work Category
  const [category, setCategory] = useState('');

  // 5. Assigned Designer & Supporting Designers
  const [assignedTo, setAssignedTo] = useState('Unassigned');
  const [supportingDesigners, setSupportingDesigners] = useState<string[]>([]);
  const [showAddDesignerModal, setShowAddDesignerModal] = useState(false);

  // 6. Priority
  const [priority, setPriority] = useState<LocalWorkPriority>('Normal');

  // 7 & 8. Deadline Date & Time
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('18:00');

  // 9. Total Amount & Amount Got (Amount To Get is auto-calculated!)
  const [totalAmount, setTotalAmount] = useState<number | ''>(1500);
  const [amountGot, setAmountGot] = useState<number | ''>(0);

  // Status
  const [status, setStatus] = useState<LocalWorkStatus>('New');

  // 10. Notes
  const [notes, setNotes] = useState('');

  // Derived financial values
  const safeTotal = Math.max(0, Number(totalAmount) || 0);
  const safeGot = Math.max(0, Number(amountGot) || 0);
  const calculatedAmountToGet = calculateAmountToGet(safeTotal, safeGot);
  const calculatedPaymentStatus = calculatePaymentStatus(safeTotal, safeGot);

  // Prepopulate when opening or changing editingWork
  useEffect(() => {
    if (editingWork) {
      setTitle(editingWork.title || '');
      setClientName(editingWork.clientName || '');
      setClientPhone(editingWork.clientPhone || '');
      setClientWhatsApp(editingWork.clientWhatsApp || editingWork.clientPhone || '');
      setClientOrg(editingWork.clientOrg || '');
      setWorkType(editingWork.workType || 'Poster');
      setOtherWorkTypeDetail(editingWork.otherWorkTypeDetail || '');
      setCategory(editingWork.category || (activeCategoryList[0] || 'Poster'));
      setAssignedTo(editingWork.assignedTo || 'Unassigned');
      setSupportingDesigners(editingWork.supportingDesigners || []);
      setPriority(editingWork.priority || 'Normal');
      setStatus(editingWork.status || 'New');
      const workTotal = editingWork.totalAmount ?? editingWork.amount ?? 0;
      let workGot = editingWork.amountGot;
      if (workGot === undefined) {
        if (editingWork.paymentStatus === 'Paid') workGot = workTotal;
        else if (editingWork.paymentStatus === 'Partially Paid') workGot = Math.round(workTotal / 2);
        else workGot = 0;
      }
      setTotalAmount(workTotal);
      setAmountGot(workGot);
      setDeadlineDate(editingWork.deadlineDate || '');
      setDeadlineTime(editingWork.deadlineTime || '18:00');
      setNotes(editingWork.notes || editingWork.description || '');
    } else {
      // Smart Defaults for new works
      const defaults = loadSmartDefaults();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      setTitle('');
      setClientName(clients[0]?.name || '');
      setClientPhone(clients[0]?.phone || '');
      setClientWhatsApp(clients[0]?.phone ? clients[0].phone.replace(/[^\d]/g, '') : '');
      setClientOrg(clients[0]?.company || '');

      // Pre-select last used work type and category from smart defaults
      setWorkType(defaults.lastWorkType || 'Poster');
      setOtherWorkTypeDetail('');
      setCategory(defaults.lastCategory || activeCategoryList[0] || 'Poster');

      // Default designer: only assign if configured in defaults
      setAssignedTo(defaults.defaultDesigner || 'Unassigned');
      setSupportingDesigners([]);

      setPriority('Normal');
      setStatus('New');
      setTotalAmount(1500);
      setAmountGot(0);
      setDeadlineDate(tomorrowStr);
      setDeadlineTime('18:00');
      setNotes('');
    }
  }, [editingWork, isOpen, clients]);

  if (!isOpen) return null;

  const handleSelectClient = (name: string) => {
    setClientName(name);
    const found = clients.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (found) {
      if (found.phone) {
        setClientPhone(found.phone);
        setClientWhatsApp(found.phone.replace(/[^\d]/g, ''));
      }
      if (found.company) {
        setClientOrg(found.company);
      }
    }
  };

  const handleToggleSupportingDesigner = (desName: string) => {
    if (supportingDesigners.includes(desName)) {
      setSupportingDesigners(supportingDesigners.filter((d) => d !== desName));
    } else {
      setSupportingDesigners([...supportingDesigners, desName]);
    }
  };

  const handleDesignerAdded = (newDesigner: CustomDesigner) => {
    if (onAddCustomDesigner) {
      onAddCustomDesigner(newDesigner);
    }
    setAssignedTo(newDesigner.name);
    setShowAddDesignerModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')} Sep ${now.getFullYear()}`;

    const workId = editingWork?.workId || generateNextWorkId(existingWorks);

    // Save smart defaults for future works
    saveSmartDefaults({
      lastWorkType: workType,
      lastCategory: category,
    });

    const numTotal = Math.max(0, Number(totalAmount) || 0);
    const numGot = Math.max(0, Number(amountGot) || 0);
    const numToGet = calculateAmountToGet(numTotal, numGot);
    const computedStatus = calculatePaymentStatus(numTotal, numGot);

    let paymentRecords = editingWork?.paymentRecords || [];
    if (!editingWork && numGot > 0) {
      paymentRecords = [
        {
          id: `pay-${Date.now()}`,
          date: todayStr,
          amount: numGot,
          method: 'UPI',
          note: 'Initial payment received at booking',
        },
      ];
    } else if (editingWork) {
      const prevGot = Math.max(0, Number(editingWork.amountGot ?? 0));
      if (numGot > prevGot) {
        paymentRecords = [
          ...paymentRecords,
          {
            id: `pay-${Date.now()}`,
            date: todayStr,
            amount: numGot - prevGot,
            method: 'Other',
            note: 'Payment adjusted during order edit',
          },
        ];
      }
    }

    const updatedWork: LocalWork = {
      ...(editingWork || {}),
      id: editingWork?.id || `lw-${Date.now()}`,
      workId,
      title: title.trim(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      clientWhatsApp: (clientWhatsApp || clientPhone).replace(/[^\d]/g, '') || undefined,
      clientOrg: clientOrg.trim() || undefined,
      workType: workType,
      otherWorkTypeDetail: workType === 'Other' ? otherWorkTypeDetail.trim() : undefined,
      category: category || 'General Design',
      totalAmount: numTotal,
      amount: numTotal,
      amountGot: numGot,
      amountToGet: numToGet,
      paymentStatus: computedStatus,
      paymentRecords,
      status,
      priority,
      assignedTo: assignedTo.trim() || 'Unassigned',
      supportingDesigners: supportingDesigners.filter((d) => d !== assignedTo),
      date: editingWork?.date || todayStr,
      receivedDate: editingWork?.receivedDate || todayStr,
      deadlineDate: deadlineDate || todayStr,
      deadlineTime: deadlineTime || '18:00',
      notes: notes.trim() || undefined,
      revisionCount: editingWork?.revisionCount ?? 0,
      revisions: editingWork?.revisions || [],
      attachments: editingWork?.attachments || [],
      history: editingWork
        ? [
            ...(editingWork.history || []),
            {
              id: `hist-${Date.now()}`,
              timestamp: `${dateFormatted} · ${timeFormatted}`,
              action: 'Work order updated',
            },
          ]
        : [
            {
              id: `hist-${Date.now()}`,
              timestamp: `${dateFormatted} · ${timeFormatted}`,
              action: 'Work order created',
              note: `Booked for ${clientName} (${workType} · ${category})`,
            },
          ],
    };

    onSave(updatedWork);
    onClose();
  };

  const activeDesigners = designers.filter((d) => d.isActive);
  const staffDesigners = activeDesigners.filter((d) => d.type === 'Portal Staff');
  const externalDesigners = activeDesigners.filter((d) => d.type === 'External Designer');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5738]" />
            <div>
              <h2 className="text-base font-bold text-zinc-950">
                {editingWork ? `Edit Work: ${editingWork.workId}` : 'New Local Work Order'}
              </h2>
              <p className="text-[11px] text-zinc-500">
                Production tracking for graphics, flex, motion, and print works
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4.5 text-xs">
          {/* FIELD 1: Work Title */}
          <div>
            <label className="block font-bold text-zinc-900 mb-1">
              1. Work Title <span className="text-[#FF5738]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SNEC Annual Day Poster, Ramadan Special Flex 10x4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF5738] focus:ring-2 focus:ring-[#FF5738]/20 outline-none text-zinc-900 font-semibold text-xs transition"
              autoFocus
            />
          </div>

          {/* FIELD 2: Client */}
          <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-zinc-900">
                2. Client Details <span className="text-[#FF5738]">*</span>
              </label>
              {clients.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-zinc-400">Quick fill:</span>
                  <select
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="bg-white px-2 py-0.5 border border-zinc-300 rounded-lg text-zinc-700 outline-none font-medium"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select Client
                    </option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Client Name / Contact</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. DARUL HASANIYYAH SNEC"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none bg-white font-medium text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Phone / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="+91 94471 28409"
                    value={clientPhone}
                    onChange={(e) => {
                      setClientPhone(e.target.value);
                      setClientWhatsApp(e.target.value.replace(/[^\d]/g, ''));
                    }}
                    className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none bg-white text-zinc-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Organization / Brand (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Darul Hasaniyyah Educational Council"
                value={clientOrg}
                onChange={(e) => setClientOrg(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none bg-white text-zinc-900"
              />
            </div>
          </div>

          {/* FIELD 3: Work Type (Poster / Motion / Other) */}
          <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-zinc-900">
                3. Work Type <span className="text-[#FF5738]">*</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Top-level creative format</span>
            </div>

            {/* Work Type Segmented Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWorkType('Poster')}
                className={`py-2 px-3 rounded-xl font-bold border transition flex items-center justify-center gap-1.5 text-xs ${
                  workType === 'Poster'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100/80'
                }`}
              >
                <FileImage className="w-3.5 h-3.5 shrink-0" />
                <span>Poster</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkType('Motion')}
                className={`py-2 px-3 rounded-xl font-bold border transition flex items-center justify-center gap-1.5 text-xs ${
                  workType === 'Motion'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100/80'
                }`}
              >
                <Video className="w-3.5 h-3.5 shrink-0" />
                <span>Motion</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkType('Other')}
                className={`py-2 px-3 rounded-xl font-bold border transition flex items-center justify-center gap-1.5 text-xs ${
                  workType === 'Other'
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100/80'
                }`}
              >
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span>Other</span>
              </button>
            </div>

            {/* Other Work Type Detail input */}
            {workType === 'Other' && (
              <div className="pt-1 animate-in fade-in duration-150">
                <label className="block text-zinc-700 font-semibold mb-1">
                  Other Work Type: <span className="text-zinc-400 font-normal">(please specify)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acrylic Board, Rubber Stamp Fabrication, 3D Mockup"
                  value={otherWorkTypeDetail}
                  onChange={(e) => setOtherWorkTypeDetail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none bg-white text-zinc-900 text-xs"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* FIELD 4: Design Work Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-zinc-900">
                4. Design Work Category <span className="text-[#FF5738]">*</span>
              </label>
              {onOpenManageCategories && (
                <button
                  type="button"
                  onClick={onOpenManageCategories}
                  className="text-[11px] font-bold text-[#FF5738] hover:underline"
                >
                  + Manage Categories
                </button>
              )}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none bg-white text-zinc-900 font-medium text-xs"
            >
              {activeCategoryList.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
          </div>

          {/* FIELD 5: Assigned Designer (Primary + Supporting) */}
          <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-zinc-900">
                5. Assigned Designer <span className="text-[#FF5738]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddDesignerModal(true)}
                className="text-[11px] font-bold text-[#FF5738] hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ Add Custom Designer</span>
              </button>
            </div>

            {/* Primary Designer Selector */}
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Primary Lead Designer</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none bg-white text-zinc-900 font-semibold text-xs"
              >
                <option value="Unassigned">Unassigned</option>

                {staffDesigners.length > 0 && (
                  <optgroup label="Portal Staff">
                    {staffDesigners.map((d) => (
                      <option key={d.id} value={d.name}>
                        🏢 {d.name} {d.roleSpecialization ? `(${d.roleSpecialization})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}

                {externalDesigners.length > 0 && (
                  <optgroup label="External Partners">
                    {externalDesigners.map((d) => (
                      <option key={d.id} value={d.name}>
                        🌐 {d.name} {d.roleSpecialization ? `(${d.roleSpecialization})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Supporting Designers selector */}
            <div>
              <label className="block text-zinc-600 font-medium mb-1.5 flex items-center justify-between">
                <span>Supporting Designer(s) (Optional)</span>
                <span className="text-[10px] text-zinc-400">Collaborators or reviewers</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white rounded-xl border border-zinc-200">
                {activeDesigners.map((d) => {
                  if (d.name === assignedTo) return null; // don't show primary designer in supporting list
                  const isSelected = supportingDesigners.includes(d.name);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleToggleSupportingDesigner(d.name)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#FF5738]/10 text-[#FF5738] border-[#FF5738]/30 font-bold'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      <span>{d.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#FF5738]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FIELD 6: Priority */}
          <div>
            <label className="block font-bold text-zinc-900 mb-1.5">6. Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Normal', 'High', 'Urgent'] as LocalWorkPriority[]).map((p) => {
                const isSelected = priority === p;
                let activeClass = 'bg-zinc-900 text-white border-zinc-900';
                if (p === 'Urgent') activeClass = 'bg-rose-600 text-white border-rose-600';
                if (p === 'High') activeClass = 'bg-amber-600 text-white border-amber-600';
                if (p === 'Normal') activeClass = 'bg-blue-600 text-white border-blue-600';
                if (p === 'Low') activeClass = 'bg-zinc-600 text-white border-zinc-600';

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-center rounded-xl font-bold border transition text-xs ${
                      isSelected
                        ? `${activeClass} shadow-xs`
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100/80'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FIELDS 7 & 8: Deadline Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-900 mb-1">
                7. Deadline Date <span className="text-[#FF5738]">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none text-zinc-900 font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-900 mb-1">8. Deadline Time</label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none text-zinc-900 font-medium text-xs"
                />
              </div>
            </div>
          </div>

          {/* FIELD 9: Payment Tracking (Total Amount / Amount Got / Amount To Get) */}
          <div className="space-y-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-zinc-900 text-xs">
                9. Payment Details (To Get / Got)
              </label>
              {/* Payment Status badge automatically calculated */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-500 font-medium">Status:</span>
                {(() => {
                  const badge = getPaymentStatusBadgeStyle(calculatedPaymentStatus);
                  return (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-black border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Total Amount */}
              <div>
                <label className="block font-bold text-zinc-700 text-[11px] mb-1">
                  Total Amount (₹) <span className="text-[#FF5738]">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="1500"
                    value={totalAmount}
                    onChange={(e) =>
                      setTotalAmount(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none text-zinc-900 font-bold text-xs bg-white"
                  />
                </div>
                <span className="text-[10px] text-zinc-400">Total charged</span>
              </div>

              {/* Amount Got */}
              <div>
                <label className="block font-bold text-zinc-700 text-[11px] mb-1">
                  Amount Got (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={amountGot}
                    onChange={(e) =>
                      setAmountGot(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 focus:border-emerald-500 outline-none text-zinc-900 font-bold text-xs bg-white"
                  />
                </div>
                <span className="text-[10px] text-zinc-400">Already received</span>
              </div>

              {/* Amount To Get (Read-only / Auto-calculated) */}
              <div>
                <label className="block font-bold text-zinc-700 text-[11px] mb-1 flex items-center justify-between">
                  <span>Amount To Get (₹)</span>
                  <span className="text-[10px] text-[#FF5738] font-semibold">Auto</span>
                </label>
                <div
                  className={`w-full px-3 py-2 rounded-xl border font-mono font-bold text-xs flex items-center justify-between select-none ${
                    calculatedAmountToGet > 0
                      ? 'bg-[#FFF1EE] border-[#FFB2A1] text-[#FF5738]'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                  }`}
                >
                  <span>{formatINR(calculatedAmountToGet)}</span>
                  <span className="text-[10px] font-sans font-medium text-zinc-400">Locked</span>
                </div>
                <span className="text-[10px] text-zinc-400">
                  Total Amount - Amount Got (Non-editable)
                </span>
              </div>
            </div>
          </div>

          {/* Initial Status (if editing) */}
          {editingWork && (
            <div>
              <label className="block font-bold text-zinc-900 mb-1">Production Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LocalWorkStatus)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none bg-white text-zinc-900 font-semibold text-xs"
              >
                <option value="New">New</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Revision">Revision</option>
                <option value="Waiting for Client">Waiting for Client</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* FIELD 10: Notes */}
          <div>
            <label className="block font-bold text-zinc-900 mb-1">10. Work Notes / Brief Instructions</label>
            <textarea
              rows={3}
              placeholder="e.g. Dimensions 18x24 inches, client requested Malayalam calligraphy title and high-res PDF for digital press..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none text-zinc-900 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FF5738] hover:bg-[#ff4220] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingWork ? 'Save Changes' : 'Create Work Order'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Add Custom Designer Modal */}
      <AddCustomDesignerModal
        isOpen={showAddDesignerModal}
        onClose={() => setShowAddDesignerModal(false)}
        onAddDesigner={handleDesignerAdded}
      />
    </div>
  );
};

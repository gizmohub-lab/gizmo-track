import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Receipt,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  ExternalLink,
  DollarSign,
  AlertCircle,
  FileCheck,
  Check,
} from 'lucide-react';
import {
  Project,
  ProjectDeliverable,
  Invoice,
  InvoiceItem,
  Client,
  InvoiceSettings,
  TaxType,
} from '../../../types';
import {
  formatINR,
  calculateInvoiceTotals,
  getNextInvoiceNumber,
} from '../../../utils/formatters';
import { getProjectFinancials, formatSystemTimestamp } from '../../../utils/projectUtils';

export type InvoiceCreationMode = 'full' | 'deliverables' | 'custom';
export type InvoiceStageType = 'Advance' | 'Partial' | 'Final' | 'Custom';

interface ProjectCreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  existingInvoices: Invoice[];
  clients: Client[];
  settings: InvoiceSettings;
  initialMode?: InvoiceCreationMode;
  initialSelectedDeliverables?: ProjectDeliverable[];
  onGenerateAndSaveInvoice: (invoice: Invoice, openPreview?: boolean) => void;
  onOpenInFullEditor: (invoice: Invoice) => void;
}

export const ProjectCreateInvoiceModal: React.FC<ProjectCreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  project,
  existingInvoices,
  clients,
  settings,
  initialMode = 'full',
  initialSelectedDeliverables = [],
  onGenerateAndSaveInvoice,
  onOpenInFullEditor,
}) => {
  if (!isOpen) return null;

  // Project Financial status and previous invoices
  const financials = useMemo(
    () => getProjectFinancials(project, existingInvoices),
    [project, existingInvoices]
  );

  // Matched client record
  const clientObj = useMemo(
    () => clients.find((c) => c.id === project.clientId || c.name.toLowerCase() === project.clientName.toLowerCase()),
    [clients, project.clientId, project.clientName]
  );

  // Active creation mode: 'full' | 'deliverables' | 'custom'
  const [mode, setMode] = useState<InvoiceCreationMode>(
    initialSelectedDeliverables.length > 0 ? 'deliverables' : initialMode
  );

  // Invoice Number
  const [invoiceNo, setInvoiceNo] = useState<string>(() =>
    getNextInvoiceNumber(
      existingInvoices,
      settings?.numberingPrefix || 'A',
      settings?.startingNumber || 1
    )
  );

  // Dates
  const [invoiceDate, setInvoiceDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(() => {
    if (project.deadlineDate) return project.deadlineDate;
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Tax Configuration
  const [taxRate, setTaxRate] = useState<number>(settings?.defaultGstRate || 0);
  const [taxType, setTaxType] = useState<TaxType>(settings?.defaultTaxType || 'CGST_SGST');

  // Notes
  const [invoiceNotes, setInvoiceNotes] = useState<string>(
    `Project: ${project.title} (${project.projectCode || 'PRJ-WORK'})`
  );

  // --------------------------------------------------------------------------
  // MODE 1: FULL PROJECT INVOICE STATE
  // --------------------------------------------------------------------------
  const [fullBillingChoice, setFullBillingChoice] = useState<'unbilled' | 'full'>(
    financials.unbilledAmount > 0 && financials.totalInvoiced > 0 ? 'unbilled' : 'full'
  );
  const [fullCustomTitle, setFullCustomTitle] = useState<string>(
    `${project.title.toUpperCase()}${project.projectType ? ` [${project.projectType.toUpperCase()}]` : ''}`
  );

  // --------------------------------------------------------------------------
  // MODE 2: DELIVERABLES INVOICE STATE
  // --------------------------------------------------------------------------
  const [selectedDelMap, setSelectedDelMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (initialSelectedDeliverables.length > 0) {
      initialSelectedDeliverables.forEach((d) => {
        map[d.id] = true;
      });
    } else {
      // Default select all completed or all required
      (project.deliverables || []).forEach((d) => {
        if (d.isCompleted) map[d.id] = true;
      });
      // If none completed, select all required
      if (Object.keys(map).length === 0) {
        (project.deliverables || []).forEach((d) => {
          if (d.isRequired) map[d.id] = true;
        });
      }
    }
    return map;
  });

  // Deliverable custom prices (overrides)
  const [deliverablePrices, setDeliverablePrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    const deliverables = project.deliverables || [];
    const count = deliverables.length || 1;
    const defaultSplit = Math.round(financials.totalAmount / count);

    deliverables.forEach((d) => {
      map[d.id] = d.amount && d.amount > 0 ? d.amount : defaultSplit;
    });
    return map;
  });

  const handleToggleDeliverable = (id: string) => {
    setSelectedDelMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePriceChange = (id: string, price: number) => {
    setDeliverablePrices((prev) => ({ ...prev, [id]: Math.max(0, price) }));
  };

  const handleSelectAllDeliverables = () => {
    const map: Record<string, boolean> = {};
    (project.deliverables || []).forEach((d) => {
      map[d.id] = true;
    });
    setSelectedDelMap(map);
  };

  const handleSelectCompletedOnly = () => {
    const map: Record<string, boolean> = {};
    (project.deliverables || []).forEach((d) => {
      if (d.isCompleted) map[d.id] = true;
    });
    setSelectedDelMap(map);
  };

  // --------------------------------------------------------------------------
  // MODE 3: CUSTOM / STAGE BILLING STATE
  // --------------------------------------------------------------------------
  const [stageType, setStageType] = useState<InvoiceStageType>('Advance');
  const [customItems, setCustomItems] = useState<Array<{ id: string; description: string; amount: number }>>([
    {
      id: 'item-1',
      description: `Advance Deposit (50%) — ${project.title}`,
      amount: Math.round(financials.totalAmount * 0.5) || 5000,
    },
  ]);

  const handleApplyStagePreset = (preset: InvoiceStageType) => {
    setStageType(preset);
    if (preset === 'Advance') {
      const advAmount = Math.round(financials.totalAmount * 0.5) || Math.min(5000, financials.totalAmount || 5000);
      setCustomItems([
        {
          id: `item-${Date.now()}-1`,
          description: `Advance Deposit (50%) — ${project.title}`,
          amount: advAmount,
        },
      ]);
      setInvoiceNotes(`Advance Invoice for Project: ${project.title} (${project.projectCode || 'PRJ-WORK'})`);
    } else if (preset === 'Partial') {
      const partAmount = Math.round(financials.totalAmount * 0.3) || 3000;
      setCustomItems([
        {
          id: `item-${Date.now()}-1`,
          description: `Progress Milestone Payment — ${project.title}`,
          amount: partAmount,
        },
      ]);
      setInvoiceNotes(`Progress Milestone Invoice for Project: ${project.title}`);
    } else if (preset === 'Final') {
      const finalAmount = financials.unbilledAmount > 0 ? financials.unbilledAmount : financials.amountToGet;
      setCustomItems([
        {
          id: `item-${Date.now()}-1`,
          description: `Final Settlement & Asset Handover — ${project.title}`,
          amount: finalAmount,
        },
      ]);
      setInvoiceNotes(`Final Settlement Invoice for Project: ${project.title} (${project.projectCode || 'PRJ-WORK'})`);
    }
  };

  const handleAddCustomItem = () => {
    setCustomItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        description: 'Design Deliverable / Revision',
        amount: 1000,
      },
    ]);
  };

  const handleRemoveCustomItem = (id: string) => {
    if (customItems.length <= 1) return;
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCustomItem = (id: string, field: 'description' | 'amount', value: any) => {
    setCustomItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // --------------------------------------------------------------------------
  // COMPUTE LIVE LINE ITEMS & TOTALS BASED ON SELECTED MODE
  // --------------------------------------------------------------------------
  const calculatedItems: InvoiceItem[] = useMemo(() => {
    if (mode === 'full') {
      const targetAmount =
        fullBillingChoice === 'unbilled' && financials.unbilledAmount > 0
          ? financials.unbilledAmount
          : financials.totalAmount;

      return [
        {
          id: `item-${Date.now()}-1`,
          description: fullCustomTitle,
          quantity: 1,
          rate: targetAmount,
          amount: targetAmount,
          gstRate: taxRate,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: targetAmount,
        },
      ];
    }

    if (mode === 'deliverables') {
      const selected = (project.deliverables || []).filter((d) => selectedDelMap[d.id]);
      if (selected.length === 0) return [];

      return selected.map((d, index) => {
        const rate = deliverablePrices[d.id] ?? 0;
        return {
          id: `item-${Date.now()}-${index + 1}`,
          description: `${d.title} (${d.type})${d.isCompleted ? ' — Completed' : ''}`,
          quantity: 1,
          rate,
          amount: rate,
          gstRate: taxRate,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: rate,
        };
      });
    }

    // mode === 'custom'
    return customItems.map((item, index) => ({
      id: `item-${Date.now()}-${index + 1}`,
      description: item.description,
      quantity: 1,
      rate: Number(item.amount || 0),
      amount: Number(item.amount || 0),
      gstRate: taxRate,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: Number(item.amount || 0),
    }));
  }, [
    mode,
    fullBillingChoice,
    financials.unbilledAmount,
    financials.totalAmount,
    fullCustomTitle,
    project.deliverables,
    selectedDelMap,
    deliverablePrices,
    taxRate,
    customItems,
  ]);

  const totals = useMemo(() => {
    return calculateInvoiceTotals(calculatedItems, taxType);
  }, [calculatedItems, taxType]);

  // --------------------------------------------------------------------------
  // ASSEMBLE FULL INVOICE OBJECT
  // --------------------------------------------------------------------------
  const buildFinalInvoice = (status: 'Pending' | 'Draft' = 'Pending'): Invoice => {
    const stageName =
      mode === 'full'
        ? 'Full'
        : mode === 'deliverables'
        ? 'Deliverables'
        : stageType;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: invoiceNo.trim() || `A${Date.now().toString().slice(-5)}`,
      invoiceDate,
      dueDate,
      status,
      billedBy: { ...settings.businessProfile },
      billedTo: {
        clientName: project.clientName,
        company: clientObj?.company || project.clientBrand || undefined,
        address: clientObj?.address || undefined,
        city: clientObj?.city || undefined,
        state: clientObj?.state || undefined,
        country: clientObj?.country || 'India',
        pinCode: clientObj?.pinCode || undefined,
        phone: clientObj?.phone || project.clientPhone || undefined,
        email: clientObj?.email || undefined,
        gstin: clientObj?.gstin || undefined,
      },
      supplyInfo: {
        countryOfSupply: 'India',
        placeOfSupply: 'Other Territory (97)',
      },
      taxType,
      items: totals.items,
      subtotal: totals.subtotal,
      cgstTotal: totals.cgstTotal,
      sgstTotal: totals.sgstTotal,
      igstTotal: totals.igstTotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      receivedAmount: 0,
      balanceAmount: totals.grandTotal,
      payments: [],
      paymentDetails: { ...settings.paymentConfig },
      projectId: project.id,
      projectTitle: project.title,
      projectCode: project.projectCode,
      invoiceStage: stageName,
      notes: `${invoiceNotes}${project.assignedDesignerName ? ` · Lead Designer: ${project.assignedDesignerName}` : ''}`,
      footerNote: settings.disclaimer || 'Thank you for partnering with GIZMO DESIGN!',
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: formatSystemTimestamp(),
          action: 'Invoice Created from Project Workspace',
          note: `Project: ${project.title} (${project.projectCode || 'Custom'})`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newInvoice;
  };

  const handleGenerateDirectly = () => {
    if (totals.grandTotal <= 0 && calculatedItems.length === 0) {
      alert('Please select at least one item or deliverable to invoice.');
      return;
    }
    const inv = buildFinalInvoice('Pending');
    onGenerateAndSaveInvoice(inv, true);
    onClose();
  };

  const handleOpenInEditor = () => {
    const inv = buildFinalInvoice('Draft');
    onOpenInFullEditor(inv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* MODAL HEADER */}
        <div className="p-4 px-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  + Create Invoice for Project
                </h2>
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-violet-100 text-violet-800 border border-violet-200">
                  {project.projectCode || 'PRJ-WORK'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Auto-carries Client <strong className="text-slate-700">{project.clientName}</strong> &amp; Project data directly into invoice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {/* SECTION 1: PROJECT FINANCIAL SUMMARY BANNER */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Project Financial Status</span>
              <span className="font-mono text-slate-600 font-semibold">
                {financials.linkedInvoices.length} existing invoice{financials.linkedInvoices.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-semibold block">Total Project Value</span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900">
                  {formatINR(financials.totalAmount)}
                </span>
              </div>

              <div className="p-3 bg-violet-50/80 rounded-xl border border-violet-100">
                <span className="text-[10px] text-violet-700 font-semibold block">Invoiced to Date</span>
                <span className="text-sm sm:text-base font-black font-mono text-violet-800">
                  {formatINR(financials.totalInvoiced)}
                </span>
                <span className="text-[9px] text-violet-600 block">
                  {financials.unbilledAmount > 0 ? `${formatINR(financials.unbilledAmount)} unbilled` : '100% billed'}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-700 font-semibold block">Payments Received (Got)</span>
                <span className="text-sm sm:text-base font-black font-mono text-emerald-800">
                  {formatINR(financials.amountGot)}
                </span>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-100">
                <span className="text-[10px] text-amber-700 font-semibold block">Outstanding (To Get)</span>
                <span className="text-sm sm:text-base font-black font-mono text-amber-800">
                  {formatINR(financials.amountToGet)}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: 3 CREATION MODES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Choose Invoicing Mode
              </label>
              <span className="text-[10px] text-slate-400">Select how you want to bill this project</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Full Project */}
              <button
                type="button"
                onClick={() => setMode('full')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  mode === 'full'
                    ? 'border-violet-600 bg-violet-50/70 shadow-xs ring-1 ring-violet-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        mode === 'full' ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {mode === 'full' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </span>
                      Full Project
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700 font-mono">
                      {formatINR(financials.totalAmount)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Bill agreed project fee or remaining unbilled contract amount.
                  </p>
                </div>
              </button>

              {/* Option 2: Selected Deliverables */}
              <button
                type="button"
                onClick={() => setMode('deliverables')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  mode === 'deliverables'
                    ? 'border-violet-600 bg-violet-50/70 shadow-xs ring-1 ring-violet-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        mode === 'deliverables' ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {mode === 'deliverables' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </span>
                      Selected Deliverables
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      Itemized
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Pick completed or specific deliverables and turn them into invoice line items.
                  </p>
                </div>
              </button>

              {/* Option 3: Custom / Advance / Partial */}
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  mode === 'custom'
                    ? 'border-violet-600 bg-violet-50/70 shadow-xs ring-1 ring-violet-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        mode === 'custom' ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {mode === 'custom' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </span>
                      Stage / Custom
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                      Advance / Split
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Advance deposit, second installment, final balance, or custom billing lines.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 3: MODE SPECIFIC CONFIGURATION */}
          {mode === 'full' && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="font-extrabold text-slate-900 text-xs">Full Project Billing Options</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                  fullBillingChoice === 'unbilled' ? 'border-violet-500 bg-violet-50/50' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  <input
                    type="radio"
                    name="fullBillingChoice"
                    checked={fullBillingChoice === 'unbilled'}
                    onChange={() => setFullBillingChoice('unbilled')}
                    className="mt-0.5 text-violet-600"
                  />
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">
                      Invoice Remaining Unbilled Amount ({formatINR(financials.unbilledAmount)})
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Recommended if you previously issued partial/advance invoices.
                    </span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                  fullBillingChoice === 'full' ? 'border-violet-500 bg-violet-50/50' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  <input
                    type="radio"
                    name="fullBillingChoice"
                    checked={fullBillingChoice === 'full'}
                    onChange={() => setFullBillingChoice('full')}
                    className="mt-0.5 text-violet-600"
                  />
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">
                      Invoice Full Total Project Value ({formatINR(financials.totalAmount)})
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Standard full project fee billing in a single invoice.
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Invoice Line Item Description
                </label>
                <input
                  type="text"
                  value={fullCustomTitle}
                  onChange={(e) => setFullCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-violet-500 transition"
                  placeholder="Item description on client invoice"
                />
              </div>
            </div>
          )}

          {mode === 'deliverables' && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Select Deliverables to Bill</div>
                  <p className="text-[10px] text-slate-500">
                    Each checked item will be converted into an individual invoice row with its assigned rate.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectCompletedOnly}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    Select Completed Only
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllDeliverables}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    Select All
                  </button>
                </div>
              </div>

              {/* Deliverables checklist */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-slate-50/40">
                {project.deliverables && project.deliverables.length > 0 ? (
                  project.deliverables.map((d) => {
                    const isChecked = Boolean(selectedDelMap[d.id]);
                    const currentPrice = deliverablePrices[d.id] ?? 0;

                    return (
                      <div
                        key={d.id}
                        className={`p-2.5 px-3 flex items-center justify-between gap-3 transition ${
                          isChecked ? 'bg-violet-50/50' : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleDeliverable(d.id)}
                            className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {d.title}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                                {d.type}
                              </span>
                              {d.isCompleted ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Completed
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                  Pending
                                </span>
                              )}
                            </div>
                            {d.description && (
                              <p className="text-[10px] text-slate-400 truncate">{d.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Price Input */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold text-slate-400">Rate: ₹</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={currentPrice}
                            onChange={(e) => handlePriceChange(d.id, Number(e.target.value))}
                            className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right font-mono font-bold text-slate-900 text-xs outline-none focus:border-violet-500 shadow-2xs"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No deliverables found in this project. Use Full Project or Custom mode instead.
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'custom' && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-extrabold text-slate-900 text-xs">
                  Stage Billing &amp; Custom Line Items
                </div>

                {/* Stage presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleApplyStagePreset('Advance')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                      stageType === 'Advance'
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Advance (50%)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyStagePreset('Partial')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                      stageType === 'Partial'
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Milestone (30%)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyStagePreset('Final')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                      stageType === 'Final'
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Final Balance ({formatINR(financials.unbilledAmount > 0 ? financials.unbilledAmount : financials.amountToGet)})
                  </button>
                </div>
              </div>

              {/* Editable custom item rows */}
              <div className="space-y-2">
                {customItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateCustomItem(item.id, 'description', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-violet-500"
                      placeholder="Item title / Milestone description"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.amount}
                        onChange={(e) => handleUpdateCustomItem(item.id, 'amount', Number(e.target.value))}
                        className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-right font-mono font-bold text-slate-900 text-xs outline-none focus:border-violet-500"
                      />
                    </div>
                    {customItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="px-3 py-1 text-[11px] font-bold text-violet-700 hover:bg-violet-50 rounded-lg border border-dashed border-violet-300 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Line Item</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 4: INVOICE IDENTIFICATION & TAX SETTINGS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-xs outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">GST Tax Rate</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs outline-none focus:border-violet-500"
              >
                <option value={0}>0% (No Tax / Nil)</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST (Standard)</option>
                <option value={28}>28% GST</option>
              </select>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER WITH TOTALS & ACTIONS */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Live Calculated Totals */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Subtotal</span>
              <span className="font-extrabold text-slate-800">{formatINR(totals.subtotal)}</span>
            </div>
            {totals.taxTotal > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Tax ({taxRate}%)</span>
                <span className="font-extrabold text-slate-800">+{formatINR(totals.taxTotal)}</span>
              </div>
            )}
            <div className="pl-3 border-l border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Grand Total</span>
              <span className="text-base font-black text-violet-700">{formatINR(totals.grandTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleOpenInEditor}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-2xs"
              title="Open full invoice customization screen"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Invoice Editor</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateDirectly}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-violet-600/30 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Generate &amp; View Invoice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

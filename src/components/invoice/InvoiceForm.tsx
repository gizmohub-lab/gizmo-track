import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Building2,
  UserCheck,
  CreditCard,
  FileCheck,
  AlertCircle,
  Check,
  Calendar,
  Layers,
  ExternalLink,
  FolderKanban,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Printer,
  Download,
  Share2,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PackagePlus,
  Receipt,
  RotateCcw,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  TaxType,
  Client,
  Project,
  LocalWork,
  InvoiceSettings,
} from '../../types';
import {
  formatINR,
  calculateInvoiceTotals,
  getNextInvoiceNumber,
  getFormattedTimestamp,
  formatDate,
} from '../../utils/formatters';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { InvoiceDocument } from './InvoiceDocument';

interface InvoiceFormProps {
  initialInvoice?: Invoice | null;
  existingInvoices: Invoice[];
  clients: Client[];
  projects: Project[];
  localWorks: LocalWork[];
  settings: InvoiceSettings;
  onSave: (invoice: Invoice, isDraft: boolean) => void;
  onCancel: () => void;
  onOpenSettings: () => void;
  onAddNewClient: (client: Client) => void;
  onOpenProjectWorkspace?: (projectId: string) => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onShareInvoice?: (invoice: Invoice) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialInvoice,
  existingInvoices,
  clients,
  projects,
  localWorks,
  settings,
  onSave,
  onCancel,
  onOpenSettings,
  onAddNewClient,
  onOpenProjectWorkspace,
  onViewInvoice,
  onShareInvoice,
}) => {
  const isEditMode = Boolean(initialInvoice);

  // 1. Source Selection: 'project' | 'standalone'
  const [sourceType, setSourceType] = useState<'project' | 'standalone'>(() => {
    if (initialInvoice?.projectId) return 'project';
    if (initialInvoice?.localWorkId) return 'project';
    return 'project';
  });

  // Selected Project State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialInvoice?.projectId || ''
  );
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>('');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);

  // Deliverables selection state
  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<string[]>([]);
  const [showDeliverablePicker, setShowDeliverablePicker] = useState<boolean>(false);

  // 2. Invoice Identification & Dates
  const [invoiceNo, setInvoiceNo] = useState<string>(() => {
    if (initialInvoice && initialInvoice.invoiceNo) return initialInvoice.invoiceNo;
    return getNextInvoiceNumber(
      existingInvoices,
      settings.numberingPrefix,
      settings.startingNumber
    );
  });

  const [invoiceDate, setInvoiceDate] = useState<string>(() => {
    if (initialInvoice) return initialInvoice.invoiceDate;
    return new Date().toISOString().split('T')[0];
  });

  const [dueDate, setDueDate] = useState<string>(() => {
    if (initialInvoice) return initialInvoice.dueDate;
    return new Date().toISOString().split('T')[0];
  });

  const [status, setStatus] = useState<InvoiceStatus>(
    initialInvoice ? initialInvoice.status : 'Pending'
  );

  // 3. Client & Billed To
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>(
    initialInvoice?.billedTo?.clientName || ''
  );
  const [company, setCompany] = useState<string>(
    initialInvoice?.billedTo?.company || ''
  );
  const [address, setAddress] = useState<string>(
    initialInvoice?.billedTo?.address || ''
  );
  const [city, setCity] = useState<string>(
    initialInvoice?.billedTo?.city || ''
  );
  const [state, setState] = useState<string>(
    initialInvoice?.billedTo?.state || ''
  );
  const [country, setCountry] = useState<string>(
    initialInvoice?.billedTo?.country || 'India'
  );
  const [pinCode, setPinCode] = useState<string>(
    initialInvoice?.billedTo?.pinCode || ''
  );
  const [phone, setPhone] = useState<string>(
    initialInvoice?.billedTo?.phone || ''
  );
  const [email, setEmail] = useState<string>(
    initialInvoice?.billedTo?.email || ''
  );
  const [gstin, setGstin] = useState<string>(
    initialInvoice?.billedTo?.gstin || ''
  );

  // 4. Supply Info
  const [countryOfSupply, setCountryOfSupply] = useState<string>(
    initialInvoice?.supplyInfo?.countryOfSupply || 'India'
  );
  const [placeOfSupply, setPlaceOfSupply] = useState<string>(
    initialInvoice?.supplyInfo?.placeOfSupply || 'Other Territory (97)'
  );

  // 5. Tax Type
  const [taxType, setTaxType] = useState<TaxType>(
    initialInvoice?.taxType || settings.defaultTaxType || 'CGST_SGST'
  );

  // 6. Items Table
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (initialInvoice && initialInvoice.items.length > 0) {
      return initialInvoice.items;
    }
    return [
      {
        id: `item-${Date.now()}-1`,
        description: 'LOGO DESIGN',
        gstRate: 0,
        quantity: 1,
        rate: 3500,
        amount: 3500,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 3500,
      },
    ];
  });

  // 7. Payment Received & Notes
  const [receivedAmount, setReceivedAmount] = useState<number>(
    initialInvoice ? initialInvoice.receivedAmount : 0
  );
  const [notes, setNotes] = useState<string>(
    initialInvoice?.notes || 'Thank you for your business with GIZMO DESIGN!'
  );
  const [footerNote, setFooterNote] = useState<string>(
    initialInvoice?.footerNote || settings.disclaimer
  );

  // 8. Add Client Modal state
  const [showAddClientModal, setShowAddClientModal] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientCompany, setNewClientCompany] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  const [newClientCity, setNewClientCity] = useState<string>('');
  const [newClientAddress, setNewClientAddress] = useState<string>('');

  // 9. Mobile Tab & Preview Zoom State
  const [mobileActiveTab, setMobileActiveTab] = useState<'form' | 'preview'>('form');
  const [previewZoom, setPreviewZoom] = useState<number>(0.85);

  // 10. Post-generation confirmation modal state
  const [generatedSuccessInvoice, setGeneratedSuccessInvoice] = useState<Invoice | null>(null);

  // Find active project object
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Filtered projects for search
  const filteredProjects = useMemo(() => {
    if (!projectSearchQuery.trim()) return projects;
    const q = projectSearchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.projectCode && p.projectCode.toLowerCase().includes(q)) ||
        p.clientName.toLowerCase().includes(q) ||
        (p.clientBrand && p.clientBrand.toLowerCase().includes(q))
    );
  }, [projects, projectSearchQuery]);

  // Invoice Number uniqueness check
  const isInvoiceNumberDuplicate = useMemo(() => {
    const trimmed = invoiceNo.trim().toUpperCase();
    if (!trimmed) return false;
    return existingInvoices.some((inv) => {
      if (initialInvoice && inv.id === initialInvoice.id) {
        return false;
      }
      return inv.invoiceNo.trim().toUpperCase() === trimmed;
    });
  }, [invoiceNo, existingInvoices, initialInvoice]);

  // Recalculate totals whenever items or taxType changes
  const calculatedTotals = useMemo(() => {
    return calculateInvoiceTotals(items, taxType);
  }, [items, taxType]);

  const balanceAmount = Math.max(
    0,
    Math.round((calculatedTotals.grandTotal - (Number(receivedAmount) || 0)) * 100) / 100
  );

  // Synchronize Project selection & auto-fill client fields
  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setIsProjectDropdownOpen(false);

    // Auto-fill client details
    const matchedClient =
      clients.find((c) => c.id === project.clientId) ||
      clients.find(
        (c) => c.name.toLowerCase() === project.clientName.toLowerCase()
      );

    setClientName(project.clientName || matchedClient?.name || '');
    if (matchedClient?.company) setCompany(matchedClient.company);
    else if (project.clientBrand) setCompany(project.clientBrand);

    if (matchedClient?.address) setAddress(matchedClient.address);
    if (matchedClient?.city) setCity(matchedClient.city);
    if (matchedClient?.state) setState(matchedClient.state);
    if (matchedClient?.country) setCountry(matchedClient.country);
    if (matchedClient?.pinCode) setPinCode(matchedClient.pinCode);
    if (matchedClient?.phone) setPhone(matchedClient.phone);
    if (matchedClient?.email) setEmail(matchedClient.email);
    if (matchedClient?.gstin) setGstin(matchedClient.gstin);

    if (project.deadlineDate || project.dueDate) {
      setDueDate(project.deadlineDate || project.dueDate || dueDate);
    }

    // Auto-populate line item with project title and remaining/total budget if item list is empty or default
    const projectAmount = Number(project.totalAmount ?? project.budget ?? 0);
    const amountGot = Number(project.amountGot ?? 0);
    const unbilledAmount = Math.max(0, projectAmount - amountGot) || projectAmount;

    if (
      items.length === 0 ||
      (items.length === 1 && items[0].description === 'LOGO DESIGN')
    ) {
      if (project.deliverables && project.deliverables.length > 0) {
        // Populate deliverables by default
        const newItems: InvoiceItem[] = project.deliverables.map((del, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          description: `${del.title}${del.description ? ` (${del.description})` : ''}`,
          gstRate: settings.defaultGstRate || 0,
          quantity: 1,
          rate: Number(del.amount || 0) || (idx === 0 ? unbilledAmount : 0),
          amount: Number(del.amount || 0) || (idx === 0 ? unbilledAmount : 0),
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: Number(del.amount || 0) || (idx === 0 ? unbilledAmount : 0),
        }));
        setItems(newItems);
      } else {
        setItems([
          {
            id: `item-${Date.now()}-1`,
            description: `${project.title.toUpperCase()}${
              project.projectType ? ` [${project.projectType.toUpperCase()}]` : ''
            }`,
            gstRate: settings.defaultGstRate || 0,
            quantity: 1,
            rate: unbilledAmount || projectAmount || 3500,
            amount: unbilledAmount || projectAmount || 3500,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: unbilledAmount || projectAmount || 3500,
          },
        ]);
      }
    }
  };

  // Switch to standalone mode
  const handleSwitchToStandalone = () => {
    setSourceType('standalone');
    setSelectedProjectId('');
  };

  // Switch to project mode
  const handleSwitchToProject = () => {
    setSourceType('project');
  };

  // Handle client selection from People
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) return;
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientName(client.name || '');
      setCompany(client.company || '');
      setAddress(client.address || '');
      setCity(client.city || '');
      setState(client.state || '');
      setCountry(client.country || 'India');
      setPinCode(client.pinCode || '');
      setPhone(client.phone || '');
      setEmail(client.email || '');
      setGstin(client.gstin || '');
    }
  };

  // Add items from project deliverables
  const handleAddSelectedDeliverables = () => {
    if (!activeProject || !activeProject.deliverables) return;
    const selectedDels = activeProject.deliverables.filter((d) =>
      selectedDeliverableIds.includes(d.id)
    );

    if (selectedDels.length === 0) {
      setShowDeliverablePicker(false);
      return;
    }

    const newItems: InvoiceItem[] = selectedDels.map((del, idx) => ({
      id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      description: `${del.title}${del.description ? ` (${del.description})` : ''}`,
      gstRate: settings.defaultGstRate || 0,
      quantity: 1,
      rate: Number(del.amount || 0),
      amount: Number(del.amount || 0),
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: Number(del.amount || 0),
    }));

    setItems((prev) => [...prev, ...newItems]);
    setSelectedDeliverableIds([]);
    setShowDeliverablePicker(false);
  };

  // Item row operations
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: '',
      gstRate: settings.defaultGstRate || 0,
      quantity: 1,
      rate: 0,
      amount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleDuplicateItem = (index: number) => {
    const target = items[index];
    const duplicated: InvoiceItem = {
      ...target,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: `${target.description} (Copy)`,
    };
    const newItems = [...items];
    newItems.splice(index + 1, 0, duplicated);
    setItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setItems(newItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  const handleAddPreset = (desc: string, rate: number, qty = 1, gst = 0) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: desc,
      gstRate: gst,
      quantity: qty,
      rate: rate,
      amount: rate * qty,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: rate * qty,
    };
    setItems([...items, newItem]);
  };

  // Build live invoice payload for both Live Preview and Save
  const liveInvoicePayload: Invoice = useMemo(() => {
    const numericReceived = Number(receivedAmount) || 0;
    let determinedStatus: InvoiceStatus = status;
    if (numericReceived >= calculatedTotals.grandTotal && calculatedTotals.grandTotal > 0) {
      determinedStatus = 'Paid';
    } else if (numericReceived > 0 && numericReceived < calculatedTotals.grandTotal) {
      determinedStatus = 'Partially Paid';
    }

    return {
      id: initialInvoice?.id || `inv-${Date.now()}`,
      invoiceNo: invoiceNo.trim().toUpperCase() || 'DRAFT',
      invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: determinedStatus,
      billedBy: { ...settings.businessProfile },
      billedTo: {
        clientName: clientName.trim() || 'Client Name',
        company: company.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || 'India',
        pinCode: pinCode.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        gstin: gstin.trim() || undefined,
      },
      supplyInfo: {
        countryOfSupply: countryOfSupply.trim() || 'India',
        placeOfSupply: placeOfSupply.trim() || 'Other Territory (97)',
      },
      items: calculatedTotals.items,
      taxType,
      subtotal: calculatedTotals.subtotal,
      cgstTotal: calculatedTotals.cgstTotal,
      sgstTotal: calculatedTotals.sgstTotal,
      igstTotal: calculatedTotals.igstTotal,
      taxTotal: calculatedTotals.taxTotal,
      grandTotal: calculatedTotals.grandTotal,
      receivedAmount: numericReceived,
      balanceAmount: Math.max(0, calculatedTotals.grandTotal - numericReceived),
      payments: initialInvoice?.payments || [],
      paymentDetails: { ...settings.paymentConfig },
      projectId: sourceType === 'project' ? selectedProjectId || undefined : undefined,
      projectTitle: activeProject?.title || initialInvoice?.projectTitle || undefined,
      notes,
      footerNote,
      history: [
        ...(initialInvoice?.history || []),
        {
          id: `hist-${Date.now()}`,
          timestamp: getFormattedTimestamp(),
          action: isEditMode
            ? `Invoice updated (${determinedStatus})`
            : 'Invoice generated',
          note: `Total: ${formatINR(calculatedTotals.grandTotal)}`,
        },
      ],
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    initialInvoice,
    invoiceNo,
    invoiceDate,
    dueDate,
    status,
    settings,
    clientName,
    company,
    address,
    city,
    state,
    country,
    pinCode,
    phone,
    email,
    gstin,
    countryOfSupply,
    placeOfSupply,
    calculatedTotals,
    taxType,
    receivedAmount,
    sourceType,
    selectedProjectId,
    activeProject,
    notes,
    footerNote,
    isEditMode,
  ]);

  // Save handler
  const handleSave = (saveAsDraft: boolean) => {
    if (!invoiceNo.trim()) {
      alert('Please provide an invoice number.');
      return;
    }

    if (!saveAsDraft && isInvoiceNumberDuplicate) {
      alert('Invoice number already exists. Please choose a unique invoice number.');
      return;
    }

    if (!clientName.trim()) {
      alert('Client name is required.');
      return;
    }

    const payload: Invoice = {
      ...liveInvoicePayload,
      status: saveAsDraft ? 'Draft' : liveInvoicePayload.status,
    };

    onSave(payload, saveAsDraft);
    setGeneratedSuccessInvoice(payload);
  };

  // Quick Client Creation
  const handleCreateNewClient = () => {
    if (!newClientName.trim()) return;
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: newClientName.trim(),
      company: newClientCompany.trim() || undefined,
      phone: newClientPhone.trim() || undefined,
      email: newClientEmail.trim() || undefined,
      city: newClientCity.trim() || undefined,
      address: newClientAddress.trim() || undefined,
      country: 'India',
      createdAt: new Date().toISOString(),
    };
    onAddNewClient(newClient);
    setSelectedClientId(newClient.id);
    setClientName(newClient.name);
    if (newClient.company) setCompany(newClient.company);
    if (newClient.phone) setPhone(newClient.phone);
    if (newClient.email) setEmail(newClient.email);
    if (newClient.city) setCity(newClient.city);
    if (newClient.address) setAddress(newClient.address);
    setShowAddClientModal(false);
  };

  return (
    <div id="invoice-form-view" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Return to invoices"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isEditMode ? `Edit Invoice — ${invoiceNo}` : 'Create Invoice'}
              </h1>
              {sourceType === 'project' && activeProject && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-violet-100 text-violet-800 border border-violet-200">
                  Project Linked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Create project-linked or standalone GST invoices with real-time A4 preview.
            </p>
          </div>
        </div>

        {/* Action buttons on top bar */}
        <div className="flex items-center gap-2">
          {/* Mobile Tab Toggle */}
          <div className="flex lg:hidden rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileActiveTab('form')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                mobileActiveTab === 'form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1 ${
                mobileActiveTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-save-draft"
            onClick={() => handleSave(true)}
            className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="button"
            id="btn-generate-invoice"
            onClick={() => handleSave(false)}
            disabled={isInvoiceNumberDuplicate}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 shadow-sm rounded-lg transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>{isEditMode ? 'Update Invoice' : 'Generate Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Two-Panel Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INVOICE FORM DETAILS */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            mobileActiveTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* STEP 1: INVOICE SOURCE */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Invoice Source
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Choose invoice origin
              </span>
            </div>

            {/* Source Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSwitchToProject}
                className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  sourceType === 'project'
                    ? 'bg-violet-50/70 border-violet-500 ring-2 ring-violet-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    sourceType === 'project'
                      ? 'border-violet-600 bg-violet-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {sourceType === 'project' && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <FolderKanban className="w-4 h-4 text-violet-600" />
                    <span>From Project</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Auto-fill client, financials, deliverables, and link to project workspace.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSwitchToStandalone}
                className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  sourceType === 'standalone'
                    ? 'bg-slate-900 text-white border-slate-950 ring-2 ring-slate-950/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    sourceType === 'standalone'
                      ? 'border-white bg-white text-slate-950'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {sourceType === 'standalone' && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div
                    className={`font-extrabold text-sm flex items-center gap-1.5 ${
                      sourceType === 'standalone' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <FileSpreadsheet
                      className={`w-4 h-4 ${
                        sourceType === 'standalone' ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <span>Standalone Invoice</span>
                  </div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      sourceType === 'standalone' ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    Direct billing for ad-hoc clients, consultation, or independent design work.
                  </p>
                </div>
              </button>
            </div>

            {/* Quick Project Search when 'From Project' is selected */}
            {sourceType === 'project' && (
              <div className="pt-2 space-y-3">
                {activeProject ? (
                  // Selected Project Confirmation Card
                  <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-violet-700 font-mono">
                            {activeProject.projectCode || 'PRJ'}
                          </span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.2 rounded-md">
                            Project selected ✓
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                          {activeProject.title}
                        </h4>
                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 mt-1">
                          <span>Client: <strong>{activeProject.clientName}</strong></span>
                          <span>•</span>
                          <span>
                            Total: <strong>{formatINR(activeProject.totalAmount || activeProject.budget || 0)}</strong>
                          </span>
                          {activeProject.deliverables && (
                            <>
                              <span>•</span>
                              <span>
                                {activeProject.deliverables.length} deliverable{activeProject.deliverables.length === 1 ? '' : 's'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenProjectWorkspace && (
                        <button
                          type="button"
                          onClick={() => onOpenProjectWorkspace(activeProject.id)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition flex items-center gap-1"
                        >
                          <span>Workspace</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectId('');
                          setIsProjectDropdownOpen(true);
                        }}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition"
                      >
                        Change Project
                      </button>
                    </div>
                  </div>
                ) : (
                  // Search Project Box
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Search &amp; Select Project <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by Project ID, Project Name, or Client (e.g. PRJ-1011 — Logo — LOHA)..."
                        value={projectSearchQuery}
                        onChange={(e) => {
                          setProjectSearchQuery(e.target.value);
                          setIsProjectDropdownOpen(true);
                        }}
                        onFocus={() => setIsProjectDropdownOpen(true)}
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-violet-500 focus:bg-white text-slate-900 transition"
                      />
                      {projectSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setProjectSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filtered Projects Dropdown List */}
                    {isProjectDropdownOpen && (
                      <div className="max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 z-10">
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectProject(p)}
                              className="w-full text-left p-3 hover:bg-violet-50/60 transition flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span className="font-mono text-violet-700 font-extrabold">
                                    {p.projectCode || 'PRJ'}
                                  </span>
                                  <span>—</span>
                                  <span>{p.title}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>Client: {p.clientName} {p.clientBrand ? `(${p.clientBrand})` : ''}</span>
                                  <span>•</span>
                                  <span className="text-slate-700 font-semibold">
                                    {formatINR(p.totalAmount || p.budget || 0)}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-1 bg-violet-100 text-violet-800 rounded font-bold text-[10px]">
                                Select ▾
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No projects match &quot;{projectSearchQuery}&quot;. Try another term.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: CLIENT INFORMATION (BILLED TO) */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Client Information (Billed To)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddClientModal(true)}
                className="text-xs text-violet-700 hover:text-violet-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add New Client</span>
              </button>
            </div>

            {/* If standalone, allow choosing existing client */}
            {sourceType === 'standalone' && (
              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">
                  Select Existing Client (Optional Auto-Fill)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900 font-medium"
                >
                  <option value="">-- Choose Existing Client from People --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Client Detail Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. DARUL HASANIYYAH SNEC"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Brand</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Organization or Brand name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94471 28409"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@domain.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="32AABTD9841C1Z4"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900 font-mono uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Billing Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street / Office Address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City / State</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">PIN / Country</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="PIN"
                    className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900"
                  />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: INVOICE META & SUPPLY INFO */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Invoice Number &amp; Dates
                </h3>
              </div>
              <div className="text-xs text-slate-400 font-mono">Billed By: {settings.businessProfile.businessName}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Invoice No <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="e.g. A00025"
                  className={`w-full px-3 py-2 bg-slate-50 border font-mono font-bold rounded-lg outline-none focus:bg-white ${
                    isInvoiceNumberDuplicate
                      ? 'border-rose-400 focus:border-rose-500 text-rose-700'
                      : 'border-slate-200 focus:border-violet-500 text-slate-900'
                  }`}
                />
                {isInvoiceNumberDuplicate && (
                  <p className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Duplicate number
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Place of Supply</label>
                <input
                  type="text"
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  placeholder="Other Territory (97)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: INVOICE ITEMS & DELIVERABLES PICKER */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs font-black flex items-center justify-center">
                  4
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Invoice Items
                </h3>
              </div>

              {/* Tax Mode Switch */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Tax:</span>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setTaxType('CGST_SGST')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition cursor-pointer ${
                      taxType === 'CGST_SGST'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    CGST + SGST
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxType('IGST')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition cursor-pointer ${
                      taxType === 'IGST'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    IGST
                  </button>
                </div>
              </div>
            </div>

            {/* Add from Project Deliverables Trigger */}
            {sourceType === 'project' && activeProject && activeProject.deliverables && activeProject.deliverables.length > 0 && (
              <div className="p-3.5 rounded-xl bg-violet-50/60 border border-violet-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PackagePlus className="w-4 h-4 text-violet-700" />
                    <span className="text-xs font-extrabold text-violet-900">
                      Project Deliverables Available ({activeProject.deliverables.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeliverablePicker(!showDeliverablePicker)}
                    className="text-xs font-bold text-violet-700 hover:text-violet-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showDeliverablePicker ? 'Hide Deliverables' : '+ Add from Project Deliverables'}</span>
                    {showDeliverablePicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Deliverables Checklist */}
                {showDeliverablePicker && (
                  <div className="pt-2 border-t border-violet-200/60 space-y-2 animate-in fade-in duration-150">
                    <p className="text-[11px] text-slate-600">
                      Select deliverables to import into invoice line items:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeProject.deliverables.map((del) => {
                        const isChecked = selectedDeliverableIds.includes(del.id);
                        return (
                          <div
                            key={del.id}
                            onClick={() => {
                              setSelectedDeliverableIds((prev) =>
                                isChecked ? prev.filter((id) => id !== del.id) : [...prev, del.id]
                              );
                            }}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                              isChecked
                                ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-white" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                              <span className="font-semibold">{del.title}</span>
                            </div>
                            <span className="font-mono font-bold">
                              {formatINR(Number(del.amount || 0))}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDeliverableIds([])}
                        className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Clear Selection
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSelectedDeliverables}
                        disabled={selectedDeliverableIds.length === 0}
                        className="px-4 py-1.5 bg-violet-700 hover:bg-violet-800 disabled:opacity-40 text-white font-bold text-xs rounded-lg shadow-2xs transition"
                      >
                        Add Selected Items ({selectedDeliverableIds.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Items Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Description</th>
                    <th className="py-2.5 px-2 w-20 text-right">GST %</th>
                    <th className="py-2.5 px-2 w-14 text-right">Qty</th>
                    <th className="py-2.5 px-2 w-24 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-28 text-right">Amount</th>
                    <th className="py-2.5 px-2 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const rowAmount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono font-bold">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="e.g. LOGO DESIGN"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-900 outline-none focus:bg-white focus:border-violet-500"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <select
                            value={item.gstRate}
                            onChange={(e) => handleItemChange(index, 'gstRate', Number(e.target.value))}
                            className="w-full px-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-right font-medium text-slate-800 outline-none cursor-pointer"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-full px-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-right font-mono font-bold text-slate-800 outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                            className="w-full px-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-right font-mono font-bold text-slate-900 outline-none focus:bg-white"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatINR(rowAmount, true)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem(index)}
                              title="Duplicate row"
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(index)}
                              disabled={items.length <= 1}
                              title="Delete row"
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Controls & Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item</span>
              </button>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleAddPreset('LOGO DESIGN', 3500, 1, 0)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition cursor-pointer"
                >
                  + Logo Design (₹3.5k)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('Letterhead Design', 1500, 1, 0)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition cursor-pointer"
                >
                  + Letterhead (₹1.5k)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('Social Media Creatives (Pack of 5)', 5000, 1, 0)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition cursor-pointer"
                >
                  + Social Media Pack (₹5k)
                </button>
              </div>
            </div>

            {/* Live Financial Totals & Received Input */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Notes */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invoice Notes / Terms</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes shown on invoice..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-800 resize-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Footer Disclaimer</label>
                  <input
                    type="text"
                    value={footerNote}
                    onChange={(e) => setFooterNote(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(calculatedTotals.subtotal, true)}
                  </span>
                </div>

                {taxType === 'CGST_SGST' ? (
                  <>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>CGST</span>
                      <span className="font-mono font-medium text-slate-800">
                        {formatINR(calculatedTotals.cgstTotal, true)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>SGST</span>
                      <span className="font-mono font-medium text-slate-800">
                        {formatINR(calculatedTotals.sgstTotal, true)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>IGST</span>
                    <span className="font-mono font-medium text-slate-800">
                      {formatINR(calculatedTotals.igstTotal, true)}
                    </span>
                  </div>
                )}

                <div className="h-px bg-slate-200 my-1"></div>

                {/* Grand Total Row */}
                <div className="p-3 rounded-xl bg-slate-950 text-white flex justify-between items-center shadow-xs">
                  <span className="font-black text-xs uppercase tracking-wider">TOTAL (INR)</span>
                  <span className="font-black text-base font-mono">
                    {formatINR(calculatedTotals.grandTotal, true)}
                  </span>
                </div>

                {/* Received & Balance */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block font-bold text-emerald-800 text-[10px] uppercase tracking-wider mb-1">
                      Received (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg font-mono font-bold text-emerald-950 outline-none"
                    />
                  </div>
                  <div>
                    <span className="block font-bold text-rose-800 text-[10px] uppercase tracking-wider mb-1">
                      Balance Due
                    </span>
                    <div className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 rounded-lg font-mono font-black text-rose-950">
                      {formatINR(balanceAmount, true)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-5 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isInvoiceNumberDuplicate}
                className="px-6 py-2.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 shadow-sm rounded-xl transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>{isEditMode ? 'Update Invoice' : 'Generate Invoice'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE A4 INVOICE PREVIEW (Sticky Desktop Panel) */}
        <div
          className={`lg:col-span-5 lg:sticky lg:top-6 space-y-3 ${
            mobileActiveTab === 'form' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Live Preview Header Bar */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-extrabold text-xs tracking-wider uppercase">
                Live A4 Invoice Preview
              </span>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-slate-300 font-bold px-1">
                {Math.round(previewZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.min(1.2, Math.round((z + 0.1) * 10) / 10))}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Render Container */}
          <div className="p-4 bg-slate-200/70 border border-slate-300 rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto shadow-inner">
            <div
              style={{
                transform: `scale(${previewZoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                marginBottom: previewZoom < 1 ? `-${(1 - previewZoom) * 900}px` : '0px',
              }}
            >
              <InvoiceDocument invoice={liveInvoicePayload} />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                + Add New Client to Directory
              </h3>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. DARUL HASANIYYAH SNEC"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Org</label>
                <input
                  type="text"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  placeholder="e.g. Darul Hasaniyyah Educational Council"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+91 94471 28409"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@mail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / City</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none mb-2"
                />
                <input
                  type="text"
                  value={newClientCity}
                  onChange={(e) => setNewClientCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewClient}
                disabled={!newClientName.trim()}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-lg disabled:opacity-40"
              >
                Save &amp; Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-GENERATION SUCCESS MODAL (Point 11) */}
      {generatedSuccessInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Invoice {generatedSuccessInvoice.invoiceNo} Created
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                The invoice for <strong>{generatedSuccessInvoice.billedTo.clientName}</strong> ({formatINR(generatedSuccessInvoice.grandTotal)}) has been recorded in the billing ledger.
              </p>
            </div>

            {/* Quick Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Invoice Number:</span>
                <span className="font-mono font-bold text-slate-900">{generatedSuccessInvoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Client:</span>
                <span className="font-bold text-slate-900">{generatedSuccessInvoice.billedTo.clientName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Amount:</span>
                <span className="font-mono font-black text-slate-900">{formatINR(generatedSuccessInvoice.grandTotal, true)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Due Date:</span>
                <span className="font-medium text-slate-800">{formatDate(generatedSuccessInvoice.dueDate)}</span>
              </div>
              {generatedSuccessInvoice.projectId && (
                <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
                  <span>Linked Project:</span>
                  <span className="font-bold text-violet-700">{generatedSuccessInvoice.projectTitle || 'Connected Project'}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (onViewInvoice) onViewInvoice(generatedSuccessInvoice);
                  setGeneratedSuccessInvoice(null);
                  onCancel();
                }}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-slate-700" />
                <span>View Invoice</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await generateInvoicePDF(generatedSuccessInvoice);
                }}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-700" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onViewInvoice) onViewInvoice(generatedSuccessInvoice);
                  setTimeout(() => {
                    window.print();
                  }, 400);
                  setGeneratedSuccessInvoice(null);
                  onCancel();
                }}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onShareInvoice) onShareInvoice(generatedSuccessInvoice);
                  setGeneratedSuccessInvoice(null);
                  onCancel();
                }}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-slate-700" />
                <span>Share</span>
              </button>

              {generatedSuccessInvoice.projectId && onOpenProjectWorkspace && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenProjectWorkspace(generatedSuccessInvoice.projectId!);
                    setGeneratedSuccessInvoice(null);
                  }}
                  className="p-3 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-violet-600" />
                  <span>View Project</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setGeneratedSuccessInvoice(null);
                  onCancel();
                }}
                className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer col-span-2 sm:col-span-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Invoices</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

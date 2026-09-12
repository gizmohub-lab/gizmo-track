import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Upload,
  FileText,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Building,
  Globe,
  Clock,
  Target,
  Layers,
  Check,
  ShieldCheck,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import {
  Client,
  Project,
  ProjectDeliverable,
  ProjectFileAttachment,
  AdminNotification,
  ProjectRequest,
} from '../../types';
import { formatExactDateTimeString } from '../../utils/dateTimeUtils';
import {
  createProjectRequestInFirestore,
  findOrCreateClientRecord,
} from '../../services/projectRequestsService';

interface StartProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  projects: Project[];
  onAddProject?: (project: Project) => void;
  onAddProjectRequest?: (request: ProjectRequest) => void;
  onAddClient: (client: Client) => void;
  onAddNotification: (notification: AdminNotification) => void;
  onNavigateToClientPortal?: () => void;
}

const SERVICE_OPTIONS = [
  { id: 'logo', cat: '01 BRAND', name: 'Logo', desc: 'Primary marks, logotypes & monograms' },
  { id: 'branding', cat: '01 BRAND', name: 'Brand Identity', desc: 'Visual identity, guidelines & assets' },
  { id: 'packaging', cat: '01 BRAND', name: 'Packaging', desc: 'Box dielines, pouch design & labels' },
  { id: 'poster', cat: '02 DESIGN', name: 'Poster', desc: 'Social media, event & promotional graphics' },
  { id: 'social', cat: '03 SOCIAL', name: 'Social Media', desc: 'Monthly content packages & carousels' },
  { id: 'website', cat: '05 DIGITAL', name: 'Website', desc: 'Landing pages & web UI assets' },
  { id: 'uiux', cat: '05 DIGITAL', name: 'UI/UX', desc: 'App interfaces, wireframes & prototypes' },
  { id: 'video', cat: '04 MOTION', name: 'Video', desc: 'Motion reels & video editing' },
  { id: 'photography', cat: '06 MEDIA', name: 'Photography', desc: 'Shoot planning & color grading' },
  { id: 'printing', cat: '07 PRODUCTION', name: 'Printing', desc: 'Stationery, flex boards & press ready' },
  { id: 'ai-creative', cat: '08 FRONTIER', name: 'AI Creative', desc: 'Generative concepts & art direction' },
  { id: 'other', cat: 'CUSTOM SCOPE', name: 'Other', desc: 'Bespoke creative brief or custom scope' },
];

const INDUSTRY_OPTIONS = [
  'Technology',
  'Food & Beverage',
  'Fashion',
  'Education',
  'Healthcare',
  'Real Estate',
  'Retail',
  'Hospitality',
  'Finance',
  'Entertainment',
  'Other',
];

const GOAL_OPTIONS = [
  'Launch New Brand / Offering',
  'Complete Rebrand & Identity Upgrade',
  'Elevate Visual Authority & Perception',
  'Drive Higher Conversion & Sales',
  'Investor / Pitch Readiness',
  'Other',
];

const TIMELINE_OPTIONS = [
  { id: 'today', title: 'TODAY', desc: 'Emergency Sprint' },
  { id: 'tomorrow', title: 'TOMORROW', desc: 'Emergency Sprint' },
  { id: '2-3-days', title: '2–3 DAYS', desc: 'Expedited Priority' },
  { id: 'week', title: 'WITHIN A WEEK', desc: 'Rapid Studio Pace' },
  { id: '1-2-weeks', title: '1–2 WEEKS', desc: 'Standard Studio Pace' },
  { id: 'month', title: 'WITHIN A MONTH', desc: 'Deep Dive Scope' },
  { id: 'flexible', title: 'FLEXIBLE', desc: 'Open Horizon' },
  { id: 'custom', title: 'CUSTOM DATE', desc: 'Milestone Launch Date' },
  { id: 'other', title: 'OTHER', desc: 'Explain Timeline' },
];

const BUDGET_OPTIONS = [
  'Under ₹5,000',
  '₹5,000–₹10,000',
  '₹10,000–₹25,000',
  '₹25,000–₹50,000',
  '₹50,000–₹1,00,000',
  '₹1,00,000+',
  'Not sure (Need Gizmo Scoping)',
  'Other / Different Budget',
];

export const StartProjectModal: React.FC<StartProjectModalProps> = ({
  isOpen,
  onClose,
  clients,
  projects,
  onAddProject,
  onAddProjectRequest,
  onAddClient,
  onAddNotification,
  onNavigateToClientPortal,
}) => {
  const [step, setStep] = useState<number>(1); // 1 to 8 (8 is review/submit)
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [createdProjectRef, setCreatedProjectRef] = useState<string>('');
  const [submittedTimeStr, setSubmittedTimeStr] = useState<string>('');

  // Form State
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [otherServiceText, setOtherServiceText] = useState<string>('');

  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [industry, setIndustry] = useState<string>('Technology');
  const [otherIndustry, setOtherIndustry] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [otherGoalText, setOtherGoalText] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [referenceLinks, setReferenceLinks] = useState<string>('');

  const [customRequirements, setCustomRequirements] = useState<string>('');

  const [timelineOption, setTimelineOption] = useState<string>('1-2 weeks');
  const [customDate, setCustomDate] = useState<string>('');
  const [otherTimelineText, setOtherTimelineText] = useState<string>('');

  const [budgetOption, setBudgetOption] = useState<string>('₹25,000–₹50,000');
  const [otherBudgetText, setOtherBudgetText] = useState<string>('');

  const [files, setFiles] = useState<ProjectFileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [clientName, setClientName] = useState<string>('');
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [websiteHandle, setWebsiteHandle] = useState<string>('');

  const [validationError, setValidationError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  if (!isOpen) return null;

  const toggleService = (name: string) => {
    if (selectedServices.includes(name)) {
      setSelectedServices(selectedServices.filter((s) => s !== name));
    } else {
      setSelectedServices([...selectedServices, name]);
    }
    setValidationError('');
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploadedFiles = Array.from(e.target.files) as File[];
    const newAttachments: ProjectFileAttachment[] = uploadedFiles.map((f: File, idx: number) => ({
      id: `file-${Date.now()}-${idx}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      type: f.type || 'application/octet-stream',
      category: 'Brief',
      uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    }));
    setFiles((prev) => [...prev, ...newAttachments]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const validateStep = (currentStep: number): boolean => {
    setValidationError('');
    if (currentStep === 1) {
      if (selectedServices.length === 0) {
        setValidationError('Please select at least one creative service.');
        return false;
      }
      if (selectedServices.includes('Other') && !otherServiceText.trim()) {
        setValidationError('Please describe your custom service requirement.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!projectTitle.trim()) {
        setValidationError('Project title / initiative name is required.');
        return false;
      }
      if (!projectDescription.trim()) {
        setValidationError('Project description & core intent is required.');
        return false;
      }
    } else if (currentStep === 7) {
      if (!clientName.trim()) {
        setValidationError('Full client name is required.');
        return false;
      }
      if (!whatsappPhone.trim()) {
        setValidationError('WhatsApp phone number is required.');
        return false;
      }
      if (!emailAddress.trim()) {
        setValidationError('Email address is required.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 8) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setValidationError('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitProject = async () => {
    if (isSubmitting) return;
    if (!validateStep(7)) return;

    setIsSubmitting(true);
    setSubmitError('');

    const now = new Date();
    const nowIso = now.toISOString();
    const submissionDateFormatted = formatExactDateTimeString(nowIso);

    // 1. Generate unique request identifiers
    const requestId = `req-${Date.now()}`;
    const reqNum = `REQ-2026-${String(Math.floor(100 + Math.random() * 900))}`;

    // 2. Format comprehensive project brief
    const fullDescription = [
      projectDescription.trim(),
      industry === 'Other' ? `Industry: ${otherIndustry}` : `Industry: ${industry}`,
      selectedGoals.length > 0 ? `Goals: ${selectedGoals.join(', ')}` : '',
      targetAudience ? `Target Audience: ${targetAudience}` : '',
      referenceLinks ? `References: ${referenceLinks}` : '',
      customRequirements ? `Custom Notes: ${customRequirements}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    // 3. Client matching: check whether client already exists
    let matchedClientId: string | undefined = undefined;
    if (clients && clients.length > 0) {
      const matchResult = findOrCreateClientRecord(
        {
          id: requestId,
          requestNumber: reqNum,
          clientName: clientName.trim(),
          companyName: companyName.trim() || undefined,
          email: emailAddress.trim(),
          whatsapp: whatsappPhone.trim(),
          services: selectedServices,
          projectTitle: projectTitle.trim(),
          description: fullDescription,
          timelineOption,
          budgetRange: budgetOption,
          attachments: files,
          submittedAt: nowIso,
          requestStatus: 'pending_review',
          history: [],
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        clients
      );
      matchedClientId = matchResult.client.id;
    }

    // 4. Create ProjectRequest object with status: 'pending_review'
    const newProjectRequest: ProjectRequest = {
      id: requestId,
      requestId,
      requestNumber: reqNum,
      clientId: matchedClientId,
      clientName: clientName.trim(),
      companyName: companyName.trim() || undefined,
      email: emailAddress.trim(),
      whatsapp: whatsappPhone.trim(),
      services: selectedServices,
      projectTitle: projectTitle.trim(),
      description: fullDescription,
      industry: industry === 'Other' ? otherIndustry : industry,
      goals: selectedGoals,
      targetAudience: targetAudience.trim() || undefined,
      referenceLinks: referenceLinks.trim() || undefined,
      customRequirements: customRequirements.trim() || undefined,
      requirements: customRequirements.trim() || undefined,
      timelineOption,
      timeline: timelineOption,
      requestedDeadline: customDate || undefined,
      budgetRange: budgetOption,
      budget: budgetOption,
      attachments: files,
      submittedAt: nowIso,
      requestStatus: 'pending_review',
      status: 'pending_review',
      history: [
        {
          id: `act-${Date.now()}`,
          timestamp: submissionDateFormatted,
          action: 'Client submitted project request via Start a Project portal',
          actor: 'Client',
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      // 5. Persistent database write
      const savedRequest = await createProjectRequestInFirestore(newProjectRequest);

      if (onAddProjectRequest) {
        onAddProjectRequest(savedRequest);
      }

      // 6. Send Admin Notification
      onAddNotification({
        id: `notif-${Date.now()}`,
        title: '🔔 New Project Request',
        description: `New project request from ${companyName.trim() || clientName.trim()}: "${projectTitle.trim()}" (${selectedServices.join(', ')}) • Budget: ${budgetOption}`,
        timestamp: 'Just now',
        read: false,
        type: 'project',
        relatedEntityType: 'project_request',
        relatedEntityId: savedRequest.id,
        targetRoute: 'admin-project-requests',
        targetId: savedRequest.id,
      });

      setCreatedProjectRef(reqNum);
      setSubmittedTimeStr(submissionDateFormatted);
      setSubmitted(true);
    } catch (saveError) {
      console.error('Project request submission error:', saveError);
      setSubmitError('Unable to submit your project request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    'Services',
    'Project Info',
    'Requirements',
    'Timeline',
    'Budget',
    'Assets',
    'Contact',
    'Review',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden relative">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF5738]/10 text-[#FF5738] flex items-center justify-center font-black text-sm">
              G
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block">
                Gizmo Design Portal
              </span>
              <h2 className="text-sm font-black text-zinc-950">Start a Project Wizard</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!submitted && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-200/70 text-zinc-700">
                Step {step} of 8: {stepsList[step - 1]}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-950 rounded-xl hover:bg-zinc-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!submitted && (
          <div className="w-full bg-zinc-100 h-1 shrink-0">
            <div
              className="bg-[#FF5738] h-1 transition-all duration-300"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {!submitted ? (
            <>
              {/* STEP 1: SERVICES */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                      What are you looking to create?
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Select one or multiple services. Gizmo synthesizes multi-disciplinary teams across all creative mediums.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {SERVICE_OPTIONS.map((srv) => {
                      const isSelected = selectedServices.includes(srv.name);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.name)}
                          className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'border-[#FF5738] bg-orange-50/40 shadow-xs ring-1 ring-[#FF5738]'
                              : 'border-zinc-200 hover:border-zinc-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                              {srv.cat}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                                isSelected ? 'bg-[#FF5738] border-[#FF5738] text-white' : 'border-zinc-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-zinc-950">{srv.name}</h4>
                            <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{srv.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedServices.includes('Other') && (
                    <div className="pt-2 animate-in fade-in">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        TELL US WHAT YOU NEED *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 3D Exhibition Stall Design, AR Filter, Debossed Signage, Audio Branding..."
                        value={otherServiceText}
                        onChange={(e) => setOtherServiceText(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: PROJECT INFORMATION */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                      Tell us about the project.
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Provide initiative details, core intent, and strategic goals.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                        PROJECT TITLE / INITIATIVE NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Malabar Gold Rebrand 2026 / Apex Tower Launch"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                        PROJECT DESCRIPTION & CORE INTENT *
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Describe the project scope, background, aesthetic vision, and what problem this creative work solves..."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition resize-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                          INDUSTRY VERTICAL
                        </label>
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium bg-white"
                        >
                          {INDUSTRY_OPTIONS.map((ind) => (
                            <option key={ind} value={ind}>
                              {ind}
                            </option>
                          ))}
                        </select>
                      </div>

                      {industry === 'Other' && (
                        <div>
                          <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                            SPECIFY INDUSTRY *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Aerospace / Marine"
                            value={otherIndustry}
                            onChange={(e) => setOtherIndustry(e.target.value)}
                            className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-zinc-950 block mb-2">
                        PRIMARY PROJECT GOALS (Select multiple)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {GOAL_OPTIONS.map((goal) => {
                          const isChecked = selectedGoals.includes(goal);
                          return (
                            <div
                              key={goal}
                              onClick={() => toggleGoal(goal)}
                              className={`p-3 rounded-xl border text-xs font-bold cursor-pointer flex items-center justify-between transition ${
                                isChecked
                                  ? 'border-[#FF5738] bg-orange-50/40 text-[#FF5738]'
                                  : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                              }`}
                            >
                              <span>{goal}</span>
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isChecked ? 'bg-[#FF5738] border-[#FF5738] text-white' : 'border-zinc-300'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                          TARGET AUDIENCE / CONSUMERS
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. High-net-worth buyers, Gen-Z tech professionals..."
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                          REFERENCE LINKS / COMPETITORS
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. behance.net/gallery/... or competitor.com"
                          value={referenceLinks}
                          onChange={(e) => setReferenceLinks(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: REQUIREMENTS */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                      TELL US ABOUT YOUR OTHER REQUIREMENT
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Describe any specific deliverables, dimensions, technical guidelines, printing instructions, or platform specifications.
                    </p>
                  </div>

                  <div>
                    <textarea
                      rows={6}
                      placeholder="Describe your custom requirement in detail... (e.g. Matt laminated 300 GSM business cards with gold foil stamping, responsive Figma UI kit for iOS and Android, or 4K 60fps social media reels with custom sound design)"
                      value={customRequirements}
                      onChange={(e) => setCustomRequirements(e.target.value)}
                      className="w-full p-4 text-xs rounded-2xl border border-zinc-200 outline-none focus:border-[#FF5738] transition resize-none font-medium leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: TIMELINE */}
              {step === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                      When do you need this completed?
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Select your desired delivery timeframe or milestone launch date.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {TIMELINE_OPTIONS.map((opt) => {
                      const isSelected = timelineOption === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setTimelineOption(opt.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'border-[#FF5738] bg-orange-50/40 ring-1 ring-[#FF5738]'
                              : 'border-zinc-200 hover:border-zinc-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-zinc-950">{opt.title}</span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'bg-[#FF5738] border-[#FF5738] text-white' : 'border-zinc-300'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <span className="text-[11px] text-zinc-500">{opt.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  {timelineOption === 'custom' && (
                    <div className="pt-2 animate-in fade-in">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        SELECT MILESTONE LAUNCH DATE *
                      </label>
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                      />
                    </div>
                  )}

                  {timelineOption === 'other' && (
                    <div className="pt-2 animate-in fade-in">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        EXPLAIN TIMELINE *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Phased rollout over 3 months..."
                        value={otherTimelineText}
                        onChange={(e) => setOtherTimelineText(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: BUDGET */}
              {step === 5 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                      Anticipated Budget Range
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Helps us tailor creative scope and resource allocation to match your investment scale.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUDGET_OPTIONS.map((bud) => {
                      const isSelected = budgetOption === bud;
                      return (
                        <div
                          key={bud}
                          onClick={() => setBudgetOption(bud)}
                          className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'border-[#FF5738] bg-orange-50/40 ring-1 ring-[#FF5738]'
                              : 'border-zinc-200 hover:border-zinc-300 bg-white'
                          }`}
                        >
                          <span className="text-xs font-extrabold text-zinc-950">{bud}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-[#FF5738] border-[#FF5738] text-white' : 'border-zinc-300'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {budgetOption === 'Other / Different Budget' && (
                    <div className="pt-2 animate-in fade-in">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        ENTER CUSTOM BUDGET (INR) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹1,50,000"
                        value={otherBudgetText}
                        onChange={(e) => setOtherBudgetText(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                      />
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-zinc-900">Strict Client Confidentiality</h5>
                      <p className="text-[11px] text-zinc-500">
                        All financial figures and project briefs are protected under Gizmo Studio NDAs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: ASSETS & REFERENCES */}
              {step === 6 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                      Upload Assets & References
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Share existing logos, brand guidelines, moodboards, PDF documents, or competitor references. (Optional)
                    </p>
                  </div>

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files) {
                        const dropped = Array.from(e.dataTransfer.files) as File[];
                        const newAtts: ProjectFileAttachment[] = dropped.map((f: File, i: number) => ({
                          id: `file-drop-${Date.now()}-${i}`,
                          name: f.name,
                          size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
                          type: f.type || 'application/octet-stream',
                          category: 'Brief',
                          uploadedAt: new Date().toLocaleDateString('en-GB'),
                        }));
                        setFiles((prev) => [...prev, ...newAtts]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center transition flex flex-col items-center justify-center gap-3 ${
                      isDragging ? 'border-[#FF5738] bg-orange-50/50' : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-zinc-200 flex items-center justify-center text-zinc-700">
                      <Upload className="w-5 h-5 text-[#FF5738]" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-zinc-900">
                        Drag & drop files here, or{' '}
                        <label className="text-[#FF5738] cursor-pointer hover:underline">
                          browse
                          <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                        </label>
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Supports PNG, JPG, PDF, AI, EPS, SVG, ZIP (Max 50MB)
                      </p>
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-700">Uploaded Files ({files.length})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="p-3 rounded-xl border border-zinc-200 bg-white flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <FileText className="w-4 h-4 text-[#FF5738] shrink-0" />
                              <span className="font-bold text-zinc-900 truncate">{file.name}</span>
                              <span className="text-[10px] text-zinc-400 shrink-0">({file.size})</span>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 7: CLIENT CONTACT DETAILS */}
              {step === 7 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                      Client Contact Details
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Where should Gizmo creative directors reach you regarding deliverables and status?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                          FULL NAME *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Muhammed Rafeeq"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                          WHATSAPP PHONE NUMBER *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98458 79017"
                          value={whatsappPhone}
                          onChange={(e) => setWhatsappPhone(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                        />
                        <span className="text-[10px] text-zinc-400 mt-1 block">
                          Must belong to the client (Not Gizmo's official WhatsApp).
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                          EMAIL ADDRESS *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="client@company.com"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                          COMPANY / BRAND NAME
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Apex Builders / Darul Hasaniyyah"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-zinc-950 block mb-1.5">
                        CURRENT WEBSITE OR SOCIAL HANDLE
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. @brandhandle or https://brand.com"
                        value={websiteHandle}
                        onChange={(e) => setWebsiteHandle(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 outline-none focus:border-[#FF5738] transition font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: REVIEW & SUBMIT */}
              {step === 8 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                      Review & Submit Project Brief
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Please verify your information before submitting to the Gizmo Design creative director queue.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Services */}
                    <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5738] block mb-1">
                          1. Services Selected
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedServices.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800"
                            >
                              {s} {s === 'Other' && otherServiceText ? `(${otherServiceText})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="text-xs font-extrabold text-[#FF5738] hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Project Information */}
                    <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5738] block">
                          2. Project Information
                        </span>
                        <h4 className="text-sm font-black text-zinc-950">{projectTitle}</h4>
                        <p className="text-xs text-zinc-600 line-clamp-2">{projectDescription}</p>
                        <p className="text-[11px] text-zinc-500 font-medium">
                          Industry: {industry === 'Other' ? otherIndustry : industry} · Goals: {selectedGoals.join(', ')}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        className="text-xs font-extrabold text-[#FF5738] hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Timeline & Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5738] block mb-1">
                            4. Timeline
                          </span>
                          <p className="text-xs font-extrabold text-zinc-900 uppercase">
                            {timelineOption} {customDate ? `(${customDate})` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => setStep(4)}
                          className="text-xs font-extrabold text-[#FF5738] hover:underline"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5738] block mb-1">
                            5. Budget Range
                          </span>
                          <p className="text-xs font-extrabold text-zinc-900">{budgetOption}</p>
                        </div>
                        <button
                          onClick={() => setStep(5)}
                          className="text-xs font-extrabold text-[#FF5738] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Assets */}
                    <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5738] block mb-1">
                          6. Uploaded Assets
                        </span>
                        <p className="text-xs font-bold text-zinc-800">
                          {files.length > 0 ? `${files.length} file(s) attached` : 'No files attached'}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep(6)}
                        className="text-xs font-extrabold text-[#FF5738] hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Client Contact */}
                    <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5738] block">
                          7. Client Contact
                        </span>
                        <h4 className="text-xs font-extrabold text-zinc-900">
                          {clientName} {companyName ? `(${companyName})` : ''}
                        </h4>
                        <p className="text-[11px] text-zinc-600">
                          WhatsApp: {whatsappPhone} · Email: {emailAddress}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep(7)}
                        className="text-xs font-extrabold text-[#FF5738] hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10 text-amber-600" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Request Status: Pending Review</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                  Project Request Submitted Successfully
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                  Your brief has been registered with reference code{' '}
                  <span className="font-extrabold text-zinc-950 font-mono">{createdProjectRef}</span>.
                  The Gizmo Senior Creative Team is currently reviewing your scope and requirements.
                </p>
              </div>

              <div className="max-w-md mx-auto p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Request Number:</span>
                  <span className="font-extrabold text-zinc-950 font-mono">{createdProjectRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Status:</span>
                  <span className="font-bold text-amber-700">Pending Review</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Submitted At:</span>
                  <span className="font-bold text-zinc-800">{submittedTimeStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Notification Channel:</span>
                  <span className="font-bold text-zinc-800">{whatsappPhone} · In-App</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200/80 pt-2">
                  <span className="text-zinc-500 font-medium">Next Milestone:</span>
                  <span className="font-bold text-emerald-700">Creative Director Acceptance</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onNavigateToClientPortal && (
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setStep(1);
                      onClose();
                      onNavigateToClientPortal();
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-[#FF5738] hover:bg-orange-600 text-white rounded-xl text-xs font-extrabold transition shadow-sm"
                  >
                    View in Client Workspace →
                  </button>
                )}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setStep(1);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-extrabold transition shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Error banner */}
        {!submitted && submitError && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Footer Navigation */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 8 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-[#FF5738] text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitProject}
                className={`px-8 py-2.5 rounded-xl bg-[#FF5738] hover:bg-orange-600 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-sm ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>SUBMITTING BRIEF...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>SUBMIT PROJECT</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

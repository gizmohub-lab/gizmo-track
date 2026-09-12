import {
  Invoice,
  Client,
  Project,
  LocalWork,
  InvoiceSettings,
  DeadlineItem,
  CustomDesigner,
  DesignCategory,
  WorkTypeItem,
  Note,
} from '../types';
import { normalizeProject } from '../utils/projectUtils';

export const defaultSettings: InvoiceSettings = {
  businessProfile: {
    businessName: 'GIZMO DESIGN',
    tagline: 'Design & Creative Studio',
    logoUrl: '',
    address: 'Creative District, Design Hub',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pinCode: '560001',
    phone: '+91 98458 79017',
    email: 'gizmo.hub.in@gmail.com',
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
  },
  numberingPrefix: 'A',
  startingNumber: 1,
  autoNumbering: true,
  paymentConfig: {
    upiId: '9845879017-2@ybl',
    accountName: 'GIZMO DESIGN',
    bankName: 'HDFC Bank',
    accountNumber: '50200084920194',
    ifsc: 'HDFC0001234',
    instructions: 'Scan QR using any UPI app (GPay, PhonePe, Paytm, BHIM)',
  },
  defaultGstRate: 0,
  defaultTaxType: 'CGST_SGST',
  footerText: 'For any enquiry, reach out via email at gizmo.hub.in@gmail.com | Phone: +91 98458 79017',
  disclaimer: 'This is an electronically generated document, no signature is required.',
};

export const initialClients: Client[] = [
  {
    id: 'client-1',
    name: 'DARUL HASANIYYAH SNEC',
    company: 'Darul Hasaniyyah Educational Council',
    address: 'Campus Road, Vengara',
    city: 'Malappuram',
    state: 'Kerala',
    country: 'India',
    pinCode: '676304',
    phone: '+91 94471 28409',
    email: 'darulhasaniyyah.snec@gmail.com',
    gstin: '32AABTD9841C1Z4',
    createdAt: '2026-06-10T10:00:00Z',
  },
  {
    id: 'client-2',
    name: 'Apex Retail Brands',
    company: 'Apex Retail India Pvt Ltd',
    address: 'Plot 42, Industrial Zone',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pinCode: '560068',
    phone: '+91 98860 41235',
    email: 'accounts@apexretail.in',
    gstin: '29AAACA8872L1ZX',
    createdAt: '2026-07-02T11:30:00Z',
  },
  {
    id: 'client-3',
    name: 'Lumin Studio',
    company: 'Lumin Media & Architecture',
    address: '7th Cross, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pinCode: '560034',
    phone: '+91 97410 98512',
    email: 'hello@luminstudio.co',
    createdAt: '2026-07-15T09:20:00Z',
  },
  {
    id: 'client-4',
    name: 'Eid Celebration Committee',
    company: 'Community Cultural Wing',
    address: 'Town Hall Road',
    city: 'Kozhikode',
    state: 'Kerala',
    country: 'India',
    pinCode: '673001',
    phone: '+91 98460 32189',
    email: 'eidcommittee@culture.org',
    createdAt: '2026-08-01T14:15:00Z',
  },
  {
    id: 'client-5',
    name: 'Craft & Co Boutique',
    company: 'Craft & Co Lifestyle',
    address: 'Heritage Mall, Level 2',
    city: 'Mangaluru',
    state: 'Karnataka',
    country: 'India',
    pinCode: '575001',
    phone: '+91 98450 77123',
    email: 'craftco.store@gmail.com',
    createdAt: '2026-08-10T16:00:00Z',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    projectCode: 'PRJ-0001',
    title: 'Brand Identity — Darul Hasaniyyah SNEC',
    clientId: 'client-1',
    clientName: 'DARUL HASANIYYAH SNEC',
    clientBrand: 'Darul Hasaniyyah SNEC',
    clientPhone: '+91 94471 28409',
    projectType: 'Branding',
    category: 'Branding',
    assignedDesignerId: 'des-fayis',
    assignedDesignerName: 'Fayis Designer',
    customDisplayName: 'Fayis Calligraphy Studio',
    priority: 'High',
    startDate: '2026-08-05',
    hasDeadline: true,
    deadlineDate: '2026-08-20',
    deadlineTime: '17:00',
    dueDate: '2026-08-20',
    budget: 4000,
    totalAmount: 4000,
    amountGot: 4000,
    amountToGet: 0,
    paymentStatus: 'Paid',
    payments: [
      {
        id: 'pay-p1-1',
        date: '2026-08-05',
        amount: 2000,
        method: 'UPI',
        note: '50% Advance Deposit',
        recordedAt: '05 Aug 2026 · 10:30 AM',
      },
      {
        id: 'pay-p1-2',
        date: '2026-08-20',
        amount: 2000,
        method: 'Bank Transfer',
        note: 'Final settlement upon artwork release',
        recordedAt: '20 Aug 2026 · 04:00 PM',
      },
    ],
    status: 'Completed',
    description:
      'Complete institutional identity suite including Arabic emblem, bilingual letterhead, and official seals.',
    deliverables: [
      {
        id: 'del-p1-1',
        title: 'Calligraphic Emblem & Initial Proof',
        type: 'Milestone',
        isRequired: true,
        isCompleted: true,
        completedAt: '08 Aug 2026 · 03:30 PM',
        orderIndex: 1,
      },
      {
        id: 'del-p1-2',
        title: 'Client Council Presentation & Review',
        type: 'Review',
        isRequired: true,
        isCompleted: true,
        completedAt: '12 Aug 2026 · 11:00 AM',
        orderIndex: 2,
      },
      {
        id: 'del-p1-3',
        title: 'Institutional Stationery Collateral',
        type: 'Deliverable',
        isRequired: true,
        isCompleted: true,
        completedAt: '16 Aug 2026 · 05:15 PM',
        orderIndex: 3,
      },
      {
        id: 'del-p1-4',
        title: 'Vector Master Files & Usage Guidelines',
        type: 'Handover',
        isRequired: true,
        isCompleted: true,
        completedAt: '20 Aug 2026 · 04:30 PM',
        orderIndex: 4,
      },
    ],
    revisions: [],
    files: [
      {
        id: 'file-p1-1',
        name: 'SNEC_Primary_Emblem.svg',
        type: 'image/svg+xml',
        size: '1.2 MB',
        category: 'Final Handover',
        uploadedAt: '20 Aug 2026 · 04:35 PM',
      },
    ],
    history: [
      {
        id: 'hist-p1-1',
        timestamp: '05 Aug 2026 · 09:00 AM',
        action: 'Project created in Gizmo Workspace',
        note: 'Initialized with budget of ₹4,000',
      },
      {
        id: 'hist-p1-2',
        timestamp: '05 Aug 2026 · 10:30 AM',
        action: 'Payment received (₹2,000)',
        note: 'Advance received via UPI',
      },
      {
        id: 'hist-p1-3',
        timestamp: '20 Aug 2026 · 04:30 PM',
        action: 'All deliverables completed — 100%',
      },
    ],
    createdAt: '2026-08-05T09:00:00Z',
  },
  {
    id: 'proj-2',
    projectCode: 'PRJ-0002',
    title: 'Brand Identity & Packaging — Apex Retail Brands',
    clientId: 'client-2',
    clientName: 'Apex Retail Brands',
    clientBrand: 'Apex Gourmet',
    clientPhone: '+91 98860 41235',
    projectType: 'Packaging',
    category: 'Packaging',
    assignedDesignerId: 'des-ashi',
    assignedDesignerName: 'Ashi Designs',
    customDisplayName: 'Ashi Packaging Lab',
    priority: 'Urgent',
    startDate: '2026-08-12',
    hasDeadline: true,
    deadlineDate: '2026-09-25',
    deadlineTime: '18:00',
    dueDate: '2026-09-25',
    budget: 18500,
    totalAmount: 18500,
    amountGot: 10000,
    amountToGet: 8500,
    paymentStatus: 'Partially Paid',
    payments: [
      {
        id: 'pay-p2-1',
        date: '2026-08-12',
        amount: 10000,
        method: 'Bank Transfer',
        note: 'Advance booking deposit',
        recordedAt: '12 Aug 2026 · 11:15 AM',
      },
    ],
    status: 'In Progress',
    description:
      'Full retail identity redesign, standee box dielines, foil stamping guidelines, and signage mockups.',
    deliverables: [
      {
        id: 'del-p2-1',
        title: 'Moodboard & Visual Tone Discovery',
        type: 'Milestone',
        isRequired: true,
        isCompleted: true,
        completedAt: '18 Aug 2026 · 02:40 PM',
        orderIndex: 1,
      },
      {
        id: 'del-p2-2',
        title: 'Front Panel Dielines & Typography Layout',
        type: 'Deliverable',
        isRequired: true,
        isCompleted: true,
        completedAt: '28 Aug 2026 · 06:10 PM',
        orderIndex: 2,
      },
      {
        id: 'del-p2-3',
        title: '3D Box Mockup Presentation & Review',
        type: 'Review',
        isRequired: true,
        isCompleted: false,
        deadlineDate: '2026-09-15',
        deadlineTime: '17:00',
        orderIndex: 3,
      },
      {
        id: 'del-p2-4',
        title: 'Pre-Press Production Files (Spot Foil & CMYK)',
        type: 'Handover',
        isRequired: true,
        isCompleted: false,
        deadlineDate: '2026-09-25',
        deadlineTime: '18:00',
        orderIndex: 4,
      },
    ],
    revisions: [
      {
        id: 'rev-p2-1',
        revisionNo: 1,
        date: '2026-08-30',
        note: 'Adjusted barcode clearance margin to 15mm per packaging vendor spec.',
        createdAt: '30 Aug 2026 · 04:00 PM',
      },
    ],
    files: [
      {
        id: 'file-p2-1',
        name: 'Apex_Box_Dieline_Specs.pdf',
        type: 'application/pdf',
        size: '3.4 MB',
        category: 'Brief',
        uploadedAt: '12 Aug 2026 · 11:30 AM',
      },
    ],
    history: [
      {
        id: 'hist-p2-1',
        timestamp: '12 Aug 2026 · 10:00 AM',
        action: 'Project created in Gizmo Workspace',
        note: 'Assigned to Ashi Designs (Display: Ashi Packaging Lab)',
      },
      {
        id: 'hist-p2-2',
        timestamp: '12 Aug 2026 · 11:15 AM',
        action: 'Advance payment received (₹10,000)',
      },
    ],
    createdAt: '2026-08-12T10:00:00Z',
  },
  {
    id: 'proj-3',
    projectCode: 'PRJ-0003',
    title: 'Lumin Studio Architectural Portfolio Platform',
    clientId: 'client-3',
    clientName: 'Lumin Studio',
    clientBrand: 'Lumin Architecture',
    clientPhone: '+91 97410 98512',
    projectType: 'UI/UX',
    category: 'UI/UX',
    assignedDesignerId: 'des-ahmed',
    assignedDesignerName: 'Ahmed',
    customDisplayName: 'Ahmed Designs',
    priority: 'Normal',
    startDate: '2026-08-18',
    hasDeadline: true,
    deadlineDate: '2026-09-30',
    deadlineTime: '18:00',
    dueDate: '2026-09-30',
    budget: 32000,
    totalAmount: 32000,
    amountGot: 15000,
    amountToGet: 17000,
    paymentStatus: 'Partially Paid',
    payments: [
      {
        id: 'pay-p3-1',
        date: '2026-08-18',
        amount: 15000,
        method: 'UPI',
        note: 'Sprint 1 Advance Transfer',
        recordedAt: '18 Aug 2026 · 09:30 AM',
      },
    ],
    status: 'In Progress',
    description:
      'High-contrast portfolio showcase and interactive CMS prototype for architectural projects.',
    deliverables: [
      {
        id: 'del-p3-1',
        title: 'Information Architecture & Wireframes',
        type: 'Milestone',
        isRequired: true,
        isCompleted: true,
        completedAt: '25 Aug 2026 · 04:00 PM',
        orderIndex: 1,
      },
      {
        id: 'del-p3-2',
        title: 'High-Fidelity Desktop & Mobile UI in Figma',
        type: 'Deliverable',
        isRequired: true,
        isCompleted: true,
        completedAt: '04 Sep 2026 · 05:30 PM',
        orderIndex: 2,
      },
      {
        id: 'del-p3-3',
        title: 'Design System & Component Library Tokens',
        type: 'Deliverable',
        isRequired: true,
        isCompleted: false,
        deadlineDate: '2026-09-18',
        deadlineTime: '18:00',
        orderIndex: 3,
      },
      {
        id: 'del-p3-4',
        title: 'Interactive Prototype Handover for Development',
        type: 'Handover',
        isRequired: true,
        isCompleted: false,
        deadlineDate: '2026-09-30',
        deadlineTime: '18:00',
        orderIndex: 4,
      },
    ],
    revisions: [],
    files: [],
    history: [
      {
        id: 'hist-p3-1',
        timestamp: '18 Aug 2026 · 09:00 AM',
        action: 'Project created in Gizmo Workspace',
      },
    ],
    createdAt: '2026-08-18T15:00:00Z',
  },
];

export const initialWorkTypes: WorkTypeItem[] = [
  {
    id: 'wt-poster',
    name: 'Poster',
    description: 'Static graphic/design works (Social Media, Event, Print, Banner)',
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'wt-motion',
    name: 'Motion',
    description: 'Animated/motion-design works (Reels, Motion Posters, Short Motion Graphics)',
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'wt-other',
    name: 'Other',
    description: 'Anything that does not fit above categories (Allows custom specification)',
    isActive: true,
    isSystemDefault: true,
  },
];

export const initialDesignCategories: DesignCategory[] = [
  { id: 'cat-1', name: 'Poster', description: 'Event and promotional static posters', isActive: true, displayOrder: 1 },
  { id: 'cat-2', name: 'Motion', description: 'Animated motion graphics & teasers', isActive: true, displayOrder: 2 },
  { id: 'cat-3', name: 'Social Media', description: 'Feed posters, stories and carousels', isActive: true, displayOrder: 3 },
  { id: 'cat-4', name: 'Branding', description: 'Brand identity kits and brand assets', isActive: true, displayOrder: 4 },
  { id: 'cat-5', name: 'Logo', description: 'Primary marks, badges and monograms', isActive: true, displayOrder: 5 },
  { id: 'cat-6', name: 'Flyer', description: 'Handouts, circulars and leaflets', isActive: true, displayOrder: 6 },
  { id: 'cat-7', name: 'Invitation', description: 'Weddings, VIP cards, program invites', isActive: true, displayOrder: 7 },
  { id: 'cat-8', name: 'Banner', description: 'Outdoor vinyl flex, hoardings & standees', isActive: true, displayOrder: 8 },
  { id: 'cat-9', name: 'Certificate', description: 'Appreciation & commemorative awards', isActive: true, displayOrder: 9 },
  { id: 'cat-10', name: 'Visiting Card', description: 'Spot UV, velvet matte business cards', isActive: true, displayOrder: 10 },
  { id: 'cat-11', name: 'Brochure', description: 'Bi-fold & tri-fold marketing collateral', isActive: true, displayOrder: 11 },
  { id: 'cat-12', name: 'Video', description: 'Reels, promo shorts & motion cuts', isActive: true, displayOrder: 12 },
  { id: 'cat-13', name: 'Photo Editing', description: 'Studio portrait & color grading', isActive: true, displayOrder: 13 },
  { id: 'cat-14', name: 'Printing', description: 'Offset, digital & specialty print works', isActive: true, displayOrder: 14 },
  { id: 'cat-15', name: 'Other', description: 'Specialized or bespoke creative briefs', isActive: true, displayOrder: 15 },
];

export const initialWorkCategories: string[] = initialDesignCategories.map((c) => c.name);

export const initialDesigners: CustomDesigner[] = [
  {
    id: 'des-ahmed',
    name: 'Ahmed',
    type: 'Portal Staff',
    phone: '+91 98458 79017',
    whatsapp: '919845879017',
    email: 'ahmed@gizmostudio.in',
    roleSpecialization: 'Lead Visual Designer & Typography',
    notes: 'In-house lead designer for corporate brands & motion posters',
    isActive: true,
    createdAt: '2026-06-01',
  },
  {
    id: 'des-fayis',
    name: 'Fayis Designer',
    type: 'Portal Staff',
    phone: '+91 94471 28409',
    whatsapp: '919447128409',
    email: 'fayis@gizmostudio.in',
    roleSpecialization: 'Arabic Calligraphy & Event Graphics',
    notes: 'In-house designer for institutional posters & press artworks',
    isActive: true,
    createdAt: '2026-06-15',
  },
  {
    id: 'des-arjun',
    name: 'Arjun Graphics',
    type: 'Portal Staff',
    phone: '+91 97410 88231',
    whatsapp: '919741088231',
    email: 'arjun@gizmostudio.in',
    roleSpecialization: 'Outdoor Flex, Signage & Fast Socials',
    notes: 'Fast turnaround specialist for local commercial works',
    isActive: true,
    createdAt: '2026-07-10',
  },
  {
    id: 'des-ashi',
    name: 'Ashi Designs',
    type: 'External Designer',
    phone: '+91 94460 33412',
    whatsapp: '919446033412',
    email: 'ashi.creative@gmail.com',
    roleSpecialization: 'Packaging, 3D Renders & Gold Foil',
    notes: 'Independent freelancer based in Calicut; reachable on WhatsApp',
    isActive: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'des-studiox',
    name: 'Studio X',
    type: 'External Designer',
    phone: '+91 98951 88723',
    whatsapp: '919895188723',
    email: 'hello@studioxdesign.com',
    roleSpecialization: '3D Motion, After Effects & Reel Graphics',
    notes: 'External creative agency partner for animated projects',
    isActive: true,
    createdAt: '2026-08-15',
  },
  {
    id: 'des-anas',
    name: 'Anas Motion',
    type: 'External Designer',
    phone: '+91 98472 65432',
    whatsapp: '919847265432',
    email: 'anas.motionlab@gmail.com',
    roleSpecialization: 'Kinetic Typography & Social Reels',
    notes: 'External motion artist on standby for seasonal campaigns',
    isActive: true,
    createdAt: '2026-08-20',
  },
];

export const initialLocalWorks: LocalWork[] = [
  {
    id: 'lw-1',
    workId: 'LW-0001',
    title: 'SNEC Annual Day Poster & Social Graphics',
    clientId: 'client-1',
    clientName: 'DARUL HASANIYYAH SNEC',
    clientPhone: '+91 94471 28409',
    clientWhatsApp: '919447128409',
    clientOrg: 'Darul Hasaniyyah Educational Council',
    clientLocation: 'Vengara, Malappuram',
    workType: 'Poster',
    category: 'Poster',
    amount: 2500,
    totalAmount: 2500,
    amountGot: 2500,
    amountToGet: 0,
    paymentStatus: 'Paid',
    paymentRecords: [
      {
        id: 'pr-lw1-1',
        amount: 2500,
        date: '2026-09-08',
        method: 'UPI',
        note: 'Full advance payment via GPay',
      },
    ],
    status: 'In Progress',
    priority: 'Urgent',
    assignedTo: 'Fayis Designer',
    supportingDesigners: ['Ahmed'],
    date: '2026-09-08',
    receivedDate: '2026-09-08',
    deadlineDate: '2026-09-10',
    deadlineTime: '16:30',
    notes: 'Multi-lingual Arabic & Malayalam commemorative poster artwork for print. High-res vector format for 18x24 inch glossy print.',
    revisionCount: 1,
    revisions: [
      {
        revisionNo: 1,
        date: '2026-09-09',
        note: 'Updated guest speaker title and corrected Malayalam typography.',
      },
    ],
    attachments: [
      {
        id: 'att-1',
        name: 'SNEC_Official_Emblem.svg',
        type: 'image/svg+xml',
        size: '142 KB',
        category: 'Design reference',
        uploadedAt: '2026-09-08',
      },
      {
        id: 'att-2',
        name: 'Poster_Draft_v1.png',
        type: 'image/png',
        size: '2.4 MB',
        category: 'Final design',
        uploadedAt: '2026-09-09',
      },
    ],
    history: [
      {
        id: 'hist-lw1-1',
        timestamp: '08 Sep 2026 · 10:30 AM',
        action: 'Work order created',
        note: 'Order initiated for SNEC Annual Day',
      },
      {
        id: 'hist-lw1-2',
        timestamp: '08 Sep 2026 · 11:15 AM',
        action: 'Assigned to Fayis Designer',
      },
      {
        id: 'hist-lw1-3',
        timestamp: '08 Sep 2026 · 02:00 PM',
        action: 'Status changed to In Progress',
      },
      {
        id: 'hist-lw1-4',
        timestamp: '09 Sep 2026 · 04:30 PM',
        action: 'Revision 1 requested by client',
        note: 'Updated guest speaker title & Malayalam typography',
      },
    ],
  },
  {
    id: 'lw-2',
    workId: 'LW-0002',
    title: 'Institutional Seal & Letterhead Press',
    clientId: 'client-1',
    clientName: 'DARUL HASANIYYAH SNEC',
    clientPhone: '+91 94471 28409',
    clientWhatsApp: '919447128409',
    clientOrg: 'Darul Hasaniyyah Educational Council',
    clientLocation: 'Vengara, Malappuram',
    workType: 'Other',
    otherWorkTypeDetail: 'Institutional Seal & Letterhead Press',
    category: 'Printing',
    amount: 500,
    totalAmount: 500,
    amountGot: 500,
    amountToGet: 0,
    paymentStatus: 'Paid',
    paymentRecords: [
      {
        id: 'pr-lw2-1',
        amount: 500,
        date: '2026-09-06',
        method: 'Cash',
        note: 'Counter cash received',
      },
    ],
    status: 'Completed',
    priority: 'Normal',
    assignedTo: 'Ahmed',
    date: '2026-09-06',
    receivedDate: '2026-09-06',
    deadlineDate: '2026-09-09',
    deadlineTime: '14:00',
    notes: '250gsm parchment printing and wooden rubber stamp fabrication. 2 stamp copies delivered to campus office.',
    revisionCount: 0,
    attachments: [
      {
        id: 'att-3',
        name: 'Seal_Blueprint_Approval.pdf',
        type: 'application/pdf',
        size: '640 KB',
        category: 'Brief',
        uploadedAt: '2026-09-06',
      },
    ],
    history: [
      {
        id: 'hist-lw2-1',
        timestamp: '06 Sep 2026 · 09:15 AM',
        action: 'Work order created',
      },
      {
        id: 'hist-lw2-2',
        timestamp: '07 Sep 2026 · 03:00 PM',
        action: 'Fabrication completed in workshop',
      },
      {
        id: 'hist-lw2-3',
        timestamp: '09 Sep 2026 · 01:45 PM',
        action: 'Marked Completed & Delivered',
        note: 'Handed over with invoice acknowledgment',
      },
    ],
  },
  {
    id: 'lw-3',
    workId: 'LW-0003',
    title: 'Craft & Co Autumn Sale Flex Banner',
    clientId: 'client-5',
    clientName: 'Craft & Co Boutique',
    clientPhone: '+91 98450 77123',
    clientWhatsApp: '919845077123',
    clientOrg: 'Craft & Co Lifestyle',
    clientLocation: 'Heritage Mall, Mangaluru',
    workType: 'Poster',
    category: 'Banner',
    amount: 3200,
    totalAmount: 3200,
    amountGot: 1500,
    amountToGet: 1700,
    paymentStatus: 'Partially Paid',
    paymentRecords: [
      {
        id: 'pr-lw3-1',
        amount: 1500,
        date: '2026-09-07',
        method: 'UPI',
        note: 'Advance booking payment',
      },
    ],
    status: 'Revision',
    priority: 'High',
    assignedTo: 'Arjun Graphics',
    date: '2026-09-07',
    receivedDate: '2026-09-07',
    deadlineDate: '2026-09-11',
    deadlineTime: '18:00',
    notes: 'Vinyl flex board 10x4 ft for showroom exterior entrance. Eyelets on all 4 corners.',
    revisionCount: 2,
    revisions: [
      {
        revisionNo: 1,
        date: '2026-09-08',
        note: 'Change background from pastel to warm earthy amber.',
      },
      {
        revisionNo: 2,
        date: '2026-09-09',
        note: 'Emphasize "UP TO 40% OFF" badge in bolder type.',
      },
    ],
    attachments: [
      {
        id: 'att-4',
        name: 'Storefront_Dimensions.jpg',
        type: 'image/jpeg',
        size: '1.8 MB',
        category: 'Brief',
        uploadedAt: '2026-09-07',
      },
    ],
    history: [
      {
        id: 'hist-lw3-1',
        timestamp: '07 Sep 2026 · 11:40 AM',
        action: 'Work order created',
      },
      {
        id: 'hist-lw3-2',
        timestamp: '08 Sep 2026 · 10:20 AM',
        action: 'Advance payment recorded (₹1,500)',
      },
      {
        id: 'hist-lw3-3',
        timestamp: '09 Sep 2026 · 05:10 PM',
        action: 'Revision 2 requested',
        note: 'Client requested larger sale badge',
      },
    ],
  },
  {
    id: 'lw-4',
    workId: 'LW-0004',
    title: 'Apex Retail VIP Launch Invitation Cards',
    clientId: 'client-2',
    clientName: 'Apex Retail Brands',
    clientPhone: '+91 98860 41235',
    clientWhatsApp: '919886041235',
    clientOrg: 'Apex Retail India Pvt Ltd',
    clientLocation: 'Industrial Zone, Bengaluru',
    workType: 'Poster',
    category: 'Invitation',
    amount: 4800,
    totalAmount: 4800,
    amountGot: 0,
    amountToGet: 4800,
    paymentStatus: 'Not Paid',
    paymentRecords: [],
    status: 'Waiting for Client',
    priority: 'Normal',
    assignedTo: 'Ashi Designs',
    date: '2026-09-08',
    receivedDate: '2026-09-08',
    deadlineDate: '2026-09-12',
    deadlineTime: '12:00',
    notes: 'Premium gold-foil embossed invitation card design (5x7 inch) with matching envelope sleeve.',
    revisionCount: 0,
    attachments: [
      {
        id: 'att-5',
        name: 'Gold_Foil_Sample.jpg',
        type: 'image/jpeg',
        size: '890 KB',
        category: 'Design reference',
        uploadedAt: '2026-09-08',
      },
    ],
    history: [
      {
        id: 'hist-lw4-1',
        timestamp: '08 Sep 2026 · 03:20 PM',
        action: 'Work order created',
      },
      {
        id: 'hist-lw4-2',
        timestamp: '09 Sep 2026 · 11:30 AM',
        action: 'Draft shared with client; Waiting for text sign-off',
      },
    ],
  },
  {
    id: 'lw-5',
    workId: 'LW-0005',
    title: 'Lumin Studio Minimal Visiting Cards',
    clientId: 'client-3',
    clientName: 'Lumin Studio',
    clientPhone: '+91 97410 98512',
    clientWhatsApp: '919741098512',
    clientOrg: 'Lumin Media & Architecture',
    clientLocation: 'Koramangala, Bengaluru',
    workType: 'Other',
    otherWorkTypeDetail: 'Visiting Cards Press',
    category: 'Visiting Card',
    amount: 1200,
    totalAmount: 1200,
    amountGot: 1200,
    amountToGet: 0,
    paymentStatus: 'Paid',
    paymentRecords: [
      {
        id: 'pr-lw5-1',
        amount: 1200,
        date: '2026-09-09',
        method: 'UPI',
        note: 'UPI settlement',
      },
    ],
    status: 'Ready',
    priority: 'Normal',
    assignedTo: 'Ahmed',
    date: '2026-09-09',
    receivedDate: '2026-09-09',
    deadlineDate: '2026-09-10',
    deadlineTime: '18:30',
    notes: '400gsm velvet matte laminated business cards with spot UV gloss on logo mark. Ready for dispatch.',
    revisionCount: 1,
    attachments: [
      {
        id: 'att-6',
        name: 'Visiting_Card_PrintReady_CMYK.pdf',
        type: 'application/pdf',
        size: '3.1 MB',
        category: 'Final design',
        uploadedAt: '2026-09-10',
      },
    ],
    history: [
      {
        id: 'hist-lw5-1',
        timestamp: '09 Sep 2026 · 01:10 PM',
        action: 'Work order created',
      },
      {
        id: 'hist-lw5-2',
        timestamp: '10 Sep 2026 · 10:00 AM',
        action: 'Status changed to Ready',
        note: 'Spot UV printing inspected and approved',
      },
    ],
  },
  {
    id: 'lw-6',
    workId: 'LW-0006',
    title: 'Malabar Food Fest Tri-Fold Menu Booklet',
    clientId: 'client-6',
    clientName: 'Malabar Heritage Foods',
    clientPhone: '+91 98950 12345',
    clientWhatsApp: '919895012345',
    clientOrg: 'Malabar Heritage Hospitality',
    clientLocation: 'Calicut Beach Road, Kozhikode',
    workType: 'Poster',
    category: 'Flyer',
    amount: 3500,
    totalAmount: 3500,
    amountGot: 0,
    amountToGet: 3500,
    paymentStatus: 'Not Paid',
    paymentRecords: [],
    status: 'New',
    priority: 'Urgent',
    assignedTo: 'Fayis Designer',
    date: '2026-09-10',
    receivedDate: '2026-09-10',
    deadlineDate: '2026-09-10',
    deadlineTime: '15:00',
    notes: 'A4 tri-fold laminated food festival menu. Needs rustic wood texture background and clean Arabic/English price list.',
    revisionCount: 0,
    attachments: [],
    history: [
      {
        id: 'hist-lw6-1',
        timestamp: '10 Sep 2026 · 09:00 AM',
        action: 'Work order created via WhatsApp brief',
      },
    ],
  },
  {
    id: 'lw-7',
    workId: 'LW-0007',
    title: 'Kerala Monsoon Travel Reel Cover & Carousel',
    clientId: 'client-7',
    clientName: 'Wayanad Eco Retreat',
    clientPhone: '+91 94460 33211',
    clientWhatsApp: '919446033211',
    clientOrg: 'Eco Tourism Ventures',
    clientLocation: 'Meppadi, Wayanad',
    workType: 'Motion',
    category: 'Social Media',
    amount: 1800,
    totalAmount: 1800,
    amountGot: 500,
    amountToGet: 1300,
    paymentStatus: 'Partially Paid',
    paymentRecords: [
      {
        id: 'pr-lw7-1',
        amount: 500,
        date: '2026-09-09',
        method: 'Bank Transfer',
        note: 'Token advance payment',
      },
    ],
    status: 'Assigned',
    priority: 'Normal',
    assignedTo: 'Studio X',
    supportingDesigners: ['Arjun Graphics'],
    date: '2026-09-09',
    receivedDate: '2026-09-09',
    deadlineDate: '2026-09-13',
    deadlineTime: '16:00',
    notes: 'Instagram 1080x1350 5-slide carousel showcasing monsoon misty cottage views and pricing.',
    revisionCount: 0,
    attachments: [],
    history: [
      {
        id: 'hist-lw7-1',
        timestamp: '09 Sep 2026 · 04:00 PM',
        action: 'Work order created',
      },
      {
        id: 'hist-lw7-2',
        timestamp: '10 Sep 2026 · 08:30 AM',
        action: 'Assigned to Studio X (External Partner)',
      },
    ],
  },
  {
    id: 'lw-8',
    workId: 'LW-0008',
    title: 'Apex Brand 3D Kinetic Logo Sting',
    clientId: 'client-2',
    clientName: 'Apex Retail Brands',
    clientPhone: '+91 98860 41235',
    clientWhatsApp: '919886041235',
    clientOrg: 'Apex Retail India Pvt Ltd',
    clientLocation: 'Industrial Zone, Bengaluru',
    workType: 'Motion',
    category: 'Motion',
    amount: 5200,
    totalAmount: 5200,
    amountGot: 5200,
    amountToGet: 0,
    paymentStatus: 'Paid',
    paymentRecords: [
      {
        id: 'pr-lw8-1',
        amount: 5200,
        date: '2026-09-09',
        method: 'Bank Transfer',
        note: 'Full advance transfer',
      },
    ],
    status: 'In Progress',
    priority: 'Urgent',
    assignedTo: 'Anas Motion',
    supportingDesigners: ['Studio X'],
    date: '2026-09-09',
    receivedDate: '2026-09-09',
    deadlineDate: '2026-09-11',
    deadlineTime: '15:00',
    notes: '8-second 4K 60fps logo animation with custom sound design for video podcast opening bumper.',
    revisionCount: 1,
    attachments: [],
    history: [
      {
        id: 'hist-lw8-1',
        timestamp: '09 Sep 2026 · 02:00 PM',
        action: 'Work order created',
      },
      {
        id: 'hist-lw8-2',
        timestamp: '09 Sep 2026 · 03:30 PM',
        action: 'Assigned to Anas Motion (External)',
      },
    ],
  },
];

// Primary Visual Reference Invoice (A00002) + additional invoices
export const initialInvoices: Invoice[] = [
  {
    id: 'inv-a00002',
    invoiceNo: 'A00002',
    invoiceDate: '2026-08-20',
    dueDate: '2026-08-20',
    status: 'Paid',
    billedBy: { ...defaultSettings.businessProfile },
    billedTo: {
      clientName: 'DARUL HASANIYYAH SNEC',
      company: 'Darul Hasaniyyah Educational Council',
      address: 'Campus Road, Vengara',
      city: 'Malappuram',
      state: 'Kerala',
      country: 'India',
      pinCode: '676304',
      phone: '+91 94471 28409',
      email: 'darulhasaniyyah.snec@gmail.com',
      gstin: '32AABTD9841C1Z4',
    },
    supplyInfo: {
      countryOfSupply: 'India',
      placeOfSupply: 'Other Territory (97)',
    },
    items: [
      {
        id: 'item-1',
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
      {
        id: 'item-2',
        description: 'Letter head',
        gstRate: 0,
        quantity: 2,
        rate: 150,
        amount: 300,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 300,
      },
      {
        id: 'item-3',
        description: 'Seal',
        gstRate: 0,
        quantity: 1,
        rate: 200,
        amount: 200,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 200,
      },
    ],
    taxType: 'CGST_SGST',
    subtotal: 4000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    taxTotal: 0,
    grandTotal: 4000,
    receivedAmount: 4000,
    balanceAmount: 0,
    payments: [
      {
        id: 'pay-1',
        date: '2026-08-20',
        amount: 4000,
        method: 'UPI',
        reference: 'UPI/98458790172/294018',
        note: 'Full payment received via UPI',
      },
    ],
    paymentDetails: { ...defaultSettings.paymentConfig },
    projectId: 'proj-1',
    projectTitle: 'Brand Identity — Darul Hasaniyyah SNEC',
    localWorkId: 'lw-2',
    localWorkTitle: 'Institutional Seal & Letterhead Press',
    notes: 'Thank you for partnering with GIZMO DESIGN!',
    footerNote: 'This is an electronically generated document, no signature is required.',
    history: [
      {
        id: 'hist-1',
        timestamp: '2026-08-20 · 10:20 AM',
        action: 'Invoice created',
      },
      {
        id: 'hist-2',
        timestamp: '2026-08-20 · 10:25 AM',
        action: 'Invoice generated',
      },
      {
        id: 'hist-3',
        timestamp: '2026-08-20 · 11:10 AM',
        action: 'Payment received ₹4,000',
        note: 'Via UPI 9845879017-2@ybl',
      },
      {
        id: 'hist-4',
        timestamp: '2026-08-20 · 11:10 AM',
        action: 'Marked Paid',
      },
    ],
    createdAt: '2026-08-20T10:20:00Z',
    updatedAt: '2026-08-20T11:10:00Z',
  },
  {
    id: 'inv-a00001',
    invoiceNo: 'A00001',
    invoiceDate: '2026-08-10',
    dueDate: '2026-08-25',
    status: 'Paid',
    billedBy: { ...defaultSettings.businessProfile },
    billedTo: {
      clientName: 'Apex Retail Brands',
      company: 'Apex Retail India Pvt Ltd',
      address: 'Plot 42, Industrial Zone',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pinCode: '560068',
      phone: '+91 98860 41235',
      email: 'accounts@apexretail.in',
      gstin: '29AAACA8872L1ZX',
    },
    supplyInfo: {
      countryOfSupply: 'India',
      placeOfSupply: 'Karnataka (29)',
    },
    items: [
      {
        id: 'item-101',
        description: 'Brand Identity Design Phase 1',
        gstRate: 18,
        quantity: 1,
        rate: 15000,
        amount: 15000,
        cgst: 1350,
        sgst: 1350,
        igst: 0,
        total: 17700,
      },
    ],
    taxType: 'CGST_SGST',
    subtotal: 15000,
    cgstTotal: 1350,
    sgstTotal: 1350,
    igstTotal: 0,
    taxTotal: 2700,
    grandTotal: 17700,
    receivedAmount: 17700,
    balanceAmount: 0,
    payments: [
      {
        id: 'pay-2',
        date: '2026-08-14',
        amount: 17700,
        method: 'Bank Transfer',
        reference: 'NEFT/HDFC/0019284',
        note: 'Paid via Corporate Banking',
      },
    ],
    paymentDetails: { ...defaultSettings.paymentConfig },
    projectId: 'proj-2',
    projectTitle: 'Brand Identity — ABC Company',
    history: [
      {
        id: 'hist-101',
        timestamp: '2026-08-10 · 09:15 AM',
        action: 'Invoice created',
      },
      {
        id: 'hist-102',
        timestamp: '2026-08-14 · 03:30 PM',
        action: 'Payment received ₹17,700',
      },
      {
        id: 'hist-103',
        timestamp: '2026-08-14 · 03:35 PM',
        action: 'Marked Paid',
      },
    ],
    createdAt: '2026-08-10T09:15:00Z',
    updatedAt: '2026-08-14T15:35:00Z',
  },
  {
    id: 'inv-a00003',
    invoiceNo: 'A00003',
    invoiceDate: '2026-08-25',
    dueDate: '2026-09-10',
    status: 'Partially Paid',
    billedBy: { ...defaultSettings.businessProfile },
    billedTo: {
      clientName: 'Lumin Studio',
      company: 'Lumin Media & Architecture',
      address: '7th Cross, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pinCode: '560034',
      phone: '+91 97410 98512',
      email: 'hello@luminstudio.co',
    },
    supplyInfo: {
      countryOfSupply: 'India',
      placeOfSupply: 'Karnataka (29)',
    },
    items: [
      {
        id: 'item-201',
        description: 'Web Architecture & UI Prototyping',
        gstRate: 0,
        quantity: 1,
        rate: 20000,
        amount: 20000,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 20000,
      },
      {
        id: 'item-202',
        description: 'CMS Design & Custom Asset Library',
        gstRate: 0,
        quantity: 1,
        rate: 12000,
        amount: 12000,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 12000,
      },
    ],
    taxType: 'CGST_SGST',
    subtotal: 32000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    taxTotal: 0,
    grandTotal: 32000,
    receivedAmount: 20000,
    balanceAmount: 12000,
    payments: [
      {
        id: 'pay-3',
        date: '2026-08-28',
        amount: 20000,
        method: 'UPI',
        reference: 'UPI/9741098512/882103',
        note: 'Advance payment of 62.5%',
      },
    ],
    paymentDetails: { ...defaultSettings.paymentConfig },
    projectId: 'proj-3',
    projectTitle: 'Lumin Studio Web Platform',
    history: [
      {
        id: 'hist-201',
        timestamp: '2026-08-25 · 11:00 AM',
        action: 'Invoice created',
      },
      {
        id: 'hist-202',
        timestamp: '2026-08-28 · 02:15 PM',
        action: 'Payment received ₹20,000',
        note: 'Balance remaining ₹12,000',
      },
    ],
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-08-28T14:15:00Z',
  },
  {
    id: 'inv-a00004',
    invoiceNo: 'A00004',
    invoiceDate: '2026-08-15',
    dueDate: '2026-08-22',
    status: 'Overdue',
    billedBy: { ...defaultSettings.businessProfile },
    billedTo: {
      clientName: 'Eid Celebration Committee',
      company: 'Community Cultural Wing',
      address: 'Town Hall Road',
      city: 'Kozhikode',
      state: 'Kerala',
      country: 'India',
      pinCode: '673001',
      phone: '+91 98460 32189',
      email: 'eidcommittee@culture.org',
    },
    supplyInfo: {
      countryOfSupply: 'India',
      placeOfSupply: 'Other Territory (97)',
    },
    items: [
      {
        id: 'item-301',
        description: 'Eid Poster Design (High-Res Vector)',
        gstRate: 0,
        quantity: 1,
        rate: 2500,
        amount: 2500,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 2500,
      },
    ],
    taxType: 'CGST_SGST',
    subtotal: 2500,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    taxTotal: 0,
    grandTotal: 2500,
    receivedAmount: 0,
    balanceAmount: 2500,
    payments: [],
    paymentDetails: { ...defaultSettings.paymentConfig },
    localWorkId: 'lw-1',
    localWorkTitle: 'Eid Poster Design',
    history: [
      {
        id: 'hist-301',
        timestamp: '2026-08-15 · 04:00 PM',
        action: 'Invoice created',
      },
      {
        id: 'hist-302',
        timestamp: '2026-08-16 · 10:00 AM',
        action: 'Sent via WhatsApp',
      },
    ],
    createdAt: '2026-08-15T16:00:00Z',
    updatedAt: '2026-08-16T10:00:00Z',
  },
  {
    id: 'inv-a00005',
    invoiceNo: 'A00005',
    invoiceDate: '2026-09-02',
    dueDate: '2026-09-16',
    status: 'Draft',
    billedBy: { ...defaultSettings.businessProfile },
    billedTo: {
      clientName: 'Craft & Co Boutique',
      company: 'Craft & Co Lifestyle',
      address: 'Heritage Mall, Level 2',
      city: 'Mangaluru',
      state: 'Karnataka',
      country: 'India',
      pinCode: '575001',
      phone: '+91 98450 77123',
      email: 'craftco.store@gmail.com',
    },
    supplyInfo: {
      countryOfSupply: 'India',
      placeOfSupply: 'Karnataka (29)',
    },
    items: [
      {
        id: 'item-401',
        description: 'Autumn Promotional Banners & Flyers',
        gstRate: 18,
        quantity: 2,
        rate: 2800,
        amount: 5600,
        cgst: 504,
        sgst: 504,
        igst: 0,
        total: 6608,
      },
    ],
    taxType: 'CGST_SGST',
    subtotal: 5600,
    cgstTotal: 504,
    sgstTotal: 504,
    igstTotal: 0,
    taxTotal: 1008,
    grandTotal: 6608,
    receivedAmount: 0,
    balanceAmount: 6608,
    payments: [],
    paymentDetails: { ...defaultSettings.paymentConfig },
    localWorkId: 'lw-3',
    localWorkTitle: 'Craft & Co Autumn Sale Banner',
    history: [
      {
        id: 'hist-401',
        timestamp: '2026-09-02 · 01:15 PM',
        action: 'Draft created',
      },
    ],
    createdAt: '2026-09-02T13:15:00Z',
    updatedAt: '2026-09-02T13:15:00Z',
  },
];

export const initialDeadlines: DeadlineItem[] = [
  {
    id: 'dl-1',
    title: 'Order #GZ-1024',
    type: 'order',
    referenceId: 'lw-3',
    clientName: 'Apex Retail Brands',
    deadlineDate: '2026-09-09',
    deadlineTime: '16:30',
    priority: 'Urgent',
    status: 'In Progress',
    description: 'Promotional vinyl signage banner and window graphics.',
    assignedTo: 'Gizmo Print Studio',
    isCompleted: false,
  },
  {
    id: 'dl-2',
    title: 'Order #GZ-1028 — Official Seal & Stationery',
    type: 'order',
    referenceId: 'lw-2',
    clientName: 'DARUL HASANIYYAH SNEC',
    deadlineDate: '2026-09-10',
    deadlineTime: '14:30',
    priority: 'Urgent',
    status: 'In Progress',
    description: '250gsm parchment printing & wooden seal stamp pressing.',
    assignedTo: 'Production Lead',
    isCompleted: false,
  },
  {
    id: 'dl-3',
    title: 'Client Project — Brand Identity',
    type: 'project',
    referenceId: 'proj-1',
    clientName: 'DARUL HASANIYYAH SNEC',
    deadlineDate: '2026-09-11',
    deadlineTime: '11:00',
    priority: 'Normal',
    status: 'In Progress',
    description: 'Master vector logo suite, typography guidelines, and letterhead artwork.',
    assignedTo: 'Lead Designer',
    isCompleted: false,
  },
  {
    id: 'dl-4',
    title: 'Lumin Studio Web Platform — CMS Delivery',
    type: 'project',
    referenceId: 'proj-3',
    clientName: 'Lumin Studio',
    deadlineDate: '2026-09-12',
    deadlineTime: '16:00',
    priority: 'Normal',
    status: 'In Progress',
    description: 'Interactive architectural showcase & project filter module.',
    assignedTo: 'Web Architect',
    isCompleted: false,
  },
  {
    id: 'dl-5',
    title: 'Invoice Settlement #A00003 — Apex Retail',
    type: 'invoice',
    referenceId: 'inv-a00003',
    clientName: 'Apex Retail Brands',
    deadlineDate: '2026-09-13',
    deadlineTime: '17:00',
    priority: 'Normal',
    status: 'Pending',
    description: 'Phase 1 corporate identity balance payment settlement.',
    assignedTo: 'Finance Ops',
    isCompleted: false,
  },
  {
    id: 'dl-6',
    title: 'Craft & Co Autumn Sale Banner Delivery',
    type: 'local-work',
    referenceId: 'lw-3',
    clientName: 'Craft & Co Boutique',
    deadlineDate: '2026-09-15',
    deadlineTime: '15:30',
    priority: 'Normal',
    status: 'Pending',
    description: '10x4 ft storefront exterior banner print & eyelet installation.',
    assignedTo: 'Field Operations',
    isCompleted: false,
  },
];

// Helper functions for persistent storage
const STORAGE_KEYS = {
  INVOICES: 'gizmo_portal_invoices_v1',
  SETTINGS: 'gizmo_portal_settings_v1',
  CLIENTS: 'gizmo_portal_clients_v1',
  PROJECTS: 'gizmo_portal_projects_v1',
  LOCAL_WORKS: 'gizmo_portal_local_works_v3',
  DEADLINES: 'gizmo_portal_deadlines_v1',
  CATEGORIES: 'gizmo_portal_categories_v1',
  DESIGN_CATEGORIES: 'gizmo_portal_design_categories_v2',
  DESIGNERS: 'gizmo_portal_designers_v1',
  WORK_TYPES: 'gizmo_portal_work_types_v1',
  SMART_DEFAULTS: 'gizmo_portal_smart_defaults_v1',
  NOTES: 'gizmo_portal_notes_v1',
  NOTE_CATEGORIES: 'gizmo_portal_note_categories_v1',
};

export function loadWorkTypes(): WorkTypeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORK_TYPES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading work types from localStorage', e);
  }
  return initialWorkTypes;
}

export function saveWorkTypes(workTypes: WorkTypeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORK_TYPES, JSON.stringify(workTypes));
  } catch (e) {
    console.warn('Error saving work types', e);
  }
}

export function loadDesignCategories(): DesignCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DESIGN_CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading design categories from localStorage', e);
  }
  return initialDesignCategories;
}

export function saveDesignCategories(categories: DesignCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DESIGN_CATEGORIES, JSON.stringify(categories));
    // Also sync string list for backward compatibility
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories.map((c) => c.name)));
  } catch (e) {
    console.warn('Error saving design categories', e);
  }
}

export function loadDesigners(): CustomDesigner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DESIGNERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading designers from localStorage', e);
  }
  return initialDesigners;
}

export function saveDesigners(designers: CustomDesigner[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DESIGNERS, JSON.stringify(designers));
  } catch (e) {
    console.warn('Error saving designers', e);
  }
}

export interface SmartDefaults {
  lastWorkType?: string;
  lastCategory?: string;
  defaultDesigner?: string;
}

export function loadSmartDefaults(): SmartDefaults {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SMART_DEFAULTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading smart defaults from localStorage', e);
  }
  return {
    lastWorkType: 'Poster',
    lastCategory: 'Poster',
    defaultDesigner: undefined,
  };
}

export function saveSmartDefaults(defaults: SmartDefaults): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SMART_DEFAULTS, JSON.stringify(defaults));
  } catch (e) {
    console.warn('Error saving smart defaults', e);
  }
}

export function loadCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading categories from localStorage', e);
  }
  return initialWorkCategories;
}

export function saveCategories(categories: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.warn('Error saving categories', e);
  }
}

export function loadInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading invoices from localStorage', e);
  }
  return initialInvoices;
}

export function saveInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.warn('Error saving invoices', e);
  }
}

export function loadSettings(): InvoiceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading settings from localStorage', e);
  }
  return defaultSettings;
}

export function saveSettings(settings: InvoiceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving settings', e);
  }
}

export function loadClients(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading clients from localStorage', e);
  }
  return initialClients;
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.warn('Error saving clients', e);
  }
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p, idx) => normalizeProject(p, idx));
      }
    }
  } catch (e) {
    console.warn('Error reading projects from localStorage', e);
  }
  return initialProjects.map((p, idx) => normalizeProject(p, idx));
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.warn('Error saving projects', e);
  }
}

export function loadLocalWorks(): LocalWork[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_WORKS);
    if (raw) {
      const parsed: LocalWork[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((w) => {
          const total = Number(w.totalAmount ?? w.amount ?? 0);
          let got = w.amountGot;
          if (got === undefined || got === null) {
            got = w.paymentStatus === 'Paid' ? total : w.paymentStatus === 'Partially Paid' ? Math.round(total / 2) : 0;
          }
          const numGot = Number(got) || 0;
          const toGet = Math.max(0, total - numGot);
          let status: any = w.paymentStatus;
          if (!status || status === 'Pending') {
            status = numGot >= total && total > 0 ? 'Paid' : numGot > 0 ? 'Partially Paid' : 'Not Paid';
          }
          return {
            ...w,
            totalAmount: total,
            amount: total,
            amountGot: numGot,
            amountToGet: toGet,
            paymentStatus: status,
            paymentRecords: w.paymentRecords || (numGot > 0 ? [{ id: `pr-init-${w.id}`, amount: numGot, date: w.date || '2026-09-08', method: 'UPI', note: 'Initial payment' }] : []),
          };
        });
      }
    }
  } catch (e) {
    console.warn('Error reading local works from localStorage', e);
  }
  return initialLocalWorks;
}

export function saveLocalWorks(works: LocalWork[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCAL_WORKS, JSON.stringify(works));
  } catch (e) {
    console.warn('Error saving local works', e);
  }
}

export function loadDeadlines(): DeadlineItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEADLINES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading deadlines from localStorage', e);
  }
  return initialDeadlines;
}

export function saveDeadlines(deadlines: DeadlineItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
  } catch (e) {
    console.warn('Error saving deadlines', e);
  }
}

export const initialNoteCategories: string[] = [
  'Personal',
  'Project',
  'Client',
  'Ideas',
  'Reminder',
  'Other',
];

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Client Branding Standards & Color Palette',
    content: 'Primary Brand Color: #FF5738 (Gizmo Coral Red).\nSecondary Neutral: #09090B (Obsidian Black).\nAlways request vector logo (.AI or .SVG) from clients before starting printing or motion deliverables.',
    isPinned: true,
    color: 'warm',
    category: 'Client',
    clientId: 'c1',
    clientName: 'Darul Hasaniyyah',
    createdAt: '2026-09-08 10:00 AM',
    updatedAt: '2026-09-11 09:30 AM',
  },
  {
    id: 'note-2',
    title: 'Pre-Print Production Checklist',
    content: 'Essential quality assurance steps before sending flex/banner files to wide-format printers.',
    isChecklist: true,
    checklistItems: [
      { id: 'c1', text: 'Convert all text layers to outlines / curves', completed: true },
      { id: 'c2', text: 'Verify CMYK color mode (not RGB)', completed: true },
      { id: 'c3', text: 'Check resolution is at least 300 DPI at full scale', completed: true },
      { id: 'c4', text: 'Add 1-inch bleed margin on all edges', completed: false },
      { id: 'c5', text: 'Confirm eyelet spacing with print shop operator', completed: false },
    ],
    isPinned: true,
    color: 'accent',
    category: 'Project',
    projectId: 'p1',
    projectTitle: 'Brand Identity — Darul Hasaniyyah',
    createdAt: '2026-09-09 02:00 PM',
    updatedAt: '2026-09-10 04:15 PM',
  },
  {
    id: 'note-3',
    title: 'Client Requested 3 Logo Revisions',
    content: 'Client requested minor adjustments on the typography thickness and tagline alignment. Designer assigned: Ahmed. Priority revision required for social media handles.',
    isPinned: false,
    color: 'default',
    category: 'Client',
    clientId: 'c1',
    clientName: 'Darul Hasaniyyah',
    projectId: 'p1',
    projectTitle: 'Brand Identity — Darul Hasaniyyah',
    createdAt: '2026-09-09 11:20 AM',
    updatedAt: '2026-09-09 02:20 PM',
  },
  {
    id: 'note-4',
    title: 'Flex Printing Machine Maintenance Schedule',
    content: 'Scheduled head cleaning and alignment for Roland TrueVIS VG3 printer. Replace magenta ink cartridge and check media feed sensor calibration.',
    isPinned: false,
    color: 'soft',
    category: 'Reminder',
    reminderDate: '2026-09-12',
    reminderTime: '10:00',
    createdAt: '2026-09-08 11:00 AM',
    updatedAt: '2026-09-08 11:00 AM',
  },
];

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading notes from localStorage', e);
  }
  return initialNotes;
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.warn('Error saving notes', e);
  }
}

export function loadNoteCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTE_CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading note categories from localStorage', e);
  }
  return initialNoteCategories;
}

export function saveNoteCategories(categories: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTE_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.warn('Error saving note categories', e);
  }
}


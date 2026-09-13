/**
 * GIZMO PUBLIC SITE CMS & OFFERS SERVICE
 * 
 * Manages live published content, draft revisions, services, showcase work,
 * promotional offers with automatic date windows, and media vault items.
 * 
 * Guarantees:
 * - 100% Non-destructive: Does not alter existing projects, invoices, or clients.
 * - Dual persistence: safeStorage (localStorage fallback) + background Firestore sync.
 * - Draft -> Preview -> Publish workflow.
 */

import {
  PublicSiteContentData,
  PublicSiteService,
  PublicSiteWorkItem,
  PublicSiteTeamMember,
  PublicSiteOffer,
  PublicSiteMediaItem,
  PublicSiteMeta,
  PublicSiteOfferDisplayLocation,
  PublicSiteOfferStatus,
} from '../types';
import {
  PORTAL_STORAGE_KEYS,
  safeLoadItem as safeGetItem,
  safeSaveItem as safeSetItem,
} from './safeStorage';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const initialPublicSiteContent: PublicSiteContentData = {
  header: {
    brandName: 'GIZMO',
    brandSubtitle: 'DESIGN',
    studioSubtitle: 'DESIGN & PRODUCTION STUDIO',
    showNotificationsBadge: true,
    whatsappNumber: '+919845879017',
    whatsappText: 'WhatsApp',
    directorCrmText: 'Director CRM',
    startProjectText: 'Start a Project',
    customLinks: [
      { id: 'link-services', label: 'Services', route: 'services', isVisible: true },
      { id: 'link-work', label: 'Work', route: 'work', isVisible: true },
      { id: 'link-about', label: 'About', route: 'about', isVisible: true },
      { id: 'link-my-projects', label: 'My Projects', route: 'my-projects', isVisible: true },
    ],
  },
  hero: {
    badgeText: 'Gizmo Design Creative Studio & Production Facility',
    headlineLine1: 'Precision Design,',
    headlineHighlight: 'Motion Graphics & Flex Production.',
    description:
      'We craft striking brand identities, kinetic social motion campaigns, and print-ready large format flex production for forward-thinking businesses.',
    primaryCtaText: 'Start a Project',
    primaryCtaAction: 'start_project',
    secondaryCtaText: 'Explore Selected Work',
    secondaryCtaAction: 'work',
    tertiaryCtaText: 'Client Portal',
    showClientPortalButton: true,
  },
  stats: [
    {
      id: 'stat-1',
      value: '450+',
      label: 'Creative Works Delivered',
      isHighlighted: false,
      orderIndex: 1,
      isVisible: true,
    },
    {
      id: 'stat-2',
      value: '24–48h',
      label: 'Turnaround on Posters',
      isHighlighted: true,
      orderIndex: 2,
      isVisible: true,
    },
    {
      id: 'stat-3',
      value: '100%',
      label: 'In-House Flex Facility',
      isHighlighted: false,
      orderIndex: 3,
      isVisible: true,
    },
    {
      id: 'stat-4',
      value: '99.4%',
      label: 'On-Time Client Satisfaction',
      isHighlighted: false,
      orderIndex: 4,
      isVisible: true,
    },
  ],
  workflow: [
    {
      id: 'step-1',
      stepNumber: '01',
      title: 'Brief & Scope Definition',
      description: 'Submit your requirement or project request. We align deliverables, timeline, and exact specs.',
      badge: 'Immediate Review',
      orderIndex: 1,
      isVisible: true,
    },
    {
      id: 'step-2',
      stepNumber: '02',
      title: 'Design Exploration',
      description: 'Senior designers craft targeted visual directions, typography hierarchy, and motion concepts.',
      badge: 'Rapid Drafts',
      orderIndex: 2,
      isVisible: true,
    },
    {
      id: 'step-3',
      stepNumber: '03',
      title: 'Collaborative Revisions',
      description: 'Review drafts in your client portal or direct WhatsApp. Refine details until 100% approved.',
      badge: 'Direct Feedback',
      orderIndex: 3,
      isVisible: true,
    },
    {
      id: 'step-4',
      stepNumber: '04',
      title: 'Master Delivery & Print',
      description: 'Receive production vector masters, 60 FPS video files, or in-house dispatched flex prints.',
      badge: 'Ready to Deploy',
      orderIndex: 4,
      isVisible: true,
    },
  ],
  about: {
    badgeText: 'ABOUT GIZMO STUDIO',
    headline: 'Creative Vision Backed By In-House Manufacturing Infrastructure.',
    storyP1:
      'Gizmo Design operates at the intersection of creative brand design and industrial production execution. Based in Kerala, we eliminate third-party print delays and quality mismatches by maintaining our own solvent flex presses, UV finishing facilities, and dedicated motion workstations.',
    storyP2:
      'Whether you are commissioning a high-impact highway hoarding, a dynamic 3D promotional reel, or an entire institutional visual identity manual, our team delivers with surgical precision, transparent pricing, and predictable timelines.',
    missionStatement:
      'To empower brands, institutions, and entrepreneurs with striking visual standards and reliable production without creative friction.',
    locationText: 'Kerala, India · Operating Nationwide',
    experienceYears: '8+ Years of In-House Production',
  },
  cta: {
    headline: 'Ready to create something remarkable with Gizmo Design?',
    description: 'Direct communication with senior designers. Rapid delivery times. Transparent billing.',
    primaryCtaText: 'Start a Project',
    whatsappCtaText: 'WhatsApp Consultation',
    whatsappNumber: '+919845879017',
  },
  footer: {
    companyName: 'GIZMO DESIGN',
    tagline: 'Creative Studio & Flex Works',
    description:
      'Premier creative studio in Kerala specializing in brand identity systems, 3D motion graphics, UI/UX, and in-house large-format flex printing manufacturing.',
    phone: '+91 98458 79017',
    email: 'gizmo.hub.in@gmail.com',
    address: 'Kerala, India',
    gstin: '32AABCG1234F1Z5',
    copyrightText: '© 2026 Gizmo Design & Flex Works. All rights reserved.',
    capabilities: [
      'Brand Identity & Logomarks',
      'In-House Flex & Hoarding Printing',
      'Motion Graphics & 3D Launch Reels',
      'Packaging Dielines & Foil Stamping',
      'Backlit Star Flex Signages',
      'Digital Web & UI/UX Systems',
    ],
  },
  general: {
    primaryColor: '#EE1D45',
    contactEmail: 'gizmo.hub.in@gmail.com',
    contactPhone: '+91 98458 79017',
    whatsappNumber: '+919845879017',
    businessAddress: 'Gizmo Design Studio, Kerala, India',
  },
};

export const initialPublicSiteServices: PublicSiteService[] = [
  {
    id: 'srv-brand-identity',
    title: 'Brand & Visual Identity',
    category: 'Brand Systems',
    iconName: 'Palette',
    turnaround: '3–5 Days Average',
    desc: 'Complete identity systems, vector logomarks, typography rules, color formulas, and stationery suites designed for lasting distinction.',
    deliverables: [
      'Vector Master Formats (AI, EPS, SVG, PDF)',
      'Comprehensive Brand Guidelines Manual',
      'Color Hierarchy (Pantone, CMYK, RGB, HEX)',
      'Corporate Stationery Suite & Business Cards',
      'Social Media Profile & Cover Templates',
    ],
    bestFor: 'Startups, corporate rebrands, institutional identities & retail product lines.',
    serviceKey: 'Brand Identity',
    startingPrice: 4999,
    orderIndex: 1,
    isVisible: true,
    isFeatured: true,
  },
  {
    id: 'srv-motion-graphics',
    title: 'Motion & Video Graphics',
    category: 'Motion & 3D',
    iconName: 'Video',
    turnaround: '48–72 Hours Average',
    desc: 'High-octane 3D animated logo stings, 60 FPS kinetic typography reels, product launch teasers, and broadcast-quality social campaigns.',
    deliverables: [
      '60 FPS Ultra-HD 4K & 1080p Master Files',
      '9:16 Vertical Instagram Reels & TikTok Formats',
      'Synchronized Sound Effects & Audio Mastering',
      'Alpha Channel Transparent Overlay Assets',
      'Storyboard & Visual Narrative Progression',
    ],
    bestFor: 'Product launches, event promotions, Instagram viral reels & brand announcements.',
    serviceKey: 'Motion Graphics',
    startingPrice: 2999,
    orderIndex: 2,
    isVisible: true,
    isFeatured: true,
  },
  {
    id: 'srv-flex-print',
    title: 'Flex & Large-Format Production',
    category: 'In-House Print Facility',
    iconName: 'Printer',
    turnaround: 'Same Day / 24h Rush Available',
    desc: 'Large format outdoor hoardings, backlit signboards, exhibition roll-ups, and commercial event prints manufactured on our in-house solvent presses.',
    deliverables: [
      'Direct Output from In-House Mimaki Presses',
      'Star Flex & Heavy GSM Backlit Media',
      'UV Protective Weather-Shield Coating',
      'Reinforced Grommets & Mounting Margins',
      'Expedited Kerala-wide Logistics & Delivery',
    ],
    bestFor: 'Highway hoardings, retail shopfronts, political/cultural conventions & outdoor ads.',
    serviceKey: 'Large Format Flex Print',
    startingPrice: 1499,
    orderIndex: 3,
    isVisible: true,
    isFeatured: true,
  },
  {
    id: 'srv-digital-ui',
    title: 'Digital & Product UI',
    category: 'Digital Architecture',
    iconName: 'Globe',
    turnaround: '1–2 Weeks Average',
    desc: 'Modern conversion-optimized landing interfaces, interactive client dashboards, and responsive web systems with clean aesthetics.',
    deliverables: [
      'Responsive Figma Design System & Tokens',
      'Clickable Interactive Prototypes',
      'Production-Ready Component Specs',
      'Mobile-First Touch Optimized Viewports',
      'High-Resolution SVG Web Graphics',
    ],
    bestFor: 'SaaS platforms, web agencies, modern portfolio sites & digital startups.',
    serviceKey: 'Website & Digital',
    startingPrice: 7999,
    orderIndex: 4,
    isVisible: true,
    isFeatured: true,
  },
  {
    id: 'srv-packaging',
    title: 'Packaging & Print Collaterals',
    category: 'Print & Packaging',
    iconName: 'Layers',
    turnaround: '3–5 Days',
    desc: 'Custom die-line creation, rigid gift boxes, foil-stamped labels, and premium offset retail brochures.',
    deliverables: [
      'Accurate Vector Dielines with Bleeds',
      'Spot UV & Foil Stamping Separations',
      '3D Photorealistic Box Mockups',
      'Print-Ready PDF Master Handover',
    ],
    bestFor: 'FMCG goods, cosmetics, jewelry, and luxury gifting brands.',
    serviceKey: 'Brand Identity',
    startingPrice: 3499,
    orderIndex: 5,
    isVisible: true,
    isFeatured: false,
  },
];

export const initialPublicSiteWorkItems: PublicSiteWorkItem[] = [
  {
    id: 'w-1',
    title: 'Darul Hasaniyyah SNEC Visual Identity',
    category: 'Brand & Identity',
    clientName: 'Darul Hasaniyyah Islamic Academy',
    year: '2026',
    desc: 'Comprehensive institutional brand identity system including bilingual Arabic/English typography rules, publication standards, ceremonial stationery, and campus signage guidelines.',
    tags: ['Identity', 'Logo System', 'Stationery', 'Guidelines', 'Bilingual'],
    gradientFrom: '#18181b',
    gradientTo: '#09090b',
    serviceKey: 'Brand Identity',
    badgeText: 'Institutional Visual Identity',
    orderIndex: 1,
    isVisible: true,
    isFeatured: true,
  },
  {
    id: 'w-2',
    title: 'Apex Prime Commercial Hoarding',
    category: 'Large Format Flex & Print',
    clientName: 'Apex Commercial Infrastructure',
    year: '2026',
    desc: 'Massive 50x20 ft high-definition backlit roadside flex hoarding print with weather-shield UV lamination produced in-house on solvent presses.',
    tags: ['Flex Print', 'Outdoor', 'Hoarding', 'Large Format', 'Solvent RIP'],
    gradientFrom: '#0f172a',
    gradientTo: '#18181b',
    serviceKey: 'Large Format Flex Print',
    badgeText: 'Highway Grand Hoarding',
    orderIndex: 2,
    isVisible: true,
    isFeatured: true,
  },
  {
    id: 'w-3',
    title: '3D Kinetic Launch Teaser Reel',
    category: 'Motion & Video',
    clientName: 'TechNova Global',
    year: '2026',
    desc: '60 FPS 3D logo reveal and kinetic Instagram promotional reel campaign garnering 150k+ views across digital channels.',
    tags: ['Motion Graphics', 'Reel', '3D Animation', 'Social', 'Kinetic'],
    gradientFrom: '#1c1917',
    gradientTo: '#18181b',
    serviceKey: 'Motion Graphics',
    badgeText: '3D Kinetic Launch Teaser',
    orderIndex: 3,
    isVisible: true,
    isFeatured: true,
  },
  {
    id: 'w-4',
    title: 'Kerala Design Conclave 2026',
    category: 'Motion & Video',
    clientName: 'Kerala Creative Guild',
    year: '2026',
    desc: 'Event visual package: Animated speaker introduction loops, LED stage backdrop animations, and physical credential badges.',
    tags: ['Motion', 'Event Graphics', 'Stage Backdrop', 'Key Visual'],
    gradientFrom: '#18181b',
    gradientTo: '#27272a',
    serviceKey: 'Motion Graphics',
    badgeText: 'Stage & LED Graphics',
    orderIndex: 4,
    isVisible: true,
    isFeatured: false,
  },
  {
    id: 'w-5',
    title: 'Malabar Heritage Gold Packaging',
    category: 'Brand & Identity',
    clientName: 'Malabar Heritage Jewellers',
    year: '2026',
    desc: 'Luxury gold-foiled rigid gift box packaging, certificate sleeves, and premium offset retail bag printing.',
    tags: ['Packaging', 'Gold Foil', 'Offset Print', 'Rigid Box'],
    gradientFrom: '#292524',
    gradientTo: '#0c0a09',
    serviceKey: 'Brand Identity',
    badgeText: 'Rigid Box & Packaging',
    orderIndex: 5,
    isVisible: true,
    isFeatured: false,
  },
  {
    id: 'w-6',
    title: 'Metro Star Backlit Signboard',
    category: 'Large Format Flex & Print',
    clientName: 'Metro Super Specialty Hospital',
    year: '2026',
    desc: 'High-translucency backlit star flex signboards with uniform LED light transmission and aluminum extrusion framing.',
    tags: ['Backlit Star Flex', 'Signage', 'Architectural', 'Outdoor'],
    gradientFrom: '#18181b',
    gradientTo: '#09090b',
    serviceKey: 'Large Format Flex Print',
    badgeText: 'Star Backlit Flex Signage',
    orderIndex: 6,
    isVisible: true,
    isFeatured: false,
    status: 'published',
  },
];

// Preserved Initial Studio Team Members from AboutView
export const initialPublicSiteTeamMembers: PublicSiteTeamMember[] = [
  {
    id: 'team-1',
    name: 'Muhammed Shamveel',
    role: 'Creative Director',
    bio: 'Leading brand identity, typography systems, and print architecture for commercial entities across South India.',
    avatarUrl: '',
    displayOrder: 1,
    isPublished: true,
    isFeatured: true,
    status: 'published',
    email: 'shamveel@gizmodesign.in',
    phone: '+91 98458 79017',
    whatsapp: '+919845879017',
    portfolioUrl: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'team-2',
    name: 'Salih K.',
    role: 'Motion & 3D Lead',
    bio: 'Specialist in kinetic typography, 3D product stings, and high-impact social media campaign reels.',
    avatarUrl: '',
    displayOrder: 2,
    isPublished: true,
    isFeatured: true,
    status: 'published',
    whatsapp: '+919845879017',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'team-3',
    name: 'Rashid V.',
    role: 'Print & Production Lead',
    bio: 'Master of large-format flex printing, CMYK color management, star flex media, and outdoor mounting durability.',
    avatarUrl: '',
    displayOrder: 3,
    isPublished: true,
    isFeatured: true,
    status: 'published',
    whatsapp: '+919845879017',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'team-4',
    name: 'Fathima N.',
    role: 'Visual Designer',
    bio: 'Crafting logomarks, publication layouts, stationery suites, and digital presentation artboards.',
    avatarUrl: '',
    displayOrder: 4,
    isPublished: true,
    isFeatured: true,
    status: 'published',
    whatsapp: '+919845879017',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// Reference Special Offers & Highlights with automatic date window
export const initialPublicSiteOffers: PublicSiteOffer[] = [
  {
    id: 'offer-launch-poster',
    title: '24h Express Commercial Poster Design',
    shortLabel: 'POPULAR OFFER',
    description:
      'High-impact event, product, or retail social poster designed by senior designers with delivery within 24 hours. Includes print and digital exports.',
    offerPrice: 499,
    originalPrice: 800,
    discount: '38% OFF',
    currency: '₹',
    category: 'Poster Design',
    ctaText: 'Claim Offer',
    ctaAction: 'start_project',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 1,
    displayLocations: ['Home Highlights', 'Dedicated section', 'Services'],
    isActive: true,
    isArchived: false,
    limitedSlotsBadge: 'Only 3 Slots Left Today',
    promoCode: 'GIZMO24H',
    terms: 'Valid for standard single-layout commercial posters with up to 2 revision rounds.',
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'offer-identity-sprint',
    title: 'Startup Brand Identity Package',
    shortLabel: 'FEATURED PACK',
    description:
      'Complete vector logomark, stationery system, typography manual, and social brand pack tailored for fast-growing businesses.',
    offerPrice: 3999,
    originalPrice: 6500,
    discount: '38% OFF',
    currency: '₹',
    category: 'Brand Identity',
    ctaText: 'Start a Project',
    ctaAction: 'start_project',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 2,
    displayLocations: ['Home Hero', 'Home Highlights', 'Services'],
    isActive: true,
    isArchived: false,
    limitedSlotsBadge: 'Priority Queue',
    promoCode: 'BRAND38',
    terms: 'Includes 3 unique visual concepts, master vector exports (AI, EPS, SVG, PDF), and brand color palette.',
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'offer-flex-hoarding',
    title: 'Highway Flex Print & UV Weather-Shield Bundle',
    shortLabel: 'IN-HOUSE PRINT',
    description:
      'High GSM heavy-duty outdoor solvent flex printing with reinforced eyelets and UV anti-fading shield directly from our presses.',
    offerPrice: 1299,
    originalPrice: 1800,
    discount: '28% OFF',
    currency: '₹',
    category: 'Large Format Flex Print',
    ctaText: 'Book Print Order',
    ctaAction: 'whatsapp',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 3,
    displayLocations: ['Home Highlights', 'Work'],
    isActive: true,
    isArchived: false,
    terms: 'Minimum 50 sq.ft order size for promotional pricing. Logistics charged at actuals.',
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialPublicSiteMedia: PublicSiteMediaItem[] = [
  {
    id: 'med-logo-badge',
    title: 'Gizmo Geometric Compass Logo',
    altText: 'Official Gizmo Design Studio Vector Logo',
    url: '/icon.png',
    fileSize: '24 KB',
    category: 'Logos',
    usageLocation: 'Header, Footer, Mobile Drawer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialPublicSiteMeta: PublicSiteMeta = {
  lastPublishedAt: new Date().toISOString(),
  lastPublishedBy: 'Admin (gizmo.hub.in@gmail.com)',
  lastUpdatedAt: new Date().toISOString(),
  lastUpdatedBy: 'Admin',
  hasUnpublishedChanges: false,
  publishedVersion: 1,
};

/* ========================================================================= */
/* CORE LOAD / SAVE / PUBLISH ACCESSORS                                      */
/* ========================================================================= */

export function loadPublishedContent(): PublicSiteContentData {
  return safeGetItem<PublicSiteContentData>(
    PORTAL_STORAGE_KEYS.PUBLIC_SITE_CONTENT,
    initialPublicSiteContent
  );
}

export function savePublishedContent(content: PublicSiteContentData): void {
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_CONTENT, content);
  syncPublishedContentToFirestore(content);
}

export function loadDraftContent(): PublicSiteContentData {
  const draft = safeGetItem<PublicSiteContentData | null>(
    PORTAL_STORAGE_KEYS.PUBLIC_SITE_DRAFT,
    null
  );
  if (draft) return draft;
  // If no draft exists yet, initialize draft as a copy of published
  const published = loadPublishedContent();
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_DRAFT, published);
  return published;
}

export function saveDraftContent(draft: PublicSiteContentData, author = 'Admin'): void {
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_DRAFT, draft);
  const meta = loadPublicSiteMeta();
  meta.hasUnpublishedChanges = true;
  meta.lastUpdatedAt = new Date().toISOString();
  meta.lastUpdatedBy = author;
  savePublicSiteMeta(meta);
}

export function loadPublicSiteServices(): PublicSiteService[] {
  return safeGetItem<PublicSiteService[]>(
    PORTAL_STORAGE_KEYS.PUBLIC_SITE_SERVICES,
    initialPublicSiteServices
  );
}

export function savePublicSiteServices(services: PublicSiteService[]): void {
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_SERVICES, services);
}

export function loadPublicSiteWork(): PublicSiteWorkItem[] {
  return safeGetItem<PublicSiteWorkItem[]>(
    PORTAL_STORAGE_KEYS.PUBLIC_SITE_WORK,
    initialPublicSiteWorkItems
  );
}

export function savePublicSiteWork(workItems: PublicSiteWorkItem[]): void {
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_WORK, workItems);
  syncWorkToFirestore(workItems);
}

export function loadPublicSiteTeamMembers(): PublicSiteTeamMember[] {
  return safeGetItem<PublicSiteTeamMember[]>(
    PORTAL_STORAGE_KEYS.PUBLIC_SITE_TEAM,
    initialPublicSiteTeamMembers
  );
}

export function savePublicSiteTeamMembers(members: PublicSiteTeamMember[]): void {
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_TEAM, members);
  syncTeamToFirestore(members);
}

export function loadPublicSiteOffers(): PublicSiteOffer[] {
  return safeGetItem<PublicSiteOffer[]>(
    PORTAL_STORAGE_KEYS.PUBLIC_SITE_OFFERS,
    initialPublicSiteOffers
  );
}

export function savePublicSiteOffers(offers: PublicSiteOffer[]): void {
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_OFFERS, offers);
}

export function loadPublicSiteMedia(): PublicSiteMediaItem[] {
  return safeGetItem<PublicSiteMediaItem[]>(
    PORTAL_STORAGE_KEYS.PUBLIC_SITE_MEDIA,
    initialPublicSiteMedia
  );
}

export function savePublicSiteMedia(media: PublicSiteMediaItem[]): void {
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_MEDIA, media);
}

export function loadPublicSiteMeta(): PublicSiteMeta {
  return safeGetItem<PublicSiteMeta>(
    PORTAL_STORAGE_KEYS.PUBLIC_SITE_META,
    initialPublicSiteMeta
  );
}

export function savePublicSiteMeta(meta: PublicSiteMeta): void {
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_META, meta);
}

/**
 * Publishes draft changes to the live site.
 */
export function publishDraftChanges(author = 'Admin (gizmo.hub.in@gmail.com)'): {
  success: boolean;
  timestamp: string;
  version: number;
} {
  const draft = loadDraftContent();
  savePublishedContent(draft);

  const meta = loadPublicSiteMeta();
  const timestamp = new Date().toISOString();
  meta.lastPublishedAt = timestamp;
  meta.lastPublishedBy = author;
  meta.lastUpdatedAt = timestamp;
  meta.lastUpdatedBy = author;
  meta.hasUnpublishedChanges = false;
  meta.publishedVersion = (meta.publishedVersion || 1) + 1;

  savePublicSiteMeta(meta);

  return {
    success: true,
    timestamp,
    version: meta.publishedVersion,
  };
}

/**
 * Discards draft changes and resets draft to match current published state.
 */
export function discardDraftChanges(): PublicSiteContentData {
  const published = loadPublishedContent();
  safeSetItem(PORTAL_STORAGE_KEYS.PUBLIC_SITE_DRAFT, published);

  const meta = loadPublicSiteMeta();
  meta.hasUnpublishedChanges = false;
  meta.lastUpdatedAt = new Date().toISOString();
  savePublicSiteMeta(meta);

  return published;
}

/* ========================================================================= */
/* AUTOMATIC DATE CONTROL & COMPUTED OFFER STATUS                            */
/* ========================================================================= */

/**
 * Computes live status based on start & end dates:
 * - If archived: 'Archived'
 * - If not active: 'Draft'
 * - If start date is in the future: 'Scheduled'
 * - If end date has passed: 'Expired'
 * - If today is within [startDate, endDate]: 'Active'
 */
export function getOfferComputedStatus(offer: PublicSiteOffer): PublicSiteOfferStatus {
  if (offer.isArchived) return 'Archived';
  if (!offer.isActive) return 'Draft';

  const todayStr = new Date().toISOString().split('T')[0];

  if (offer.startDate && offer.startDate > todayStr) {
    return 'Scheduled';
  }

  if (offer.endDate && offer.endDate < todayStr) {
    return 'Expired';
  }

  return 'Active';
}

/**
 * Filters offers that are currently ACTIVE and assigned to a given display location.
 */
export function getActiveOffersForLocation(
  location: PublicSiteOfferDisplayLocation,
  allOffers?: PublicSiteOffer[]
): PublicSiteOffer[] {
  const offers = allOffers || loadPublicSiteOffers();
  return offers
    .filter((offer) => {
      const status = getOfferComputedStatus(offer);
      return status === 'Active' && offer.displayLocations.includes(location);
    })
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));
}

/* ========================================================================= */
/* NON-BLOCKING FIRESTORE SYNCHRONIZATION                                     */
/* ========================================================================= */

async function syncPublishedContentToFirestore(content: PublicSiteContentData) {
  try {
    if (!db) return;
    const docRef = doc(db, 'publicSiteContent', 'live');
    await setDoc(docRef, {
      ...content,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    // Non-blocking catch: local persistence remains 100% active
    console.warn('Firestore CMS sync note:', err);
  }
}

export async function pullContentFromFirestore(): Promise<PublicSiteContentData | null> {
  try {
    if (!db) return null;
    const docRef = doc(db, 'publicSiteContent', 'live');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as PublicSiteContentData;
      return data;
    }
  } catch (err) {
    console.warn('Firestore CMS pull note:', err);
  }
  return null;
}

async function syncWorkToFirestore(workItems: PublicSiteWorkItem[]) {
  try {
    if (!db) return;
    const docRef = doc(db, 'publicSiteWork', 'portfolioItems');
    await setDoc(
      docRef,
      {
        items: workItems,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore Work sync note:', err);
  }
}

export async function pullWorkFromFirestore(): Promise<PublicSiteWorkItem[] | null> {
  try {
    if (!db) return null;
    const docRef = doc(db, 'publicSiteWork', 'portfolioItems');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.items)) {
        return data.items as PublicSiteWorkItem[];
      }
    }
  } catch (err) {
    console.warn('Firestore Work pull note:', err);
  }
  return null;
}

async function syncTeamToFirestore(members: PublicSiteTeamMember[]) {
  try {
    if (!db) return;
    const docRef = doc(db, 'publicSiteTeam', 'teamMembers');
    await setDoc(
      docRef,
      {
        members,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore Team sync note:', err);
  }
}

export async function pullTeamFromFirestore(): Promise<PublicSiteTeamMember[] | null> {
  try {
    if (!db) return null;
    const docRef = doc(db, 'publicSiteTeam', 'teamMembers');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.members)) {
        return data.members as PublicSiteTeamMember[];
      }
    }
  } catch (err) {
    console.warn('Firestore Team pull note:', err);
  }
  return null;
}

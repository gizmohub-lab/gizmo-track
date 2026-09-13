import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileText,
  Layers,
  Palette,
  Sparkles,
  Upload,
  Navigation,
  PanelBottom,
  Rocket,
  Check,
  Eye,
  ArrowRight,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  AppRoute,
  Project,
  PublicSiteContentData,
  PublicSiteHeaderConfig,
  PublicSiteFooterConfig,
  PublicSiteService,
  PublicSiteWorkItem,
  PublicSiteTeamMember,
  PublicSiteOffer,
  PublicSiteMediaItem,
  PublicSiteMeta,
} from '../../../types';
import {
  loadPublishedContent,
  loadDraftContent,
  saveDraftContent,
  loadPublicSiteServices,
  savePublicSiteServices,
  loadPublicSiteWork,
  savePublicSiteWork,
  loadPublicSiteTeamMembers,
  savePublicSiteTeamMembers,
  loadPublicSiteOffers,
  savePublicSiteOffers,
  loadPublicSiteMedia,
  savePublicSiteMedia,
  loadPublicSiteMeta,
  savePublicSiteMeta,
  publishDraftChanges,
  discardDraftChanges,
  getOfferComputedStatus,
} from '../../../services/publicSiteCmsService';

import { CMSOverviewTab } from './tabs/CMSOverviewTab';
import { CMSContentTab } from './tabs/CMSContentTab';
import { CMSServicesTab } from './tabs/CMSServicesTab';
import { CMSWorkTab } from './tabs/CMSWorkTab';
import { CMSTeamTab } from './tabs/CMSTeamTab';
import { CMSOffersTab } from './tabs/CMSOffersTab';
import { CMSMediaTab } from './tabs/CMSMediaTab';
import { CMSNavigationTab } from './tabs/CMSNavigationTab';
import { CMSFooterTab } from './tabs/CMSFooterTab';
import { CMSPreviewPublishTab } from './tabs/CMSPreviewPublishTab';

import { OfferEditorModal } from './OfferEditorModal';
import { ServiceEditorModal } from './ServiceEditorModal';
import { WorkItemEditorModal } from './WorkItemEditorModal';
import { TeamMemberEditorModal } from './TeamMemberEditorModal';
import { MediaUploadModal } from './MediaUploadModal';
import { PublishConfirmModal } from './PublishConfirmModal';

interface PublicSiteCMSViewProps {
  onNavigate: (route: AppRoute) => void;
  projects?: Project[];
  onOpenPreviewMode?: (isDraft: boolean) => void;
}

export const PublicSiteCMSView: React.FC<PublicSiteCMSViewProps> = ({
  onNavigate,
  projects = [],
  onOpenPreviewMode,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // State loaded from safe persistence
  const [publishedContent, setPublishedContent] = useState<PublicSiteContentData>(
    loadPublishedContent
  );
  const [draftContent, setDraftContent] = useState<PublicSiteContentData>(
    loadDraftContent
  );
  const [services, setServices] = useState<PublicSiteService[]>(
    loadPublicSiteServices
  );
  const [workItems, setWorkItems] = useState<PublicSiteWorkItem[]>(
    loadPublicSiteWork
  );
  const [teamMembers, setTeamMembers] = useState<PublicSiteTeamMember[]>(
    loadPublicSiteTeamMembers
  );
  const [offers, setOffers] = useState<PublicSiteOffer[]>(loadPublicSiteOffers);
  const [media, setMedia] = useState<PublicSiteMediaItem[]>(loadPublicSiteMedia);
  const [meta, setMeta] = useState<PublicSiteMeta>(loadPublicSiteMeta);

  // Modals state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<PublicSiteOffer | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<PublicSiteService | null>(null);

  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [editingWorkItem, setEditingWorkItem] = useState<PublicSiteWorkItem | null>(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<PublicSiteTeamMember | null>(null);

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Refresh all state from storage on mount
  useEffect(() => {
    setPublishedContent(loadPublishedContent());
    setDraftContent(loadDraftContent());
    setServices(loadPublicSiteServices());
    setWorkItems(loadPublicSiteWork());
    setTeamMembers(loadPublicSiteTeamMembers());
    setOffers(loadPublicSiteOffers());
    setMedia(loadPublicSiteMedia());
    setMeta(loadPublicSiteMeta());
  }, []);

  /* ======================================================================= */
  /* CONTENT HANDLERS                                                        */
  /* ======================================================================= */

  const handleSaveDraftContent = (updated: PublicSiteContentData) => {
    setDraftContent(updated);
    saveDraftContent(updated);
    setMeta(loadPublicSiteMeta());
  };

  const handleSaveHeader = (updatedHeader: PublicSiteHeaderConfig) => {
    const updated = { ...draftContent, header: updatedHeader };
    handleSaveDraftContent(updated);
  };

  const handleSaveFooter = (updatedFooter: PublicSiteFooterConfig) => {
    const updated = { ...draftContent, footer: updatedFooter };
    handleSaveDraftContent(updated);
  };

  /* ======================================================================= */
  /* PUBLISH / ROLLBACK HANDLERS                                             */
  /* ======================================================================= */

  const handlePublish = () => {
    const result = publishDraftChanges();
    setPublishedContent(loadPublishedContent());
    setDraftContent(loadDraftContent());
    setMeta(loadPublicSiteMeta());
  };

  const handleDiscardDraft = () => {
    const reverted = discardDraftChanges();
    setDraftContent(reverted);
    setMeta(loadPublicSiteMeta());
  };

  const handlePreview = () => {
    if (onOpenPreviewMode) {
      onOpenPreviewMode(true);
    } else {
      onNavigate('home');
    }
  };

  /* ======================================================================= */
  /* OFFERS HANDLERS                                                         */
  /* ======================================================================= */

  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setIsOfferModalOpen(true);
  };

  const handleOpenEditOffer = (offer: PublicSiteOffer) => {
    setEditingOffer(offer);
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = (saved: PublicSiteOffer) => {
    setOffers((prev) => {
      const exists = prev.some((o) => o.id === saved.id);
      const next = exists
        ? prev.map((o) => (o.id === saved.id ? saved : o))
        : [saved, ...prev];
      savePublicSiteOffers(next);
      return next;
    });
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffers((prev) => {
      const next = prev.filter((o) => o.id !== offerId);
      savePublicSiteOffers(next);
      return next;
    });
  };

  const handleDuplicateOffer = (offer: PublicSiteOffer) => {
    const duplicated: PublicSiteOffer = {
      ...offer,
      id: `offer-${Date.now()}`,
      title: `${offer.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleSaveOffer(duplicated);
  };

  const handleToggleActiveOffer = (offerId: string) => {
    setOffers((prev) => {
      const next = prev.map((o) =>
        o.id === offerId ? { ...o, isActive: !o.isActive, updatedAt: new Date().toISOString() } : o
      );
      savePublicSiteOffers(next);
      return next;
    });
  };

  const handleExtendDateOffer = (offerId: string) => {
    const newEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setOffers((prev) => {
      const next = prev.map((o) =>
        o.id === offerId ? { ...o, endDate: newEnd, isActive: true, updatedAt: new Date().toISOString() } : o
      );
      savePublicSiteOffers(next);
      return next;
    });
  };

  /* ======================================================================= */
  /* SERVICES HANDLERS                                                       */
  /* ======================================================================= */

  const handleOpenAddService = () => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: PublicSiteService) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (saved: PublicSiteService) => {
    setServices((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      const next = exists
        ? prev.map((s) => (s.id === saved.id ? saved : s))
        : [...prev, saved];
      savePublicSiteServices(next);
      return next;
    });
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => {
      const next = prev.filter((s) => s.id !== serviceId);
      savePublicSiteServices(next);
      return next;
    });
  };

  const handleDuplicateService = (service: PublicSiteService) => {
    const duplicated: PublicSiteService = {
      ...service,
      id: `srv-${Date.now()}`,
      title: `${service.title} (Copy)`,
      orderIndex: services.length + 1,
    };
    handleSaveService(duplicated);
  };

  const handleToggleServiceVisibility = (serviceId: string) => {
    setServices((prev) => {
      const next = prev.map((s) =>
        s.id === serviceId ? { ...s, isVisible: !s.isVisible } : s
      );
      savePublicSiteServices(next);
      return next;
    });
  };

  const handleToggleServiceFeatured = (serviceId: string) => {
    setServices((prev) => {
      const next = prev.map((s) =>
        s.id === serviceId ? { ...s, isFeatured: !s.isFeatured } : s
      );
      savePublicSiteServices(next);
      return next;
    });
  };

  const handleReorderService = (index: number, direction: 'up' | 'down') => {
    setServices((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const item = copy.splice(index, 1)[0];
      copy.splice(targetIndex, 0, item);
      savePublicSiteServices(copy);
      return copy;
    });
  };

  /* ======================================================================= */
  /* WORK HANDLERS                                                           */
  /* ======================================================================= */

  const handleOpenAddWork = () => {
    setEditingWorkItem(null);
    setIsWorkModalOpen(true);
  };

  const handleOpenEditWork = (item: PublicSiteWorkItem) => {
    setEditingWorkItem(item);
    setIsWorkModalOpen(true);
  };

  const handleSaveWork = (saved: PublicSiteWorkItem) => {
    setWorkItems((prev) => {
      const exists = prev.some((w) => w.id === saved.id);
      const next = exists
        ? prev.map((w) => (w.id === saved.id ? saved : w))
        : [...prev, saved];
      savePublicSiteWork(next);
      return next;
    });
  };

  const handleDeleteWork = (workId: string) => {
    setWorkItems((prev) => {
      const next = prev.filter((w) => w.id !== workId);
      savePublicSiteWork(next);
      return next;
    });
  };

  const handleDuplicateWork = (item: PublicSiteWorkItem) => {
    const duplicated: PublicSiteWorkItem = {
      ...item,
      id: `w-${Date.now()}`,
      title: `${item.title} (Copy)`,
      orderIndex: workItems.length + 1,
    };
    handleSaveWork(duplicated);
  };

  const handleToggleWorkVisibility = (workId: string) => {
    setWorkItems((prev) => {
      const next = prev.map((w) =>
        w.id === workId ? { ...w, isVisible: !w.isVisible } : w
      );
      savePublicSiteWork(next);
      return next;
    });
  };

  const handleToggleWorkFeatured = (workId: string) => {
    setWorkItems((prev) => {
      const next = prev.map((w) =>
        w.id === workId ? { ...w, isFeatured: !w.isFeatured } : w
      );
      savePublicSiteWork(next);
      return next;
    });
  };

  const handleReorderWork = (index: number, direction: 'up' | 'down') => {
    setWorkItems((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const item = copy.splice(index, 1)[0];
      copy.splice(targetIndex, 0, item);
      savePublicSiteWork(copy);
      return copy;
    });
  };

  const handleBulkUpdateWork = (updated: PublicSiteWorkItem[]) => {
    setWorkItems(updated);
    savePublicSiteWork(updated);
  };

  /* ======================================================================= */
  /* TEAM MEMBERS HANDLERS                                                   */
  /* ======================================================================= */

  const handleOpenAddMember = () => {
    setEditingTeamMember(null);
    setIsTeamModalOpen(true);
  };

  const handleOpenEditMember = (member: PublicSiteTeamMember) => {
    setEditingTeamMember(member);
    setIsTeamModalOpen(true);
  };

  const handleSaveMember = (saved: PublicSiteTeamMember) => {
    setTeamMembers((prev) => {
      const exists = prev.some((m) => m.id === saved.id);
      const next = exists
        ? prev.map((m) => (m.id === saved.id ? saved : m))
        : [...prev, saved];
      savePublicSiteTeamMembers(next);
      return next;
    });
  };

  const handleDeleteMember = (memberId: string) => {
    setTeamMembers((prev) => {
      const next = prev.filter((m) => m.id !== memberId);
      savePublicSiteTeamMembers(next);
      return next;
    });
  };

  const handleDuplicateMember = (member: PublicSiteTeamMember) => {
    const duplicated: PublicSiteTeamMember = {
      ...member,
      id: `team-${Date.now()}`,
      name: `${member.name} (Copy)`,
      displayOrder: teamMembers.length + 1,
    };
    handleSaveMember(duplicated);
  };

  const handleToggleMemberVisibility = (memberId: string) => {
    setTeamMembers((prev) => {
      const next = prev.map((m) =>
        m.id === memberId ? { ...m, isPublished: !m.isPublished } : m
      );
      savePublicSiteTeamMembers(next);
      return next;
    });
  };

  const handleToggleMemberFeatured = (memberId: string) => {
    setTeamMembers((prev) => {
      const next = prev.map((m) =>
        m.id === memberId ? { ...m, isFeatured: !m.isFeatured } : m
      );
      savePublicSiteTeamMembers(next);
      return next;
    });
  };

  const handleReorderMember = (index: number, direction: 'up' | 'down') => {
    setTeamMembers((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const item = copy.splice(index, 1)[0];
      copy.splice(targetIndex, 0, item);
      savePublicSiteTeamMembers(copy);
      return copy;
    });
  };

  /* ======================================================================= */
  /* MEDIA HANDLERS                                                          */
  /* ======================================================================= */

  const handleSaveMedia = (newMedia: PublicSiteMediaItem) => {
    setMedia((prev) => {
      const next = [newMedia, ...prev];
      savePublicSiteMedia(next);
      return next;
    });
  };

  const handleDeleteMedia = (mediaId: string) => {
    setMedia((prev) => {
      const next = prev.filter((m) => m.id !== mediaId);
      savePublicSiteMedia(next);
      return next;
    });
  };

  /* ======================================================================= */
  /* NAVIGATION SUBTABS BAR                                                  */
  /* ======================================================================= */

  const subtabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'content', label: 'Page Content', icon: FileText },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'work', label: 'Portfolio Work', icon: Palette },
    { id: 'team', label: 'Studio Team', icon: Users },
    { id: 'offers', label: 'Special Offers', icon: Sparkles },
    { id: 'media', label: 'Media Vault', icon: Upload },
    { id: 'navigation', label: 'Header Nav', icon: Navigation },
    { id: 'footer', label: 'Footer Settings', icon: PanelBottom },
    { id: 'publish', label: 'Deploy & Publish', icon: Rocket },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* CMS Primary Navigation Tabs Bar */}
      <div className="border-b border-zinc-200/90 bg-white -mt-2 -mx-4 sm:-mx-6 px-4 sm:px-6 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
          {subtabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#EE1D45]' : 'text-zinc-400'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.id === 'offers' && offers.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-[#EE1D45] text-white' : 'bg-rose-50 text-[#EE1D45]'
                    }`}
                  >
                    {offers.filter((o) => getOfferComputedStatus(o) === 'Active').length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Render */}
      {activeTab === 'overview' && (
        <CMSOverviewTab
          content={draftContent}
          offers={offers}
          services={services}
          workItems={workItems}
          media={media}
          meta={meta}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenOfferModal={handleOpenAddOffer}
          onOpenServiceModal={handleOpenAddService}
          onOpenWorkModal={handleOpenAddWork}
          onOpenMediaModal={() => setIsMediaModalOpen(true)}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
          onPreviewPublicSite={handlePreview}
        />
      )}

      {activeTab === 'content' && (
        <CMSContentTab
          content={draftContent}
          onSaveContent={handleSaveDraftContent}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
        />
      )}

      {activeTab === 'services' && (
        <CMSServicesTab
          services={services}
          onAddService={handleOpenAddService}
          onEditService={handleOpenEditService}
          onDeleteService={handleDeleteService}
          onDuplicateService={handleDuplicateService}
          onToggleVisibility={handleToggleServiceVisibility}
          onToggleFeatured={handleToggleServiceFeatured}
          onReorder={handleReorderService}
        />
      )}

      {activeTab === 'work' && (
        <CMSWorkTab
          workItems={workItems}
          projects={projects}
          onAddWork={handleOpenAddWork}
          onEditWork={handleOpenEditWork}
          onDeleteWork={handleDeleteWork}
          onDuplicateWork={handleDuplicateWork}
          onToggleVisibility={handleToggleWorkVisibility}
          onToggleFeatured={handleToggleWorkFeatured}
          onReorder={handleReorderWork}
          onBulkUpdate={handleBulkUpdateWork}
        />
      )}

      {activeTab === 'team' && (
        <CMSTeamTab
          teamMembers={teamMembers}
          onAddMember={handleOpenAddMember}
          onEditMember={handleOpenEditMember}
          onDeleteMember={handleDeleteMember}
          onDuplicateMember={handleDuplicateMember}
          onToggleVisibility={handleToggleMemberVisibility}
          onToggleFeatured={handleToggleMemberFeatured}
          onReorder={handleReorderMember}
        />
      )}

      {activeTab === 'offers' && (
        <CMSOffersTab
          offers={offers}
          onAddOffer={handleOpenAddOffer}
          onEditOffer={handleOpenEditOffer}
          onDeleteOffer={handleDeleteOffer}
          onDuplicateOffer={handleDuplicateOffer}
          onToggleActive={handleToggleActiveOffer}
          onExtendDate={handleExtendDateOffer}
        />
      )}

      {activeTab === 'media' && (
        <CMSMediaTab
          media={media}
          onUploadMedia={() => setIsMediaModalOpen(true)}
          onDeleteMedia={handleDeleteMedia}
        />
      )}

      {activeTab === 'navigation' && (
        <CMSNavigationTab
          headerConfig={draftContent.header}
          onSaveHeader={handleSaveHeader}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
        />
      )}

      {activeTab === 'footer' && (
        <CMSFooterTab
          footerConfig={draftContent.footer}
          onSaveFooter={handleSaveFooter}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
        />
      )}

      {activeTab === 'publish' && (
        <CMSPreviewPublishTab
          draftContent={draftContent}
          publishedContent={publishedContent}
          meta={meta}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
          onDiscardDraft={handleDiscardDraft}
          onPreviewPublicSite={handlePreview}
        />
      )}

      {/* Modals */}
      <OfferEditorModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        offer={editingOffer}
        onSave={handleSaveOffer}
      />

      <ServiceEditorModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        service={editingService}
        onSave={handleSaveService}
      />

      <WorkItemEditorModal
        isOpen={isWorkModalOpen}
        onClose={() => setIsWorkModalOpen(false)}
        workItem={editingWorkItem}
        projects={projects}
        onSave={handleSaveWork}
      />

      <TeamMemberEditorModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        member={editingTeamMember}
        onSave={handleSaveMember}
      />

      <MediaUploadModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSave={handleSaveMedia}
      />

      <PublishConfirmModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublish}
        onDiscardDraft={handleDiscardDraft}
        meta={meta}
      />
    </div>
  );
};

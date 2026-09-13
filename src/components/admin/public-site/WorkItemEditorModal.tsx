import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  FolderKanban,
  Sparkles,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  EyeOff,
  History,
  AlertTriangle,
  Layers,
  Star,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import { Project, PublicSiteWorkItem, PublicSiteWorkImage } from '../../../types';
import {
  uploadPortfolioCoverImage,
  uploadPortfolioWorkImage,
  safelyDeleteVaultImage,
} from '../../../services/publicSiteMediaService';
import { getEntityVaultFiles } from '../../../services/fileStorageVault';

interface WorkItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItem: PublicSiteWorkItem | null;
  projects?: Project[];
  onSave: (savedWork: PublicSiteWorkItem) => void;
}

const GRADIENT_PRESETS = [
  { label: 'Dark Carbon', from: '#18181b', to: '#09090b' },
  { label: 'Deep Slate', from: '#0f172a', to: '#18181b' },
  { label: 'Warm Obsidian', from: '#1c1917', to: '#18181b' },
  { label: 'Gizmo Crimson', from: '#881337', to: '#09090b' },
  { label: 'Midnight Blue', from: '#1e1b4b', to: '#09090b' },
];

export const WorkItemEditorModal: React.FC<WorkItemEditorModalProps> = ({
  isOpen,
  onClose,
  workItem,
  projects = [],
  onSave,
}) => {
  const isEditing = Boolean(workItem);

  const [formData, setFormData] = useState<PublicSiteWorkItem>(() => {
    if (workItem) {
      return {
        ...workItem,
        tags: Array.isArray(workItem.tags) ? [...workItem.tags] : [],
        workImages: Array.isArray(workItem.workImages) ? [...workItem.workImages] : [],
        archivedCoverImages: Array.isArray(workItem.archivedCoverImages)
          ? [...workItem.archivedCoverImages]
          : [],
        coverImageFit: workItem.coverImageFit || 'cover',
        status: workItem.status || (workItem.isVisible ? 'published' : 'hidden'),
      };
    }
    return {
      id: `w-${Date.now()}`,
      title: '',
      clientName: '',
      category: 'Brand & Identity',
      desc: '',
      tags: ['Brand Identity', 'Print Production'],
      year: new Date().getFullYear().toString(),
      imageUrl: '',
      coverImageAlt: '',
      coverImageFit: 'cover',
      gradientFrom: '#18181b',
      gradientTo: '#09090b',
      serviceKey: 'Brand Identity',
      badgeText: 'Curated Production',
      orderIndex: 1,
      isVisible: true,
      isFeatured: true,
      status: 'published',
      workImages: [],
      archivedCoverImages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [activeTab, setActiveTab] = useState<'info' | 'cover' | 'gallery' | 'preview'>('info');
  const [newTag, setNewTag] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmImage, setDeleteConfirmImage] = useState<PublicSiteWorkImage | null>(null);
  const [showArchivedCovers, setShowArchivedCovers] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  /* ======================================================================= */
  /* CRM PROJECT LINKAGE                                                     */
  /* ======================================================================= */

  const handleSelectFromProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    // Check if project has attached files in Vault or Project attachments
    const vaultFiles = getEntityVaultFiles('project', proj.id);
    const candidateImages: PublicSiteWorkImage[] = [];

    vaultFiles.forEach((file, idx) => {
      if (file.url && (file.fileType.includes('image') || file.fileName.match(/\.(png|jpg|jpeg|webp)$/i))) {
        candidateImages.push({
          id: `imp-${file.fileId}`,
          url: file.url,
          storagePath: file.storagePath,
          filename: file.fileName,
          fileSize: file.fileSize,
          altText: file.fileName,
          caption: `${proj.title} deliverable`,
          displayOrder: idx + 1,
          active: true,
          createdAt: new Date().toISOString(),
        });
      }
    });

    setFormData((prev) => ({
      ...prev,
      title: proj.title || prev.title,
      clientName: proj.clientName || prev.clientName,
      category: proj.projectType || proj.category || 'Brand & Identity',
      desc: proj.notes || `Design and production rollout delivered for ${proj.clientName}.`,
      linkedProjectId: proj.id,
      year: proj.startDate ? proj.startDate.split('-')[0] : '2026',
      serviceKey: proj.projectType || 'Brand Identity',
      // If we found image candidates and current item has no workImages, offer import
      workImages: prev.workImages && prev.workImages.length > 0 ? prev.workImages : candidateImages,
    }));
  };

  /* ======================================================================= */
  /* COVER IMAGE MANAGEMENT                                                  */
  /* ======================================================================= */

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      setIsUploadingCover(true);
      setUploadError(null);

      // If current cover image exists, save it to archived covers list
      const archivedList = [...(formData.archivedCoverImages || [])];
      if (formData.imageUrl) {
        archivedList.unshift({
          url: formData.imageUrl,
          storagePath: formData.coverImageStoragePath,
          altText: formData.coverImageAlt || '',
          filename: formData.coverImageFilename || 'previous-cover.jpg',
          archivedAt: new Date().toISOString(),
        });
      }

      const uploadResult = await uploadPortfolioCoverImage(
        formData.id,
        file,
        formData.imageUrl,
        formData.coverImageStoragePath
      );

      setFormData((prev) => ({
        ...prev,
        imageUrl: uploadResult.url,
        coverImageStoragePath: uploadResult.storagePath,
        coverImageFilename: uploadResult.filename,
        coverImageFileSize: uploadResult.fileSize,
        coverImageAlt: prev.coverImageAlt || `${prev.title || 'Portfolio work'} cover showcase`,
        archivedCoverImages: archivedList,
      }));
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to process cover image.');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleRemoveCoverImage = () => {
    if (!formData.imageUrl) return;

    // Archive current image before removing from active display
    const archivedList = [...(formData.archivedCoverImages || [])];
    archivedList.unshift({
      url: formData.imageUrl,
      storagePath: formData.coverImageStoragePath,
      altText: formData.coverImageAlt || '',
      filename: formData.coverImageFilename || 'removed-cover.jpg',
      archivedAt: new Date().toISOString(),
    });

    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
      coverImageStoragePath: undefined,
      coverImageFilename: undefined,
      coverImageFileSize: undefined,
      archivedCoverImages: archivedList,
    }));
  };

  const handleRestoreArchivedCover = (index: number) => {
    const target = formData.archivedCoverImages?.[index];
    if (!target) return;

    const remainingArchived = (formData.archivedCoverImages || []).filter((_, i) => i !== index);
    if (formData.imageUrl) {
      remainingArchived.unshift({
        url: formData.imageUrl,
        storagePath: formData.coverImageStoragePath,
        altText: formData.coverImageAlt || '',
        filename: formData.coverImageFilename || 'previous-cover.jpg',
        archivedAt: new Date().toISOString(),
      });
    }

    setFormData((prev) => ({
      ...prev,
      imageUrl: target.url,
      coverImageStoragePath: target.storagePath,
      coverImageFilename: target.filename,
      coverImageAlt: target.altText || prev.coverImageAlt,
      archivedCoverImages: remainingArchived,
    }));
  };

  /* ======================================================================= */
  /* WORK GALLERY IMAGES                                                     */
  /* ======================================================================= */

  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingGallery(true);
      setUploadError(null);

      const currentList = [...(formData.workImages || [])];
      let currentOrder = currentList.length;

      for (let i = 0; i < files.length; i++) {
        currentOrder++;
        const file = files[i];
        const newImg = await uploadPortfolioWorkImage(formData.id, file, currentOrder);
        currentList.push(newImg);
      }

      setFormData((prev) => ({
        ...prev,
        workImages: currentList,
      }));
    } catch (err: any) {
      setUploadError(err?.message || 'Error processing gallery images.');
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleReorderWorkImage = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.workImages || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    // Update displayOrder sequence
    list.forEach((img, idx) => {
      img.displayOrder = idx + 1;
    });

    setFormData((prev) => ({ ...prev, workImages: list }));
  };

  const handleUpdateWorkImageCaption = (index: number, caption: string) => {
    const list = [...(formData.workImages || [])];
    if (list[index]) {
      list[index].caption = caption;
      setFormData((prev) => ({ ...prev, workImages: list }));
    }
  };

  const handleUpdateWorkImageAlt = (index: number, altText: string) => {
    const list = [...(formData.workImages || [])];
    if (list[index]) {
      list[index].altText = altText;
      setFormData((prev) => ({ ...prev, workImages: list }));
    }
  };

  const handleToggleWorkImageActive = (index: number) => {
    const list = [...(formData.workImages || [])];
    if (list[index]) {
      list[index].active = !list[index].active;
      setFormData((prev) => ({ ...prev, workImages: list }));
    }
  };

  const handleConfirmPermanentDelete = () => {
    if (!deleteConfirmImage) return;

    if (deleteConfirmImage.storagePath) {
      safelyDeleteVaultImage(deleteConfirmImage.storagePath);
    }

    const updated = (formData.workImages || []).filter((img) => img.id !== deleteConfirmImage.id);
    updated.forEach((img, idx) => {
      img.displayOrder = idx + 1;
    });

    setFormData((prev) => ({ ...prev, workImages: updated }));
    setDeleteConfirmImage(null);
  };

  /* ======================================================================= */
  /* TAGS & SUBMIT                                                           */
  /* ======================================================================= */

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));
    setNewTag('');
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a project title.');
      return;
    }

    const finalItem: PublicSiteWorkItem = {
      ...formData,
      status: formData.isVisible ? 'published' : 'hidden',
      updatedAt: new Date().toISOString(),
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950">
                {isEditing ? `Edit Portfolio Item: ${formData.title || 'Untitled'}` : 'New Portfolio Showcase'}
              </h2>
              <p className="text-xs text-zinc-500">
                Manage high-resolution cover artwork, additional production gallery images, and project details.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs Navigation */}
        <div className="px-4 sm:px-6 border-b border-zinc-200 bg-white flex items-center gap-2 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'info'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <span>1. Project Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cover')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cover'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>2. Cover Image</span>
            {formData.imageUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Work Images Gallery</span>
            {formData.workImages && formData.workImages.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#EE1D45] text-white text-[10px]">
                {formData.workImages.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>4. Public Site Preview</span>
          </button>
        </div>

        {uploadError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: PROJECT INFORMATION                                                */}
          {/* ========================================================================= */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Quick link from existing production projects */}
              {projects.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50/60 border border-[#EE1D45]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#EE1D45] flex items-center gap-1.5">
                      <FolderKanban className="w-4 h-4" />
                      <span>Link to Live Production Project (CRM)</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">
                      Auto-syncs title, client, deliverables without duplicating records
                    </span>
                  </div>
                  <select
                    onChange={(e) => handleSelectFromProject(e.target.value)}
                    value={formData.linkedProjectId || ''}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-semibold focus:outline-none focus:border-[#EE1D45] bg-white cursor-pointer"
                  >
                    <option value="">-- No Linked Project (Independent Portfolio Item) --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectCode ? `[${p.projectCode}] ` : ''}{p.title} · {p.clientName} ({p.projectType || 'Project'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Project Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Darul Hasaniyyah SNEC Visual Identity"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:border-[#EE1D45]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Client / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Darul Hasaniyyah Islamic Academy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-[#EE1D45]"
                  />
                </div>
              </div>

              {/* Category, Year, Service Key */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45] bg-white cursor-pointer"
                  >
                    <option value="Brand & Identity">Brand &amp; Identity</option>
                    <option value="Motion & Video">Motion &amp; Video</option>
                    <option value="Large Format Flex & Print">Large Format Flex &amp; Print</option>
                    <option value="Digital & Web">Digital &amp; Web</option>
                    <option value="Packaging & Collaterals">Packaging &amp; Collaterals</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Year Completed
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono focus:outline-none focus:border-[#EE1D45]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono focus:outline-none focus:border-[#EE1D45]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-zinc-800 block mb-1">
                  Project Description &amp; Production Scope
                </label>
                <textarea
                  rows={4}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Describe the aesthetic direction, client brief, dimensions (e.g. 50x20ft), press equipment used, color rules..."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed focus:outline-none focus:border-[#EE1D45]"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 block">
                  Tags &amp; Keywords
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="e.g. Vector AI, Star Flex, 60 FPS, Signage"
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.tags.map((t, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded text-[#EE1D45] focus:ring-[#EE1D45] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">Published on Public Site</span>
                    <span className="text-[11px] text-zinc-500 block">Visible to clients in the portfolio archive</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#EE1D45] focus:ring-[#EE1D45] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>Featured on Homepage</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 block">Highlighted in Recent Studio Highlights</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: COVER IMAGE WORKSPACE                                              */}
          {/* ========================================================================= */}
          {activeTab === 'cover' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Portfolio Card Cover Image</h3>
                    <p className="text-xs text-zinc-500">
                      Supported formats: PNG, JPG, JPEG, WEBP. Responsive object-fit prevents distortion.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      onChange={handleCoverFileChange}
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingCover}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.imageUrl ? 'Replace Cover Image' : 'Upload Cover Image'}</span>
                    </button>

                    {formData.imageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveCoverImage}
                        className="px-3 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-xs font-semibold transition cursor-pointer"
                        title="Remove from Public Site"
                      >
                        Remove from Public Site
                      </button>
                    )}
                  </div>
                </div>

                {/* Cover Image Preview Box */}
                {formData.imageUrl ? (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 max-h-[320px] flex items-center justify-center group">
                      <img
                        src={formData.imageUrl}
                        alt={formData.coverImageAlt || formData.title}
                        className={`w-full max-h-[320px] transition-all duration-200 ${
                          formData.coverImageFit === 'contain' ? 'object-contain bg-zinc-950 p-2' : 'object-cover'
                        }`}
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-mono">
                        <span>{formData.coverImageFileSize || 'Cover'}</span>
                      </div>
                    </div>

                    {/* Image Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">
                          Cover Image Alt Text (SEO &amp; Accessibility)
                        </label>
                        <input
                          type="text"
                          value={formData.coverImageAlt || ''}
                          onChange={(e) => setFormData({ ...formData, coverImageAlt: e.target.value })}
                          placeholder="e.g. Darul Hasaniyyah campus brand identity guideline book mockup"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">
                          Display Fit Mode
                        </label>
                        <select
                          value={formData.coverImageFit || 'cover'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              coverImageFit: e.target.value as 'cover' | 'contain',
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45] bg-white cursor-pointer"
                        >
                          <option value="cover">Cover (Fill Card Area — Clean modern look)</option>
                          <option value="contain">Contain (Preserve Exact Aspect Ratio without cropping)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 hover:border-[#EE1D45] rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition bg-white space-y-3"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-[#EE1D45] flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-800 block">
                        Drag &amp; drop your high-resolution artwork here, or browse files
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        PNG, JPG, JPEG, WEBP up to 20MB. Automatically optimized for web speed.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fallback Gradient Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 block">
                    Fallback Card Background Gradient (Used if no image is uploaded or while loading)
                  </label>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {GRADIENT_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          gradientFrom: p.from,
                          gradientTo: p.to,
                        })
                      }
                      className={`h-12 rounded-xl border-2 transition relative flex items-center justify-center cursor-pointer ${
                        formData.gradientFrom === p.from && formData.gradientTo === p.to
                          ? 'border-[#EE1D45] scale-105 shadow-sm'
                          : 'border-transparent'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                      }}
                      title={p.label}
                    >
                      {formData.gradientFrom === p.from && formData.gradientTo === p.to && (
                        <Check className="w-4 h-4 text-white drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Archived / Previous Cover Images */}
              {formData.archivedCoverImages && formData.archivedCoverImages.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Previous / Archived Cover Images ({formData.archivedCoverImages.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowArchivedCovers(!showArchivedCovers)}
                      className="text-xs text-[#EE1D45] font-bold hover:underline cursor-pointer"
                    >
                      {showArchivedCovers ? 'Hide History' : 'View & Restore'}
                    </button>
                  </div>

                  {showArchivedCovers && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                      {formData.archivedCoverImages.map((archived, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900 aspect-[16/10] cursor-pointer"
                          onClick={() => handleRestoreArchivedCover(idx)}
                        >
                          <img
                            src={archived.url}
                            alt={archived.altText || 'Archived cover'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-150"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: WORK IMAGES GALLERY                                                */}
          {/* ========================================================================= */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200/90">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Additional Production &amp; Case Study Images ({(formData.workImages || []).length})
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Clients can click any portfolio item to explore multiple angles, mockups, and proof details.
                  </p>
                </div>

                <div>
                  <input
                    type="file"
                    multiple
                    ref={galleryFileInputRef}
                    onChange={handleGalleryFilesChange}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingGallery}
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Work Images</span>
                  </button>
                </div>
              </div>

              {/* Work Images List */}
              {formData.workImages && formData.workImages.length > 0 ? (
                <div className="space-y-3">
                  {formData.workImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                        img.active !== false
                          ? 'bg-white border-zinc-200/90 shadow-2xs'
                          : 'bg-zinc-50 border-zinc-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-7 text-center font-mono font-bold text-xs text-zinc-400">
                          #{idx + 1}
                        </div>

                        <div className="w-20 h-14 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-900 shrink-0">
                          <img
                            src={img.url}
                            alt={img.altText || img.filename}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 sm:max-w-xs space-y-1">
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={(e) => handleUpdateWorkImageCaption(idx, e.target.value)}
                            placeholder="Caption (e.g. Night Lighting View)"
                            className="w-full px-2.5 py-1 rounded-lg border border-zinc-200 text-xs font-medium focus:outline-none focus:border-[#EE1D45]"
                          />
                          <input
                            type="text"
                            value={img.altText || ''}
                            onChange={(e) => handleUpdateWorkImageAlt(idx, e.target.value)}
                            placeholder="Alt Text for screen readers"
                            className="w-full px-2.5 py-0.5 rounded-lg border border-zinc-200 text-[11px] text-zinc-500 focus:outline-none focus:border-[#EE1D45]"
                          />
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleReorderWorkImage(idx, 'up')}
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 disabled:opacity-20 cursor-pointer"
                          title="Move Earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (formData.workImages?.length || 0) - 1}
                          onClick={() => handleReorderWorkImage(idx, 'down')}
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 disabled:opacity-20 cursor-pointer"
                          title="Move Later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleWorkImageActive(idx)}
                          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer"
                          title={img.active !== false ? 'Hide from public lightbox' : 'Show in lightbox'}
                        >
                          {img.active !== false ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmImage(img)}
                          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 cursor-pointer transition"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 hover:border-[#EE1D45] rounded-2xl p-10 text-center cursor-pointer transition bg-white space-y-2"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-zinc-800 block">
                    No additional work images uploaded yet.
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Click to add close-up proofs, production photos, or alternative layout views.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PUBLIC SITE PREVIEW                                                */}
          {/* ========================================================================= */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Live Public Site Card Appearance
                  </h3>
                  <p className="text-xs text-zinc-500">
                    This is how visitors will see this project on the public Portfolio and Case Studies archive.
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  formData.isVisible ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-200 text-zinc-700'
                }`}>
                  {formData.isVisible ? 'Visible / Published' : 'Hidden'}
                </span>
              </div>

              {/* Simulated Public Site Card */}
              <div className="max-w-md mx-auto bg-white rounded-2xl overflow-hidden border border-zinc-200/90 shadow-md">
                <div
                  className="aspect-[16/10] relative flex flex-col justify-between p-6 text-white overflow-hidden"
                  style={{
                    background: formData.imageUrl
                      ? '#09090b'
                      : `linear-gradient(135deg, ${formData.gradientFrom || '#18181b'}, ${formData.gradientTo || '#09090b'})`,
                  }}
                >
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt={formData.coverImageAlt || formData.title}
                      className={`absolute inset-0 w-full h-full ${
                        formData.coverImageFit === 'contain' ? 'object-contain' : 'object-cover'
                      }`}
                    />
                  )}

                  {/* Gradient shadow overlay for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/20 backdrop-blur-md text-white">
                      {formData.category}
                    </span>
                    <span className="text-xs font-mono text-zinc-300">{formData.year}</span>
                  </div>

                  <div className="relative z-10">
                    <div className="text-xs text-[#EE1D45] font-bold tracking-wide">
                      {formData.clientName || 'Client Project'}
                    </div>
                    <h3 className="text-xl font-black text-white mt-1 leading-snug">
                      {formData.title || 'Untitled Showcase Work'}
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {formData.desc || 'No description entered yet.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-700 border border-zinc-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#EE1D45]">
                      Start Similar Project →
                    </span>
                    <span className="text-zinc-400 font-medium">
                      {(formData.workImages?.length || 0) > 0
                        ? `🖼️ ${formData.workImages?.length} gallery photos`
                        : 'Gizmo Studio'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold shadow-md shadow-[#EE1D45]/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Publish to Portfolio'}</span>
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {deleteConfirmImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-zinc-200">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-zinc-950">Delete Work Gallery Image?</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  This will permanently delete the selected file from the portfolio gallery. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmImage(null)}
                  className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPermanentDelete}
                  className="flex-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

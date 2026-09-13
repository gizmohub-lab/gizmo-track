import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Upload,
  User,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  Instagram,
  Linkedin,
  AlertTriangle,
} from 'lucide-react';
import { PublicSiteTeamMember } from '../../../types';
import { uploadTeamProfilePhoto } from '../../../services/publicSiteMediaService';

interface TeamMemberEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: PublicSiteTeamMember | null;
  onSave: (savedMember: PublicSiteTeamMember) => void;
}

export const TeamMemberEditorModal: React.FC<TeamMemberEditorModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
}) => {
  const isEditing = Boolean(member);

  const [formData, setFormData] = useState<PublicSiteTeamMember>(() => {
    if (member) {
      return { ...member };
    }
    return {
      id: `team-${Date.now()}`,
      name: '',
      role: '',
      bio: '',
      avatarUrl: '',
      displayOrder: 1,
      isPublished: true,
      isFeatured: true,
      status: 'published',
      email: '',
      phone: '',
      whatsapp: '',
      instagram: '',
      linkedin: '',
      portfolioUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      setIsUploadingPhoto(true);
      setErrorMsg(null);

      const res = await uploadTeamProfilePhoto(formData.id, file);
      setFormData((prev) => ({
        ...prev,
        avatarUrl: res.url,
        avatarStoragePath: res.storagePath,
        avatarAlt: `${prev.name || 'Team member'} profile photo`,
      }));
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process profile photo.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      avatarUrl: '',
      avatarStoragePath: undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      alert('Please provide member name and role.');
      return;
    }

    onSave({
      ...formData,
      status: formData.isPublished ? 'published' : 'hidden',
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950">
                {isEditing ? `Edit Team Member: ${formData.name || 'Untitled'}` : 'New Studio Team Member'}
              </h2>
              <p className="text-xs text-zinc-500">
                Manage profile avatar, creative designation, bio, and social links displayed on the public About view.
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

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Avatar Upload Strip */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              {formData.avatarUrl ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#EE1D45] shadow-xs">
                  <img
                    src={formData.avatarUrl}
                    alt={formData.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-black text-xl border border-zinc-300">
                  {formData.name
                    ? formData.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'GZ'}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-zinc-900 block">Profile Portrait Photo</span>
              <p className="text-[11px] text-zinc-500">
                Recommended: Square PNG, JPG, or WEBP portrait (500x500px or larger).
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoFileChange}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.avatarUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                </button>

                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-rose-600 text-xs font-medium cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-800 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Muhammed Shamveel"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:border-[#EE1D45]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-800 block mb-1">
                Designation / Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Creative Director, Motion Lead..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-[#EE1D45]"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1">
              Short Professional Biography
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="e.g. Leading brand identity, typography systems, and print architecture for commercial entities across South India."
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          {/* Display Order & Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-xs font-bold text-zinc-800 block mb-1">
                Display Order Sequence
              </label>
              <input
                type="number"
                min={1}
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-mono focus:outline-none focus:border-[#EE1D45]"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-4 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#EE1D45] focus:ring-[#EE1D45] cursor-pointer"
                />
                <span className="text-xs font-bold text-zinc-800">
                  Published on About Page
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#EE1D45] focus:ring-[#EE1D45] cursor-pointer"
                />
                <span className="text-xs font-bold text-zinc-800 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Key Leadership</span>
                </span>
              </label>
            </div>
          </div>

          {/* Social & Contact Links */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
              Contact &amp; Social Links (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
                />
              </div>

              <div className="relative">
                <MessageSquare className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="WhatsApp number (+91...)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
                />
              </div>

              <div className="relative">
                <Instagram className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.instagram || ''}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="Instagram handle or URL"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
                />
              </div>

              <div className="relative">
                <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={formData.portfolioUrl || ''}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="Personal Portfolio / Behance URL"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
                />
              </div>
            </div>
          </div>

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
              <span>{isEditing ? 'Save Member' : 'Add to Team'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

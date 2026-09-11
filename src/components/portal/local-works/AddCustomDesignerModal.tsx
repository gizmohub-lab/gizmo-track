import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, Briefcase, FileText, Check } from 'lucide-react';
import { CustomDesigner, DesignerType } from '../../../types';

interface AddCustomDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDesigner: (designer: CustomDesigner) => void;
  defaultType?: DesignerType;
  initialName?: string;
}

export const AddCustomDesignerModal: React.FC<AddCustomDesignerModalProps> = ({
  isOpen,
  onClose,
  onAddDesigner,
  defaultType = 'External Designer',
  initialName = '',
}) => {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<DesignerType>(defaultType);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [roleSpecialization, setRoleSpecialization] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newDesigner: CustomDesigner = {
      id: `des-${Date.now()}`,
      name: trimmedName,
      type,
      phone: phone.trim() || undefined,
      whatsapp: (whatsapp || phone).replace(/[^\d]/g, '') || undefined,
      email: email.trim() || undefined,
      roleSpecialization: roleSpecialization.trim() || undefined,
      notes: notes.trim() || undefined,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddDesigner(newDesigner);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF5738]/10 text-[#FF5738] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Add Designer</h2>
              <p className="text-[11px] text-zinc-500">Portal Staff or External Freelancer/Agency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Designer Type Selector */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1">Designer Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('Portal Staff')}
                className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                  type === 'Portal Staff'
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                🏢 Portal Staff
              </button>
              <button
                type="button"
                onClick={() => setType('External Designer')}
                className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                  type === 'External Designer'
                    ? 'bg-[#FF5738] text-white border-[#FF5738] shadow-xs'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                🌐 External Designer
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block font-bold text-zinc-800 mb-1">
              Designer Name <span className="text-[#FF5738]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ashi Designs, Studio X, Rahul"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] focus:ring-2 focus:ring-[#FF5738]/20 outline-none text-zinc-900 font-medium text-xs transition"
              autoFocus
            />
          </div>

          {/* Phone / WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-zinc-800 mb-1">Phone / WhatsApp</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="+91 94460 33412"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setWhatsapp(e.target.value.replace(/[^\d]/g, ''));
                  }}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none text-zinc-900 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-800 mb-1">Email (optional)</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  placeholder="designer@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none text-zinc-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Role / Specialization */}
          <div>
            <label className="block font-bold text-zinc-800 mb-1">Role / Specialization (optional)</label>
            <div className="relative">
              <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="e.g. 3D Motion Graphics, Calligraphy, Flex & Print"
                value={roleSpecialization}
                onChange={(e) => setRoleSpecialization(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none text-zinc-900 text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-zinc-800 mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Freelance contact for peak festive rushes, WhatsApp preferred"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none text-zinc-900 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#FF5738] hover:bg-[#ff4220] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add Designer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

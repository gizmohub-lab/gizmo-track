import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, UserPlus, Check, User } from 'lucide-react';
import { CustomDesigner } from '../../../types';
import { AddCustomDesignerModal } from './AddCustomDesignerModal';

interface QuickAssignDropdownProps {
  currentDesigner?: string;
  supportingDesigners?: string[];
  designers: CustomDesigner[];
  onAssign: (primaryDesigner: string) => void;
  onAddCustomDesigner: (designer: CustomDesigner) => void;
  compact?: boolean;
}

export const QuickAssignDropdown: React.FC<QuickAssignDropdownProps> = ({
  currentDesigner,
  supportingDesigners = [],
  designers,
  onAssign,
  onAddCustomDesigner,
  compact = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeDesigners = designers.filter((d) => d.isActive);
  const staffDesigners = activeDesigners.filter((d) => d.type === 'Portal Staff');
  const externalDesigners = activeDesigners.filter((d) => d.type === 'External Designer');

  const handleSelect = (name: string) => {
    onAssign(name);
    setIsOpen(false);
  };

  const handleDesignerAdded = (newDesigner: CustomDesigner) => {
    onAddCustomDesigner(newDesigner);
    onAssign(newDesigner.name);
    setShowAddModal(false);
    setIsOpen(false);
  };

  const isAssigned = currentDesigner && currentDesigner !== 'Unassigned';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`group inline-flex items-center gap-1.5 rounded-lg font-medium transition text-left ${
          compact
            ? 'px-2 py-1 text-xs hover:bg-zinc-100/80 border border-transparent hover:border-zinc-200'
            : 'px-3 py-1.5 text-xs bg-white border border-zinc-200 hover:border-zinc-300 shadow-2xs'
        }`}
        title="Click to Quick Assign Designer"
      >
        <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-700 shrink-0 group-hover:bg-[#FF5738]/10 group-hover:text-[#FF5738]">
          {isAssigned ? currentDesigner.charAt(0).toUpperCase() : <User className="w-3 h-3 text-zinc-400" />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="truncate max-w-[130px] font-bold text-zinc-900 group-hover:text-[#FF5738]">
            {isAssigned ? currentDesigner : 'Unassigned'}
          </span>
          {supportingDesigners.length > 0 && (
            <span className="text-[10px] text-zinc-400 font-normal leading-tight">
              +{supportingDesigners.length} {supportingDesigners.length === 1 ? 'supporter' : 'supporters'}
            </span>
          )}
        </div>
        <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0 group-hover:text-zinc-700" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 mt-1 w-56 rounded-xl bg-white shadow-xl border border-zinc-200 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100 right-0 sm:left-0 sm:right-auto"
        >
          <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            Quick Assign Designer
          </div>

          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-zinc-100">
            {/* Unassigned Option */}
            <div className="pb-1">
              <button
                type="button"
                onClick={() => handleSelect('Unassigned')}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-zinc-50 ${
                  !isAssigned ? 'font-bold text-[#FF5738]' : 'text-zinc-600'
                }`}
              >
                <span>Unassigned</span>
                {!isAssigned && <Check className="w-3.5 h-3.5 text-[#FF5738]" />}
              </button>
            </div>

            {/* Portal Staff */}
            {staffDesigners.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-0.5 text-[10px] font-bold text-zinc-400 uppercase">Portal Staff</div>
                {staffDesigners.map((d) => {
                  const selected = currentDesigner === d.name;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelect(d.name)}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-zinc-50 ${
                        selected ? 'font-bold text-[#FF5738]' : 'text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="truncate">{d.name}</span>
                      </div>
                      {selected && <Check className="w-3.5 h-3.5 text-[#FF5738] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* External Designers */}
            {externalDesigners.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-0.5 text-[10px] font-bold text-zinc-400 uppercase">External Partner</div>
                {externalDesigners.map((d) => {
                  const selected = currentDesigner === d.name;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelect(d.name)}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-zinc-50 ${
                        selected ? 'font-bold text-[#FF5738]' : 'text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span className="truncate">{d.name}</span>
                        {d.roleSpecialization && (
                          <span className="text-[10px] text-zinc-400 truncate">({d.roleSpecialization})</span>
                        )}
                      </div>
                      {selected && <Check className="w-3.5 h-3.5 text-[#FF5738] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action: + Add Custom Designer */}
          <div className="pt-1 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(true);
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-1.5 text-[#FF5738] font-bold hover:bg-[#FF5738]/5 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Custom Designer</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal to add designer */}
      <AddCustomDesignerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddDesigner={handleDesignerAdded}
      />
    </div>
  );
};

const fs = require('fs');
const file = 'src/components/portal/projects/ProjectDeliverablesManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const assignModalCode = `
// ============================================================================
// SUB-COMPONENT: ASSIGN DESIGNER MODAL
// ============================================================================
interface AssignDeliverableDesignerModalProps {
  deliverable: ProjectDeliverable;
  designers: CustomDesigner[];
  onUpdateDesigners?: (designers: CustomDesigner[]) => void;
  onClose: () => void;
  onSave: (updated: ProjectDeliverable) => void;
}

const AssignDeliverableDesignerModal: React.FC<AssignDeliverableDesignerModalProps> = ({
  deliverable,
  designers,
  onUpdateDesigners,
  onClose,
  onSave,
}) => {
  const [designerId, setDesignerId] = useState(deliverable.assignedDesignerId || 'unassigned');
  const [designerName, setDesignerName] = useState(deliverable.assignedDesignerName || 'Unassigned');
  const [customDisplayName, setCustomDisplayName] = useState(deliverable.customDisplayName || '');
  const [designerFee, setDesignerFee] = useState(deliverable.designerFee !== undefined ? String(deliverable.designerFee) : '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesignerName, setNewDesignerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalName = designerName;
    if (designerId === 'unassigned') finalName = 'Unassigned';
    else {
      const match = designers.find((d) => d.id === designerId);
      if (match) finalName = match.name;
    }
    const updated: ProjectDeliverable = {
      ...deliverable,
      assignedDesignerId: designerId === 'unassigned' ? undefined : designerId,
      assignedDesignerName: finalName,
      customDisplayName: customDisplayName.trim() || undefined,
      designerFee: designerFee ? parseFloat(designerFee) : undefined,
    };
    onSave(updated);
  };

  const handleAddDesigner = () => {
    if (!newDesignerName.trim() || !onUpdateDesigners) return;
    const newD: CustomDesigner = {
      id: 'des-' + Date.now().toString(36),
      name: newDesignerName.trim(),
      type: 'External Designer',
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0],
      email: '',
      phone: '',
      role: '',
      specialties: [],
      notes: ''
    };
    onUpdateDesigners([...designers, newD]);
    setDesignerId(newD.id);
    setDesignerName(newD.name);
    setNewDesignerName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
        <div className="p-4 px-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-600 text-white rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Assign Designer</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
             <span className="font-bold text-slate-700">Deliverable: {deliverable.title}</span>
             <span className="text-slate-500 text-[11px]">{deliverable.type || 'Deliverable'}</span>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Select Designer</label>
            <div className="flex items-center gap-2">
              <select
                value={designerId}
                onChange={(e) => {
                  setDesignerId(e.target.value);
                  const match = designers.find((d) => d.id === e.target.value);
                  if (match) setDesignerName(match.name);
                  if (e.target.value === 'unassigned') setDesignerName('Unassigned');
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600 cursor-pointer"
              >
                <option value="unassigned">Unassigned (Remove Assignment)</option>
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.role ? \`(\${d.role})\` : ''}
                  </option>
                ))}
              </select>
            </div>
            {onUpdateDesigners && (
               <div className="pt-1 text-right">
                  <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="text-[10px] font-bold text-violet-600 hover:text-violet-800 transition">
                    + Add Designer
                  </button>
               </div>
            )}
          </div>

          {showAddForm && (
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl space-y-2">
              <label className="font-bold text-violet-900 text-[10px]">New Designer Name</label>
              <div className="flex gap-2">
                 <input type="text" value={newDesignerName} onChange={(e) => setNewDesignerName(e.target.value)} className="flex-1 px-3 py-1.5 border border-violet-200 rounded-lg outline-none focus:border-violet-500 font-medium" placeholder="E.g. Ali..." />
                 <button type="button" onClick={handleAddDesigner} className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition">Add</button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Custom Display Name (Optional)</label>
            <input
              type="text"
              value={customDisplayName}
              onChange={(e) => setCustomDisplayName(e.target.value)}
              placeholder="e.g. Lead Illustrator"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-violet-600"
            />
          </div>
          
          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Designer Fee ₹ (Optional)</label>
            <input
              type="number"
              value={designerFee}
              onChange={(e) => setDesignerFee(e.target.value)}
              placeholder="₹"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 transition cursor-pointer"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
`;

content = content.replace(
  '// SUB-COMPONENT: EDIT DELIVERABLE MODAL',
  assignModalCode + '\n// SUB-COMPONENT: EDIT DELIVERABLE MODAL'
);

fs.writeFileSync(file, content);

import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';
import { LocalWork, LocalWorkStatus } from '../../../types';
import { generateNextWorkId } from '../../../utils/localWorkUtils';

interface ImportWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (works: LocalWork[]) => void;
  existingWorks: LocalWork[];
  categories: string[];
}

export const ImportWorksModal: React.FC<ImportWorksModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingWorks,
  categories,
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [rawText, setRawText] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);

  // Mapping state: Gizmo Target Field -> Google Sheet Column Name
  const [mapping, setMapping] = useState({
    title: '',
    clientName: '',
    category: '',
    date: '',
    deadline: '',
    amount: '',
    status: '',
    phone: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseCSV(content);
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvContent: string) => {
    const lines = csvContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      alert('CSV must contain at least a header row and one data row.');
      return;
    }

    // Split CSV line respecting quotes if present
    const splitCSVLine = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const parsedHeaders = splitCSVLine(lines[0]);
    const dataRows = lines.slice(1).map(splitCSVLine);

    setHeaders(parsedHeaders);
    setParsedRows(dataRows);

    // Auto-map columns using smart fuzzy match
    const newMapping = {
      title: findBestMatch(parsedHeaders, ['title', 'work', 'project', 'item', 'description']),
      clientName: findBestMatch(parsedHeaders, ['client', 'customer', 'name', 'party']),
      category: findBestMatch(parsedHeaders, ['category', 'type', 'work type', 'service']),
      date: findBestMatch(parsedHeaders, ['date', 'received', 'created', 'start date']),
      deadline: findBestMatch(parsedHeaders, ['deadline', 'due date', 'target', 'delivery date']),
      amount: findBestMatch(parsedHeaders, ['amount', 'price', 'fee', 'cost', 'total', 'rate']),
      status: findBestMatch(parsedHeaders, ['status', 'state', 'stage']),
      phone: findBestMatch(parsedHeaders, ['phone', 'mobile', 'whatsapp', 'contact']),
      notes: findBestMatch(parsedHeaders, ['notes', 'remarks', 'brief', 'instructions']),
    };

    setMapping(newMapping);
    setStep('mapping');
  };

  const findBestMatch = (headers: string[], candidates: string[]) => {
    for (const cand of candidates) {
      const found = headers.find((h) => h.toLowerCase().includes(cand));
      if (found) return found;
    }
    return '';
  };

  const handleUseSampleData = () => {
    const sampleCSV = `Work Title,Client Name,Category,Received Date,Deadline,Amount,Phone,Status
Annual College Fest Brochure,St Marys College,Brochure,2026-09-08,2026-09-12,4500,+91 94472 11223,In Progress
Grand Opening Flex Board,Kochi Spice Mart,Flex Design,2026-09-09,2026-09-11,2800,+91 98950 44556,New
Business Visiting Cards,Apex Logistics,Visiting Card,2026-09-07,2026-09-10,1200,+91 98460 77889,Ready
Wedding Reception Invitation,Rahim & Family,Invitation,2026-09-08,2026-09-14,3500,+91 97450 33445,Waiting for Client`;
    parseCSV(sampleCSV);
  };

  const buildMappedWorks = (): LocalWork[] => {
    const today = new Date().toISOString().split('T')[0];
    let nextIdIndex = 1;

    return parsedRows.map((row, idx) => {
      const getVal = (colName: string) => {
        const colIdx = headers.indexOf(colName);
        return colIdx !== -1 && row[colIdx] ? row[colIdx].trim() : '';
      };

      const title = getVal(mapping.title) || `Imported Work #${idx + 1}`;
      const client = getVal(mapping.clientName) || 'Local Client';
      const cat = getVal(mapping.category) || categories[0] || 'General';
      const rDate = getVal(mapping.date) || today;
      const dDate = getVal(mapping.deadline) || today;
      const rawAmt = getVal(mapping.amount).replace(/[^\d.]/g, '');
      const amt = Number(rawAmt) || 1000;
      const rawStatus = getVal(mapping.status);
      const phone = getVal(mapping.phone);
      const notes = getVal(mapping.notes);

      let status: LocalWorkStatus = 'New';
      if (/progress/i.test(rawStatus)) status = 'In Progress';
      else if (/complete|done|finish/i.test(rawStatus)) status = 'Completed';
      else if (/wait/i.test(rawStatus)) status = 'Waiting for Client';
      else if (/revis/i.test(rawStatus)) status = 'Revision';
      else if (/ready/i.test(rawStatus)) status = 'Ready';

      const workId = `LW-IMP-${String(idx + 1).padStart(3, '0')}`;

      return {
        id: `lw-import-${Date.now()}-${idx}`,
        workId,
        title,
        clientName: client,
        clientPhone: phone || undefined,
        clientWhatsApp: phone ? phone.replace(/[^\d]/g, '') : undefined,
        workType: cat,
        category: cat,
        amount: amt,
        paymentStatus: status === 'Completed' ? 'Paid' : 'Pending',
        status,
        priority: 'Normal',
        assignedTo: 'Fayis Designer',
        date: rDate,
        receivedDate: rDate,
        deadlineDate: dDate,
        deadlineTime: '18:00',
        notes: notes || 'Imported from Google Sheets spreadsheet',
        revisionCount: 0,
        attachments: [],
        history: [
          {
            id: `hist-imp-${idx}`,
            timestamp: `${today} · 00:00 AM`,
            action: 'Imported from Google Sheets',
          },
        ],
      };
    });
  };

  const handleConfirmImport = () => {
    const finalWorks = buildMappedWorks();
    onImport(finalWorks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-zinc-950">
                Import from Google Sheets / CSV
              </h2>
              <p className="text-[11px] text-zinc-500">
                Migrate your manual spreadsheet rows into Gizmo Portal Local Works
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span className={step === 'upload' ? 'text-[#FF5738]' : 'text-zinc-800'}>
            1. Upload or Paste
          </span>
          <span>→</span>
          <span className={step === 'mapping' ? 'text-[#FF5738]' : 'text-zinc-800'}>
            2. Map Sheet Columns
          </span>
          <span>→</span>
          <span className={step === 'preview' ? 'text-[#FF5738]' : 'text-zinc-800'}>
            3. Preview &amp; Import
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-8 text-center bg-zinc-50 hover:bg-zinc-100/60 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv, text/csv, .txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-[#FF5738] mx-auto mb-2" />
                <p className="font-bold text-zinc-800 text-sm">
                  Click to browse or drop your exported Google Sheet CSV
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  In Google Sheets: File → Download → Comma Separated Values (.csv)
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-zinc-400">or</span>
                <button
                  type="button"
                  onClick={handleUseSampleData}
                  className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-bold text-xs"
                >
                  Load Sample Google Sheet Records
                </button>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700">Paste CSV data directly:</label>
                <textarea
                  rows={4}
                  placeholder="Paste CSV text here with column headers..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-zinc-300 rounded-xl outline-none focus:border-[#FF5738]"
                />
                {rawText.trim() && (
                  <button
                    onClick={() => parseCSV(rawText)}
                    className="mt-2 px-4 py-2 bg-[#FF5738] text-white rounded-xl font-bold text-xs"
                  >
                    Parse Pasted CSV
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium">
                Found <strong>{headers.length} columns</strong> and <strong>{parsedRows.length} work rows</strong>.
                Confirm matching fields below:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                {[
                  { key: 'title', label: 'Work Title', required: true },
                  { key: 'clientName', label: 'Client Name', required: true },
                  { key: 'category', label: 'Category / Work Type' },
                  { key: 'date', label: 'Received Date' },
                  { key: 'deadline', label: 'Target Deadline' },
                  { key: 'amount', label: 'Fee / Amount (₹)' },
                  { key: 'status', label: 'Status' },
                  { key: 'phone', label: 'Phone / WhatsApp' },
                  { key: 'notes', label: 'Notes / Brief' },
                ].map(({ key, label, required }) => (
                  <div key={key}>
                    <label className="block font-bold text-zinc-700 mb-1">
                      {label} {required && <span className="text-[#FF5738]">*</span>}
                    </label>
                    <select
                      value={(mapping as any)[key]}
                      onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs outline-none focus:border-[#FF5738]"
                    >
                      <option value="">-- Don't Map --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('preview')}
                  className="px-4 py-2 bg-[#FF5738] hover:bg-[#ff4220] text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <span>Preview Rows</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <p className="text-zinc-600">
                Ready to import <strong>{parsedRows.length} work items</strong> into your Local Works dashboard:
              </p>

              <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 text-zinc-700 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">Work</th>
                      <th className="p-2.5">Client</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Deadline</th>
                      <th className="p-2.5">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {buildMappedWorks().map((w, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="p-2.5 font-bold text-zinc-900">{w.title}</td>
                        <td className="p-2.5 text-zinc-700">{w.clientName}</td>
                        <td className="p-2.5 text-zinc-600">{w.category}</td>
                        <td className="p-2.5 font-mono text-zinc-600">{w.deadlineDate}</td>
                        <td className="p-2.5 font-bold text-zinc-900">₹{w.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('mapping')}
                  className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 font-bold"
                >
                  Back to Mapping
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm &amp; Import All {parsedRows.length} Items</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Save, Database, Info, FileSpreadsheet, Copy, Check, ExternalLink } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (students: Student[]) => void;
  config: {
    sheetId: string;
    apiKey: string;
    gasUrl: string;
    sheetName: string;
  };
  onSaveConfig: (sheetId: string, apiKey: string, gasUrl: string, sheetName: string) => void;
}

export default function SettingsModal({ isOpen, onClose, onImportStudents, config, onSaveConfig }: SettingsModalProps) {
  const [sheetId, setSheetId] = useState(config.sheetId);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [gasUrl, setGasUrl] = useState(config.gasUrl);
  const [sheetName, setSheetName] = useState(config.sheetName);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      // Assuming header: ID, Name, Gender (L/P), Class (Optional)
      if (data.length > 1) {
        const importedStudents: Student[] = data.slice(1).map((row, index) => ({
          id: String(row[0] || index),
          name: String(row[1] || 'Unknown'),
          gender: (row[2] === 'P' ? 'P' : 'L') as 'L' | 'P',
          classId: row[3] ? String(row[3]) : undefined,
          status: 'pending'
        }));
        onImportStudents(importedStudents);
        alert(`${importedStudents.length} murid berjaya diimport!`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const gasCode = `
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Senarai Semakan") || ss.insertSheet("Senarai Semakan");
  
  // Append or Update logic here
  var timestamp = new Date();
  data.forEach(function(student) {
    if (student.status !== 'pending') {
      sheet.appendRow([timestamp, student.id, student.name, student.status, student.reason || ""]);
    }
  });
  
  return ContentService.createTextOutput(JSON.stringify({status: "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}
  `.trim();

  const handleCopyGAS = () => {
    navigator.clipboard.writeText(gasCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-none">Tetapan Konfigurasi</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem & Pangkalan Data</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-900">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            
            {/* Cloud Setup */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                <ExternalLink size={14} />
                Sambungan Google Sheets
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Spreadsheet ID</label>
                  <input 
                    type="text" 
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    placeholder="Contoh: 1ByC..._8oNf"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Google API Key</label>
                  <input 
                    type="password" 
                    value= {apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">GAS Web App URL (Bridge)</label>
                  <input 
                    type="text" 
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Nama Sheet (Tab Name)</label>
                  <input 
                    type="text" 
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Sheet1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Default: Sheet1</p>
                </div>
              </div>
              <button 
                onClick={() => onSaveConfig(sheetId, apiKey, gasUrl, sheetName)}
                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                <Save size={18} />
                Simpan Konfigurasi Awan
              </button>
            </section>

            {/* Excel Import */}
            <section className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase text-green-600 tracking-widest flex items-center gap-2">
                <FileSpreadsheet size={14} />
                Import Murid Dari Excel
              </h3>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex flex-col items-center gap-4 border-dashed">
                <div className="bg-white p-4 rounded-full text-green-500 shadow-sm">
                  <Upload size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800">Muat Naik Fail Excel (.xlsx)</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">Format Lajur: A(ID), B(Nama), C(Jantina: L/P), D(Kelas - Opsional)</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleExcelImport}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-green-700 transition-all"
                >
                  Pilih Fail
                </button>
              </div>
            </section>

            {/* GAS Bridge Info */}
            <section className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                  <Info size={14} />
                  Google Apps Script (GAS) Bridge
                </h3>
                <button 
                  onClick={handleCopyGAS}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-all"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Berjaya Salin!' : 'Salin Kod'}
                </button>
              </div>
              <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden">
                <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto custom-scrollbar">
                  {gasCode}
                </pre>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl flex items-start gap-3">
                <Info size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                <div className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                  <strong>Cara Guna:</strong> Buka Google Sheets &gt; Extensions &gt; Apps Script. Tampal kod di atas, simpan, dan <strong>Deploy as Web App</strong>. Berikan akses "Anyone". URL web app ini boleh digunakan untuk sambungan POST data.
                </div>
              </div>
            </section>
          </div>
          
          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sistem Semakan Buku v2.0 • Diperkasakan oleh Cloud Tech</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

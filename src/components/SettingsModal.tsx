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
          className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh] border-4 border-white"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white shadow-xl shadow-black/10 ring-1 ring-white/50">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white leading-none uppercase tracking-tighter">Tetapan Sistem</h2>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Pangkalan Data Guru & Murid</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-sm active:scale-90">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            
            {/* Cloud Setup */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 px-3 border-l-4 border-blue-500">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-[0.15em] flex items-center gap-2">
                  <ExternalLink size={14} className="text-blue-500" />
                  Konfigurasi Awan (Google)
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-5 bg-slate-50/50 p-6 rounded-3xl border-2 border-slate-100">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Spreadsheet ID</label>
                  <input 
                    type="text" 
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    placeholder="Masukkan ID Spreadsheet"
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Google API Key</label>
                  <input 
                    type="password" 
                    value= {apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Contoh: AIza..."
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">GAS Web App URL (Bridge)</label>
                  <input 
                    type="text" 
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    placeholder="URL Google Apps Script"
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Tab Sheet</label>
                  <input 
                    type="text" 
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Contoh: Sheet1"
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
              <button 
                onClick={() => onSaveConfig(sheetId, apiKey, gasUrl, sheetName)}
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95"
              >
                <Save size={18} />
                SIMPAN & AKTIFKAN CLOUD
              </button>
            </section>

            {/* Excel Import */}
            <section className="space-y-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 px-3 border-l-4 border-emerald-500">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-[0.15em] flex items-center gap-2">
                  <FileSpreadsheet size={14} className="text-emerald-500" />
                  Import Data (Excel)
                </h3>
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group bg-gradient-to-br from-emerald-50 to-teal-50 border-4 border-dashed border-emerald-200 hover:border-emerald-500 p-10 rounded-[2.5rem] transition-all cursor-pointer flex flex-col items-center justify-center gap-4 active:scale-95"
              >
                <div className="bg-white p-5 rounded-3xl text-emerald-500 shadow-xl shadow-emerald-200/50 group-hover:scale-110 transition-transform">
                  <Upload size={40} />
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-slate-800 uppercase tracking-tighter">MUAT NAIK FAIL EXCEL</p>
                  <p className="text-[10px] text-emerald-600 font-black mt-2 uppercase tracking-[0.2em] bg-emerald-100/50 px-3 py-1 rounded-full border border-emerald-200 inline-block">ID • NAMA • JANTINA • KELAS</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleExcelImport}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
              </div>
            </section>

            {/* GAS Bridge Info */}
            <section className="space-y-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3 px-3 border-l-4 border-purple-500">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-[0.15em] flex items-center gap-2">
                    <Info size={14} className="text-purple-500" />
                    GAS Bridge Code
                  </h3>
                </div>
                <button 
                  onClick={handleCopyGAS}
                  className="flex items-center gap-2 text-[10px] font-black uppercase bg-purple-50 text-purple-600 px-4 py-2 rounded-xl border-2 border-purple-100 hover:bg-purple-100 transition-all active:scale-90"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'BERJAYA!' : 'SALIN KOD'}
                </button>
              </div>
              <div className="bg-slate-900 rounded-3xl p-6 overflow-hidden border-4 border-slate-800 shadow-2xl">
                <pre className="text-[11px] text-slate-400 font-mono overflow-x-auto custom-scrollbar-dark leading-relaxed">
                  {gasCode}
                </pre>
              </div>
            </section>
          </div>
          
          {/* Footer */}
          <div className="p-5 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Sistem Semakan v2.0 • Colorful Edition</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

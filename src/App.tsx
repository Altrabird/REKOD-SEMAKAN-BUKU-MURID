import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Users, 
  Settings, 
  ChevronRight, 
  Search, 
  Filter,
  RefreshCw,
  BookMarked,
  LayoutDashboard,
  Download,
  AlertTriangle,
  Save
} from 'lucide-react';
import StudentCard from './components/StudentCard';
import Summary from './components/Summary';
import { Student, SubmissionStatus } from './types';
import { CLASSES, MOCK_STUDENTS } from './constants';
import { fetchStudentsFromSheet } from './services/googleSheetsService';
import SettingsModal from './components/SettingsModal';

const INITIAL_SHEET_ID = (import.meta as any).env.VITE_GOOGLE_SHEETS_ID || '';
const INITIAL_API_KEY = (import.meta as any).env.VITE_GOOGLE_API_KEY || '';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState({
    sheetId: INITIAL_SHEET_ID,
    apiKey: INITIAL_API_KEY,
    gasUrl: '',
    sheetName: 'Sheet1'
  });

  const syncData = useCallback(async () => {
    if (!config.sheetId || !config.apiKey) {
      setError("Sila sediakan Google Sheets ID dan API Key di dalam Tetapan");
      return;
    }

    setIsSyncing(true);
    setError(null);
    try {
      const data = await fetchStudentsFromSheet(config.sheetId, config.apiKey, config.sheetName);
      setStudents(data);
    } catch (err) {
      setError("Gagal memuat turun data. Sila pastikan Sheet ID, API Key, dan Nama Sheet betul.");
    } finally {
      setIsSyncing(false);
    }
  }, [config]);

  // Filter students based on search AND selected class (if classId exists)
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = s.classId ? s.classId === selectedClass : true; // If no classId, show all in that class
    return matchesSearch && matchesClass;
  });

  const handleStatusChange = (id: string, status: SubmissionStatus, reason?: string) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, status, reason: status === 'not_submitted' ? reason : undefined } : s
    ));
  };

  const handleReset = () => {
    if (confirm('Padam semua data semakan untuk hari ini?')) {
      setStudents(prev => prev.map(s => ({ ...s, status: 'pending', reason: undefined })));
    }
  };

  return (
    <div className="w-full min-h-screen font-sans flex flex-col overflow-x-hidden text-slate-800 pb-20 sm:pb-0">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(id, key, gas, name) => {
          setConfig({ sheetId: id, apiKey: key, gasUrl: gas, sheetName: name });
          alert("Konfigurasi disimpan!");
        }}
        onImportStudents={(imported) => {
          setStudents(imported);
        }}
      />

      {/* Header Section */}
      <header className="bg-white/70 backdrop-blur-md border-b-4 border-blue-500 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between shadow-[0_10px_30px_-15px_rgba(37,99,235,0.2)] sticky top-0 z-50 gap-3">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
              <BookMarked size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tighter text-slate-900 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">SSB MURID</h1>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] hidden sm:block">High Performance Dashboard</p>
            </div>
          </div>
          
          <div className="flex sm:hidden items-center space-x-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 bg-white rounded-lg transition-all border-2 border-indigo-100 shadow-sm"
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={handleReset}
              className="p-2 text-rose-500 hover:bg-rose-50 bg-white border-2 border-rose-100 rounded-lg transition-all shadow-sm"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-6 w-full sm:w-auto">
          <div className="relative group w-full sm:w-64">
             <input 
               type="text"
               placeholder="Cari nama murid..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border-2 border-slate-200 rounded-xl px-9 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold shadow-sm"
             />
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none flex flex-col">
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs bg-white border-2 border-indigo-100 rounded-lg px-2 py-2 outline-none font-black text-indigo-600 shadow-sm"
              />
            </div>
            <div className="flex-1 sm:flex-none flex flex-col">
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full text-xs bg-white border-2 border-indigo-100 rounded-lg px-2 py-2 outline-none font-black text-indigo-600 cursor-pointer shadow-sm appearance-none"
              >
                {CLASSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Student Grid */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border-2 ${config.sheetId ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <div className={`w-2 h-2 rounded-full ${config.sheetId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {config.sheetId ? 'Cloud Active' : 'Local Mode'}
              </span>
            </div>
            {error && (
              <div className="px-4 py-1.5 bg-rose-50 border-2 border-rose-200 rounded-full text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-bounce">
                <AlertTriangle size={12} />
                {error}
              </div>
            )}
          </div>
          
          <div className="hidden sm:flex gap-2">
            <button 
              onClick={syncData}
              disabled={isSyncing}
              className="text-[10px] bg-white border-2 border-blue-200 text-blue-600 px-4 py-2 rounded-xl font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Download size={12} className={isSyncing ? 'animate-bounce' : ''} />
              SYNC DATA
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-[10px] bg-white border-2 border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-black hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Settings size={12} />
              SETTINGS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student) => (
              <StudentCard 
                key={student.id} 
                student={student} 
                onStatusChange={handleStatusChange} 
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <Search size={40} className="text-slate-200" />
            <p className="text-slate-400 font-bold text-sm">Tiada murid...</p>
          </div>
        )}
        
        {/* Summary Footer */}
        <div className="mt-8">
           <Summary students={students} />
        </div>
      </main>

      {/* Bottom Action Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 sm:hidden flex items-center justify-between gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <button 
          onClick={syncData}
          disabled={isSyncing}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 text-slate-600 active:scale-95 transition-all"
        >
          <div className="bg-slate-100 p-2 rounded-lg">
            <Download size={20} className={isSyncing ? 'animate-bounce' : ''} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tight">Sync</span>
        </button>
        
        <button 
          onClick={async () => {
            if (!config.gasUrl) {
              alert("Sila sediakan GAS Web App URL di dalam Tetapan");
              setIsSettingsOpen(true);
              return;
            }
            setIsSyncing(true);
            try {
              await fetch(config.gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(students)
              });
              alert("Data berjaya dihantar!");
            } catch (err) {
              alert("Gagal menghantar.");
            } finally {
              setIsSyncing(false);
            }
          }}
          disabled={isSyncing}
          className="flex-[2] bg-blue-600 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all"
        >
          <Save size={18} className={isSyncing ? 'animate-spin' : ''} />
          <span className="text-xs font-black uppercase tracking-widest">SAVE CLOUD</span>
        </button>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 text-slate-600 active:scale-95 transition-all"
        >
          <div className="bg-slate-100 p-2 rounded-lg">
            <Settings size={20} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tight">Setup</span>
        </button>
      </div>
    </div>
  );
}

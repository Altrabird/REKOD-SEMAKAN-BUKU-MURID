import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Users, 
  User,
  Settings, 
  ChevronRight, 
  Search, 
  Filter,
  RefreshCw,
  BookMarked,
  LayoutDashboard,
  Download,
  AlertTriangle,
  Save,
  FileText
} from 'lucide-react';
import StudentCard from './components/StudentCard';
import Summary from './components/Summary';
import { Student, SubmissionStatus, ClassData } from './types';
import { REASONS } from './constants';
import { fetchStudentsFromSheet } from './services/googleSheetsService';
import RecordsModal from './components/RecordsModal';
import { generatePDF } from './services/pdfService';
import { uploadEvidence } from './services/supabaseService';

const SHEET_ID = (import.meta as any).env.VITE_GOOGLE_SHEETS_ID;
const API_KEY = (import.meta as any).env.VITE_GOOGLE_API_KEY;
const CSV_URL = (import.meta as any).env.VITE_GOOGLE_SHEET_CSV_URL;

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);

  // Reusable fetch function
  const refreshData = async () => {
    if (!CSV_URL && (!SHEET_ID || !API_KEY)) {
      setError("Sila masukkan VITE_GOOGLE_SHEET_CSV_URL atau API Key dalam menu Settings.");
      return;
    }

    setIsSyncing(true);
    setError(null);
    try {
      const data = await fetchStudentsFromSheet(SHEET_ID, API_KEY, CSV_URL);
      setStudents(data);
      
      // Extract unique classes
      const uniqueClasses = Array.from(new Set(data.map(s => s.classId))).filter(Boolean).sort();
      const classObjects = uniqueClasses.map(c => ({ id: c!, name: c! }));
      setClasses(classObjects);
      
      if (classObjects.length > 0 && !selectedClass) {
        setSelectedClass(classObjects[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat turun data.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    refreshData();
  }, []);

  // Filter students based on search AND selected class
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = s.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleStatusChange = (id: string, status: SubmissionStatus, reason?: string, evidenceUrl?: string) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, status, reason: status === 'not_submitted' ? reason : undefined, evidenceUrl: evidenceUrl || s.evidenceUrl } : s
    ));
  };

  const handleReset = () => {
    console.log('Resetting all student statuses to pending...');
    setStudents(prev => prev.map(s => ({ 
      ...s, 
      status: 'pending' as const, 
      reason: undefined, 
      evidenceUrl: undefined 
    })));
  };

  const handleMarkAllSubmitted = () => {
    // Determine which class name for logging/debugging
    const currentClassName = classes.find(c => c.id === selectedClass)?.name || selectedClass;
    console.log(`Marking all as submitted for class: ${currentClassName}`);

    setStudents(prev => {
      const newState = prev.map(s => {
        // If student belongs to currently selected class, mark as submitted
        if (s.classId === selectedClass) {
          return { ...s, status: 'submitted' as const };
        }
        return s;
      });
      return newState;
    });
  };

  return (
    <div className="w-full min-h-screen font-sans flex flex-col overflow-x-hidden text-slate-800 pb-32 sm:pb-0">
      {/* Records Modal */}
      <RecordsModal 
        isOpen={isRecordsOpen}
        onClose={() => setIsRecordsOpen(false)}
        students={students.filter(s => s.classId === selectedClass)}
        date={selectedDate}
        className={classes.find(c => c.id === selectedClass)?.name || selectedClass}
        teacherName={teacherName}
        subjectName={subjectName}
        notes={notes}
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
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] hidden sm:block">{SHEET_ID ? 'AUTOMATIC GOOGLE SHEETS SYNC' : 'AWAITING GOOGLE SHEETS ID'}</p>
            </div>
          </div>
          
          <div className="flex sm:hidden items-center space-x-2">
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
                className="w-full text-xs bg-white border-2 border-indigo-100 rounded-lg px-2 py-2 outline-none font-black text-indigo-600 cursor-pointer shadow-sm appearance-none min-w-[120px]"
              >
                {classes.length > 0 ? (
                  classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                ) : (
                  <option value="">Tiada Kelas</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Info Section */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-1/3 flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Guru</label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
            <input 
              type="text" 
              placeholder="NAMA GURU..."
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-4 py-2 bg-blue-50/50 border-2 border-blue-100 rounded-xl text-xs font-black outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm uppercase"
            />
          </div>
        </div>
        <div className="w-full sm:w-1/3 flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subjek</label>
          <div className="relative group">
            <BookMarked className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={14} />
            <input 
              type="text" 
              placeholder="CONTOH: MATEMATIK..."
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-4 py-2 bg-indigo-50/50 border-2 border-indigo-100 rounded-xl text-xs font-black outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm uppercase"
            />
          </div>
        </div>
        <div className="w-full sm:w-1/3 flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan</label>
          <div className="relative group">
            <Settings className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="CATATAN TAMBAHAN..."
              value={notes}
              onChange={(e) => setNotes(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-xs font-black outline-none focus:border-slate-400 focus:bg-white transition-all shadow-sm uppercase"
            />
          </div>
        </div>
      </div>

      {/* Main Student Grid */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-700 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Data Murid: {students.length}
              </span>
            </div>
            {error && (
              <div className="px-4 py-1.5 bg-rose-50 border-2 border-rose-200 rounded-full text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={12} />
                {error}
              </div>
            )}
            {isSyncing && (
               <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                <RefreshCw size={14} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Memuat Turun...</span>
               </div>
            )}
          </div>
          
          <div className="hidden sm:flex gap-2">
            <button 
              onClick={refreshData}
              className={`text-[10px] bg-white border-2 border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 shadow-sm active:scale-95 ${isSyncing ? 'animate-pulse opacity-70' : 'hover:bg-slate-600 hover:text-white hover:border-slate-600'}`}
              disabled={isSyncing}
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              SYNC DATA
            </button>
            <button 
              onClick={handleMarkAllSubmitted}
              className="text-[10px] bg-white border-2 border-blue-200 text-blue-600 px-4 py-2 rounded-xl font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Users size={12} />
              SEMUA DISEMAK
            </button>
            <button 
              onClick={() => setIsRecordsOpen(true)}
              className="text-[10px] bg-white border-2 border-indigo-200 text-indigo-600 px-4 py-2 rounded-xl font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <FileText size={12} />
              PAPAR REKOD
            </button>
            <button 
              onClick={() => generatePDF(filteredStudents, selectedDate, classes.find(c => c.id === selectedClass)?.name || selectedClass, teacherName, subjectName, notes)}
              className="text-[10px] bg-white border-2 border-emerald-200 text-emerald-600 px-4 py-2 rounded-xl font-black hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Download size={12} />
              PDF REPORT
            </button>
            <button 
              onClick={handleReset}
              className="text-[10px] bg-white border-2 border-rose-200 text-rose-600 px-4 py-2 rounded-xl font-black hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <RefreshCw size={12} />
              RESET STATUS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 mb-20 md:mb-10">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student: Student) => (
              <StudentCard 
                key={student.id} 
                student={student} 
                onStatusChange={handleStatusChange}
                onUploadEvidence={uploadEvidence}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredStudents.length > 0 && <Summary students={filteredStudents} />}
      </main>

      {/* Bottom Action Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t-2 border-slate-100 p-4 sm:hidden flex items-center justify-around gap-4 z-50">
        <button 
          onClick={handleMarkAllSubmitted}
          className="flex-1 flex flex-col items-center justify-center gap-1.5 text-blue-600 active:scale-90 transition-all"
        >
          <div className="bg-blue-100 p-2.5 rounded-2xl shadow-sm">
            <Users size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Tanda Semua</span>
        </button>

        <button 
          onClick={() => setIsRecordsOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1.5 text-indigo-600 active:scale-90 transition-all"
        >
          <div className="bg-indigo-100 p-2.5 rounded-2xl shadow-sm">
            <FileText size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Rekod</span>
        </button>

        <button 
          onClick={() => generatePDF(filteredStudents, selectedDate, classes.find(c => c.id === selectedClass)?.name || selectedClass, teacherName, subjectName, notes)}
          className="flex-1 flex flex-col items-center justify-center gap-1.5 text-emerald-600 active:scale-90 transition-all"
        >
          <div className="bg-emerald-100 p-2.5 rounded-2xl shadow-sm">
            <Download size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">PDF</span>
        </button>

        <button 
          onClick={handleReset}
          className="flex-1 flex flex-col items-center justify-center gap-1.5 text-rose-600 active:scale-90 transition-all"
        >
          <div className="bg-rose-100 p-2.5 rounded-2xl shadow-sm">
            <RefreshCw size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
        </button>
      </div>
    </div>
  );
}

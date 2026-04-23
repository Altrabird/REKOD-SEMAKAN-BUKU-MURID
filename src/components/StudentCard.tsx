import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Camera, Image as ImageIcon, Loader2, CheckCircle2, UserCircle } from 'lucide-react';
import { Student, SubmissionStatus } from '../types';
import { REASONS } from '../constants';

interface StudentCardProps {
  student: Student;
  onStatusChange: (id: string, status: SubmissionStatus, reason?: string, evidenceUrl?: string) => void;
  onUploadEvidence: (file: File, studentId: string) => Promise<string>;
  key?: string | number;
}

export default function StudentCard({ student, onStatusChange, onUploadEvidence }: StudentCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmitted = student.status === 'submitted';
  const isNotSubmitted = student.status === 'not_submitted';

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await onUploadEvidence(file, student.id);
      onStatusChange(student.id, student.status, student.reason, url);
    } catch (err) {
      alert("Gagal memuat naik evidens.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative p-3 rounded-2xl border-2 flex flex-col items-center transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] ${
        isSubmitted 
          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-500 shadow-emerald-100' 
          : isNotSubmitted 
            ? 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-500 shadow-rose-100' 
            : 'bg-white border-slate-200 hover:border-blue-400'
      }`}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
      />

      <div className="flex flex-col items-center text-center space-y-2 w-full">
        {/* Profile / Evidence Icon */}
        <div 
          onClick={handleUploadClick}
          className={`group relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-1 shadow-inner cursor-pointer overflow-hidden ${
          student.gender === 'L' ? 'bg-blue-600 text-white shadow-blue-400' : 
          student.gender === 'P' ? 'bg-pink-500 text-white shadow-pink-300' :
          'bg-slate-700 text-white shadow-slate-500'
        }`}>
          {student.evidenceUrl ? (
            <img src={student.evidenceUrl} alt="Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <>
              {student.gender === 'L' ? <span className="text-2xl sm:text-3xl">👦</span> : 
               student.gender === 'P' ? <span className="text-2xl sm:text-3xl">👧</span> : 
               <UserCircle className="w-8 h-8" />}
            </>
          )}
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isUploading ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" size={20} />}
          </div>
        </div>

        {/* Name */}
        <h3 className="text-[10px] sm:text-[11px] font-black text-slate-900 leading-tight min-h-[40px] flex items-center justify-center uppercase tracking-tight px-1 py-1">
          {student.name}
        </h3>

        {/* Main Action Area */}
        <div className="w-full space-y-1.5">
          {!isSubmitted && !isNotSubmitted && (
            <button
              onClick={() => onStatusChange(student.id, 'submitted')}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all uppercase tracking-widest active:scale-90"
            >
              HANTAR
            </button>
          )}

          {isSubmitted && (
            <div className="flex flex-col items-center gap-1">
              <div className="w-full flex items-center justify-center bg-emerald-600 text-white px-2 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md">
                SELESAI
              </div>
              {student.evidenceUrl && (
                <span className="text-[8px] font-black text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={10} /> EVIDENS ADA
                </span>
              )}
            </div>
          )}

          {isNotSubmitted && (
            <div className="flex items-center justify-center bg-rose-600 text-white px-2 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md">
              TIADA
            </div>
          )}

          {/* Toggle Options */}
          <div className="flex justify-center items-center pt-2 border-t border-slate-200/50 mt-1">
            {!isSubmitted && (
               <button
                onClick={() => onStatusChange(student.id, isNotSubmitted ? 'pending' : 'not_submitted')}
                className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter transition-all active:bg-slate-100 ${
                  isNotSubmitted ? 'text-slate-400 hover:text-slate-600' : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                {isNotSubmitted ? 'BATAL' : 'TIADA BUKU'}
              </button>
            )}
            
            {isSubmitted && (
              <button
                onClick={() => onStatusChange(student.id, 'pending')}
                className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-1 rounded-lg uppercase tracking-tighter transition-all"
              >
                BATAL HANTAR
              </button>
            )}
          </div>
        </div>

        {/* Reason Dropdown for Not Submitted */}
        <AnimatePresence>
          {isNotSubmitted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full overflow-hidden"
            >
              <select
                value={student.reason || ''}
                onChange={(e) => onStatusChange(student.id, 'not_submitted', e.target.value)}
                className="w-full bg-rose-50 border-2 border-rose-200 rounded-lg px-1 py-1.5 text-[9px] text-rose-700 outline-none focus:ring-4 focus:ring-rose-100 font-black appearance-none text-center uppercase tracking-tighter cursor-pointer"
              >
                <option value="">-- PILIH ALASAN --</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

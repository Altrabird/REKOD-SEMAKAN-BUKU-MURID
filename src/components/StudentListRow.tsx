import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Loader2, CheckCircle2, UserCircle, ExternalLink } from 'lucide-react';
import { Student, SubmissionStatus } from '../types';
import { REASONS } from '../constants';

interface StudentListRowProps {
  student: Student;
  onStatusChange: (id: string, status: SubmissionStatus, reason?: string, evidenceUrl?: string) => void;
  onUploadEvidence: (file: File, studentId: string) => Promise<string>;
}

export default function StudentListRow({ student, onStatusChange, onUploadEvidence }: StudentListRowProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmitted = student.status === 'submitted';
  const isNotSubmitted = student.status === 'not_submitted';

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await onUploadEvidence(file, student.id);
      onStatusChange(student.id, student.status, student.reason, url);
    } catch {
      alert('Gagal memuat naik evidens.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all shadow-sm ${
        isSubmitted
          ? 'bg-emerald-50 border-emerald-300'
          : isNotSubmitted
            ? 'bg-rose-50 border-rose-300'
            : 'bg-white border-slate-200 hover:border-blue-300'
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

      <div
        onClick={handleUploadClick}
        className={`group relative shrink-0 w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden shadow-inner ${
          student.gender === 'L' ? 'bg-blue-600 text-white' :
          student.gender === 'P' ? 'bg-pink-500 text-white' :
          'bg-slate-700 text-white'
        }`}
      >
        {student.evidenceUrl ? (
          <img src={student.evidenceUrl} alt="Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          student.gender === 'L' ? <span className="text-xl">👦</span> :
          student.gender === 'P' ? <span className="text-xl">👧</span> :
          <UserCircle className="w-6 h-6" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? <Loader2 className="animate-spin text-white" size={16} /> : <Camera className="text-white" size={16} />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{student.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{student.classId}</span>
          {isSubmitted && student.evidenceUrl && (
            <a
              href={student.evidenceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[9px] font-black text-emerald-600 flex items-center gap-1 hover:underline"
            >
              <CheckCircle2 size={10} /> EVIDENS <ExternalLink size={9} />
            </a>
          )}
          {isNotSubmitted && (
            <AnimatePresence>
              <motion.select
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                value={student.reason || ''}
                onChange={(e) => onStatusChange(student.id, 'not_submitted', e.target.value)}
                className="bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 text-[9px] text-rose-700 font-black outline-none uppercase cursor-pointer"
              >
                <option value="">-- PILIH ALASAN --</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </motion.select>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isSubmitted && !isNotSubmitted && (
          <>
            <button
              onClick={() => onStatusChange(student.id, 'submitted')}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow hover:from-blue-700 hover:to-indigo-700 active:scale-95"
            >
              HANTAR
            </button>
            <button
              onClick={() => onStatusChange(student.id, 'not_submitted')}
              className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 active:scale-95"
            >
              TIADA
            </button>
          </>
        )}

        {isSubmitted && (
          <>
            <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow">SELESAI</span>
            <button
              onClick={() => onStatusChange(student.id, 'pending')}
              className="px-2 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 active:scale-95"
            >
              BATAL
            </button>
          </>
        )}

        {isNotSubmitted && (
          <>
            <span className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow">TIADA</span>
            <button
              onClick={() => onStatusChange(student.id, 'pending')}
              className="px-2 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95"
            >
              BATAL
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

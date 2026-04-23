import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserCircle, ChevronDown, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Student, SubmissionStatus } from '../types';
import { REASONS } from '../constants';

interface StudentCardProps {
  student: Student;
  onStatusChange: (id: string, status: SubmissionStatus, reason?: string) => void;
  key?: string | number;
}

export default function StudentCard({ student, onStatusChange }: StudentCardProps) {
  const isSubmitted = student.status === 'submitted';
  const isNotSubmitted = student.status === 'not_submitted';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative p-3 rounded-xl border flex flex-col items-center transition-all duration-200 shadow-sm ${
        isSubmitted 
          ? 'bg-green-50 border-2 border-green-500' 
          : isNotSubmitted 
            ? 'bg-white border-slate-200 border-l-4 border-l-red-500' 
            : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-col items-center text-center space-y-2 w-full">
        {/* Gender Icon */}
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 ${
          student.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
        }`}>
          {student.gender === 'L' ? <span className="text-xl sm:text-2xl">👦</span> : <span className="text-xl sm:text-2xl">👧</span>}
        </div>

        {/* Name */}
        <h3 className="text-[10px] sm:text-[11px] font-black text-slate-900 leading-tight h-8 flex items-center justify-center uppercase tracking-tight overflow-hidden">
          {student.name}
        </h3>

        {/* Main Action Area */}
        <div className="w-full space-y-1">
          {!isSubmitted && !isNotSubmitted && (
            <button
              onClick={() => onStatusChange(student.id, 'submitted')}
              className="w-full py-2 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black hover:bg-blue-500 hover:text-white transition-all uppercase tracking-tighter active:scale-95"
            >
              HANTAR
            </button>
          )}

          {isSubmitted && (
            <div className="flex items-center justify-center bg-green-500 text-white px-2 py-1 rounded-full font-black text-[10px] uppercase tracking-tighter">
              SIAP
            </div>
          )}

          {isNotSubmitted && (
            <div className="flex items-center justify-center text-red-600 font-black text-[10px] uppercase py-1.5">
              TIADA
            </div>
          )}

          {/* Toggle Options */}
          <div className="flex justify-center items-center pt-1 border-t border-slate-100 mt-1">
            {!isSubmitted && (
               <button
                onClick={() => onStatusChange(student.id, isNotSubmitted ? 'pending' : 'not_submitted')}
                className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter transition-colors active:bg-slate-100 ${
                  isNotSubmitted ? 'text-slate-400 hover:text-slate-600' : 'text-red-500 hover:bg-red-50'
                }`}
              >
                {isNotSubmitted ? 'BATAL' : 'TIADA BUKU'}
              </button>
            )}
            
            {isSubmitted && (
              <button
                onClick={() => onStatusChange(student.id, 'pending')}
                className="text-[9px] font-black text-slate-400 hover:text-slate-600 px-2 py-1 uppercase tracking-tighter active:bg-slate-100"
              >
                UNSUBMIT
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
                className="w-full bg-red-50 border border-red-200 rounded px-1 py-1.5 text-[9px] text-red-700 outline-none focus:ring-1 focus:ring-red-400 font-black appearance-none text-center"
              >
                <option value="">-- ALASAN --</option>
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

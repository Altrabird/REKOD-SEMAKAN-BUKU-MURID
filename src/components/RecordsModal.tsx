import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Download, UserCheck, UserX, Clock } from 'lucide-react';
import { Student } from '../types';
import { generatePDF } from '../services/pdfService';

interface RecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  date: string;
  className: string;
  teacherName: string;
  subjectName: string;
  notes: string;
}

export default function RecordsModal({ isOpen, onClose, students, date, className, teacherName, subjectName, notes }: RecordsModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    generatePDF(students, date, className, teacherName, subjectName, notes);
  };

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
          className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh] border-4 border-white"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md ring-1 ring-white/50">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Rekod Semakan Semasa</h2>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Laporan Detail: {className} • {date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDownload}
                className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-black/10"
              >
                <Download size={16} />
                Download PDF
              </button>
              <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-sm active:scale-90">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">
            <div className="bg-slate-50 rounded-3xl border-2 border-slate-100 overflow-hidden shadow-inner">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-16">No</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Murid</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-24 text-center">Jantina</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Alasan / Catatan</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-24 text-center">Evidens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-white transition-colors">
                      <td className="px-6 py-4 text-xs font-black text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 uppercase">{student.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                          student.gender === 'L' ? 'bg-blue-100 text-blue-600' : 
                          student.gender === 'P' ? 'bg-pink-100 text-pink-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {student.gender === 'L' ? 'LELAKI' : student.gender === 'P' ? 'PEREMPUAN' : 'UMUM'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {student.status === 'submitted' && (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <UserCheck size={14} />
                              <span className="text-[10px] font-black uppercase">Siap</span>
                            </div>
                          )}
                          {student.status === 'not_submitted' && (
                            <div className="flex items-center gap-1.5 text-rose-600">
                              <UserX size={14} />
                              <span className="text-[10px] font-black uppercase">Tiada</span>
                            </div>
                          )}
                          {student.status === 'pending' && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock size={14} />
                              <span className="text-[10px] font-black uppercase tracking-tighter">Belum Semak</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.status === 'not_submitted' ? (
                          <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-rose-100">
                             {student.reason || 'Tiada Alasan'}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px] font-bold">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.evidenceUrl ? (
                          <a 
                            href={student.evidenceUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[9px] font-black hover:bg-emerald-200 transition-all uppercase"
                          >
                            LIHAT
                          </a>
                        ) : (
                          <span className="text-slate-300 text-[10px] font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-8">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hantar: {students.filter(s => s.status === 'submitted').length}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tiada: {students.filter(s => s.status === 'not_submitted').length}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Belum: {students.filter(s => s.status === 'pending').length}</span>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

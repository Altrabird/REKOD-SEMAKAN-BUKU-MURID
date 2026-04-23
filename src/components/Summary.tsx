import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, BookX, CheckCircle, AlertCircle } from 'lucide-react';
import { Student } from '../types';

interface SummaryProps {
  students: Student[];
}

export default function Summary({ students }: SummaryProps) {
  const total = students.length;
  const submittedList = students.filter(s => s.status === 'submitted');
  const notSubmittedList = students.filter(s => s.status === 'not_submitted');
  const pendingList = students.filter(s => s.status === 'pending');
  
  const submittedCount = submittedList.length;
  const notSubmittedCount = notSubmittedList.length;

  return (
    <footer className="mt-12 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative shadow-blue-500/10 mb-20 md:mb-6">
      {/* Dynamic Progress Bar */}
      <div className="h-2 w-full bg-slate-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${total > 0 ? (submittedCount / total) * 100 : 0}%` }}
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
        />
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">JUMLAH MURID</p>
            <p className="text-2xl font-black text-white">{total}</p>
          </div>
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">SIAP HANTAR</p>
            <p className="text-2xl font-black text-emerald-400">{submittedCount}</p>
          </div>
          <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">TIADA BUKU</p>
            <p className="text-2xl font-black text-rose-400">{notSubmittedCount}</p>
          </div>
          <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">TAHAP SEMAKAN</p>
            <p className="text-2xl font-black text-blue-300">{total > 0 ? Math.round((submittedCount / total) * 100) : 0}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3 px-2 border-l-4 border-emerald-500">
                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">SENARAI SIAP</p>
                <div className="h-px flex-1 bg-slate-800" />
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{submittedCount}</span>
             </div>
             <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 h-32 overflow-y-auto custom-scrollbar-dark ring-1 ring-inset ring-white/5">
                {submittedList.length > 0 ? (
                  <p className="text-[11px] text-slate-300 font-bold leading-relaxed">
                    {submittedList.map(s => s.name).join(' • ')}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 font-black italic">Belum ada murid yang hantar...</p>
                )}
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3 px-2 border-l-4 border-rose-500">
                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">MASALAH PENGHANTARAN</p>
                <div className="h-px flex-1 bg-slate-800" />
                <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{notSubmittedList.length}</span>
             </div>
             <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 h-32 overflow-y-auto custom-scrollbar-dark ring-1 ring-inset ring-white/5">
                {notSubmittedList.length > 0 ? (
                   <ul className="space-y-2">
                     {notSubmittedList.map(s => (
                       <li key={s.id} className="text-[11px] text-slate-300 font-bold flex justify-between items-center group">
                         <span>{s.name}</span>
                         <span className="text-[9px] text-rose-400 font-black uppercase bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 group-hover:bg-rose-500/20 transition-all">
                           {s.reason || 'TIADA BUKU'}
                         </span>
                       </li>
                     ))}
                   </ul>
                ) : (
                  <p className="text-[10px] text-slate-500 font-black italic">Semua dalam keadaan baik atau belum disemak...</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function StatCard({ label, count, color, icon }: { label: string, count: number, color: string, icon: React.ReactNode }) {
  return (
    <div className={`p-4 rounded-2xl flex items-center justify-between ${color}`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-2xl font-black">{count}</p>
      </div>
      <div className="opacity-50">
        {icon}
      </div>
    </div>
  );
}

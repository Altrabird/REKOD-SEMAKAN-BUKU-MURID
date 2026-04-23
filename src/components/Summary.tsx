import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, BookX, CheckCircle, AlertCircle } from 'lucide-react';
import { Student } from '../types';

interface SummaryProps {
  students: Student[];
}

export default function Summary({ students }: SummaryProps) {
  const submitted = students.filter(s => s.status === 'submitted');
  const notSubmitted = students.filter(s => s.status !== 'submitted'); // Design shows total vs hantar/tidak hantar

  return (
    <footer className="mt-12 bg-slate-900 text-white p-6 grid grid-cols-1 md:grid-cols-12 gap-6 border-t border-slate-700 rounded-2xl md:rounded-none">
      {/* Col 1: Summary Stats */}
      <div className="col-span-1 md:col-span-3 space-y-4">
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Rumusan Kelas</h3>
        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
          <span className="text-sm text-slate-400">Bilangan hantar:</span>
          <span className="text-2xl font-bold text-green-400">{submitted.length}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
          <span className="text-sm text-slate-400">Bilangan tidak hantar:</span>
          <span className="text-2xl font-bold text-red-400">{notSubmitted.length}</span>
        </div>
      </div>

      {/* Col 2: Hantar List */}
      <div className="col-span-1 md:col-span-4 md:border-l border-slate-700 md:pl-6">
        <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">Senarai Hantar</h3>
        <div className="grid grid-cols-2 gap-x-2 text-[10px] text-slate-300 max-h-32 overflow-y-auto custom-scrollbar">
          {submitted.length > 0 ? (
            submitted.map(s => (
              <span key={s.id} className="truncate">• {s.name}</span>
            ))
          ) : (
            <span className="text-slate-500 italic">Tiada data</span>
          )}
        </div>
      </div>

      {/* Col 3: Tidak Hantar Tags */}
      <div className="col-span-1 md:col-span-5 md:border-l border-slate-700 md:pl-6">
        <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Status Murid Lain</h3>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
          {students.filter(s => s.status !== 'submitted').map(s => (
            <div key={s.id} className="bg-slate-800 rounded px-2 py-1 flex items-center">
              <span className={`text-[10px] font-bold ${s.status === 'not_submitted' ? 'text-red-400' : 'text-slate-200'}`}>
                {s.name}
              </span>
              <span className={`text-[9px] ml-2 px-1 rounded uppercase font-black ${
                s.status === 'not_submitted' 
                  ? 'bg-red-900/50 text-red-300' 
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {s.status === 'not_submitted' ? (s.reason || 'TIADA BUKU') : 'PENDING'}
              </span>
            </div>
          ))}
          {students.filter(s => s.status !== 'submitted').length === 0 && (
            <span className="text-slate-500 italic text-xs">Semua murid telah hantar.</span>
          )}
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

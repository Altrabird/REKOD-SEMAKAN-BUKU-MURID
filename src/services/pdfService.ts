import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student } from '../types';

export function generatePDF(students: Student[], date: string, className: string, teacherName: string, subjectName: string, notes: string) {
  const doc = new jsPDF();
  const themeColor = [37, 99, 235]; // blue-600

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text('LAPORAN SEMAKAN BUKU KERJA', 14, 20);

  // Subheader Info
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Tarikh: ${date}`, 14, 28);
  doc.text(`Kelas: ${className}`, 60, 28);
  doc.text(`Guru: ${teacherName || '-'}`, 14, 33);
  doc.text(`Subjek: ${subjectName || '-'}`, 60, 33);
  doc.text(`Catatan: ${notes || '-'}`, 14, 38);
  doc.text(`Dihasilkan pada: ${new Date().toLocaleString()}`, 110, 38);

  // Table Data
  const tableData = students.map((s, index) => [
    index + 1,
    s.name,
    s.status === 'submitted' ? 'Hantar' : (s.status === 'not_submitted' ? 'Tidak Hantar' : 'Belum Semak'),
    s.reason || '-',
    s.evidenceUrl ? 'ADA' : '-'
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['No', 'Nama Murid', 'Status', 'Alasan (Jika Tiada)', 'Evidens']],
    body: tableData as any,
    headStyles: { 
      fillColor: themeColor as any, 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Summary at the end
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const submitted = students.filter(s => s.status === 'submitted').length;
  const total = students.length;

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('RUMUSAN:', 14, finalY);
  doc.setFontSize(10);
  doc.text(`Jumlah Murid: ${total}`, 14, finalY + 7);
  doc.text(`Siap Hantar: ${submitted}`, 14, finalY + 12);
  doc.text(`Tidak Hantar: ${total - submitted}`, 14, finalY + 17);
  doc.text(`Peratusan: ${total > 0 ? Math.round((submitted / total) * 100) : 0}%`, 14, finalY + 22);

  doc.save(`Laporan_SSB_${className}_${date}.pdf`);
}

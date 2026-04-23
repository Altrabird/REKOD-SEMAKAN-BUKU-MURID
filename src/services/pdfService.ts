import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student } from '../types';

export function generatePDF(students: Student[], date: string, className: string) {
  const doc = new jsPDF();
  const themeColor = [37, 99, 235]; // blue-600

  // Header Title
  doc.setFontSize(20);
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text('LAPORAN SEMAKAN BUKU KERJA', 14, 22);

  // Subheader
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Tarikh: ${date}  |  Kelas: ${className}`, 14, 30);
  doc.text(`Dihasilkan pada: ${new Date().toLocaleString()}`, 14, 35);

  // Table Data
  const tableData = students.map((s, index) => [
    index + 1,
    s.name,
    s.gender || '-',
    s.status === 'submitted' ? 'Hantar' : (s.status === 'not_submitted' ? 'Tidak Hantar' : 'Belum Semak'),
    s.reason || '-',
    s.evidenceUrl ? 'ADA' : '-'
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['No', 'Nama Murid', 'Jantina', 'Status', 'Alasan (Jika Tiada)', 'Evidens']],
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

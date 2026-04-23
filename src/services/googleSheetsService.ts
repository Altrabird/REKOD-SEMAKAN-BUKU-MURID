import { Student } from '../types';

/**
 * Service to fetch student data from Google Sheets or CSV export.
 * Default structure: A(Name), B(Class), C(Sesi)
 */
export async function fetchStudentsFromSheet(sheetId?: string, apiKey?: string, csvUrl?: string): Promise<Student[]> {
  try {
    let rows: any[][] = [];

    if (csvUrl) {
      // Fetch from Public CSV (No API Key needed)
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('Gagal memuat turun data CSV. Sila pastikan link "Publish to Web" adalah betul.');
      
      const csvData = await response.text();
      // Simple CSV parser for A,B,C columns (ignoring header)
      const lines = csvData.split(/\r?\n/).slice(1); // Skip header row
      rows = lines
        .filter(line => line.trim())
        .map(line => {
          // Handle quoted values simple way
          return line.split(',').map(cell => cell.replace(/^"(.*)"$/, '$1').trim());
        });
    } else if (sheetId && apiKey) {
      // Fetch from Google Sheets API
      const range = 'Students!A2:C'; 
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Gagal memuat turun data dari Google Sheets API.');
      
      const data = await response.json();
      rows = data.values || [];
    } else {
      throw new Error('Tiada konfigurasi Google Sheets ditemui (CSV URL atau API Key).');
    }
    
    return rows.map((row: any[], index: number) => ({
      id: `s-${index + 2}`,
      name: row[0] || 'Unknown',
      classId: row[1] || 'UMUM',
      sesi: row[2] || '',
      status: 'pending' as const
    }));
  } catch (error) {
    console.error('Sheet fetch error:', error);
    throw error;
  }
}

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
      // Added timestamp to bypass browser cache for real-time updates
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(csvUrl + (csvUrl.includes('?') ? '&' : '') + cacheBuster);
      if (!response.ok) throw new Error('Gagal memuat turun data CSV. Sila pastikan link "Publish to Web" adalah betul.');
      
      const csvData = await response.text();
      // Improved CSV parser that handles quoted commas (header row skipped)
      const lines = csvData.split(/\r?\n/).slice(1); 
      rows = lines
        .filter(line => line.trim())
        .map(line => {
          // Robust regex for CSV: splits by comma but ignores commas inside double quotes. 
          // Removed \s from exclusion to allow spaces in names and class names.
          const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
          const matches = line.match(regex);
          return matches ? matches.map(cell => cell.replace(/^"(.*)"$/, '$1').trim()) : [];
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
    
    console.log('Sample Row 0:', rows[0]); // Debugging: verify what column A and B contain

    return rows.map((row: any[], index: number) => ({
      id: `s-${index + 2}`,
      name: row[0] || 'Unknown',      // Column A: Full Name
      classId: row[1] || 'UMUM',     // Column B: Class (e.g. 1 INOVATIF)
      sesi: row[2] || '',
      status: 'pending' as const
    }));
  } catch (error) {
    console.error('Sheet fetch error:', error);
    throw error;
  }
}

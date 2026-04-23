import { Student } from '../types';

/**
 * Service to fetch student data from Google Sheets.
 * Expects a sheet with columns: ID, Name, Gender (L/P), Class (Optional)
 */
export async function fetchStudentsFromSheet(sheetId: string, apiKey: string, sheetName: string = 'Sheet1'): Promise<Student[]> {
  try {
    const range = `${sheetName}!A2:D`; 
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch from Google Sheets. Ensure sheet name and API Key are correct.');
    
    const data = await response.json();
    const rows = data.values || [];
    
    return rows.map((row: any[], index: number) => ({
      id: row[0] || `s-${index}`,
      name: row[1] || 'Unknown',
      gender: (row[2] === 'P' ? 'P' : 'L') as 'L' | 'P',
      classId: row[3] || undefined,
      status: 'pending' as const
    }));
  } catch (error) {
    console.error('Sheet fetch error:', error);
    throw error;
  }
}

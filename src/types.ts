export type Gender = 'L' | 'P';
export type SubmissionStatus = 'pending' | 'submitted' | 'not_submitted';

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  status: SubmissionStatus;
  reason?: string;
  classId?: string;
}

export interface ClassData {
  id: string;
  name: string;
}

export interface WorkbookSheetData {
  students: Student[];
}

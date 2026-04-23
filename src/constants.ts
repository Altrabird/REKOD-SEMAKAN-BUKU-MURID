import { ClassData } from './types';

export const REASONS = [
  "Tiada buku",
  "Tidak sempat tulis & jawab",
  "Buku hilang",
  "Lupa bawa",
  "Sakit / Tidak hadir",
  "Lain-lain"
];

export const CLASSES: ClassData[] = [
  { id: '1A', name: '1 Amanah' },
  { id: '1B', name: '1 Bijak' },
  { id: '2A', name: '2 Amanah' },
  { id: '2B', name: '2 Bijak' },
];

export const MOCK_STUDENTS = [
  { id: '1', name: 'Ahmad bin Ali', gender: 'L' as const, status: 'pending' as const },
  { id: '2', name: 'Siti binti Abu', gender: 'P' as const, status: 'pending' as const },
  { id: '3', name: 'Chong Wei', gender: 'L' as const, status: 'pending' as const },
  { id: '4', name: 'Mei Ling', gender: 'P' as const, status: 'pending' as const },
  { id: '5', name: 'Ramasamy', gender: 'L' as const, status: 'pending' as const },
  { id: '6', name: 'Fatimah', gender: 'P' as const, status: 'pending' as const },
];

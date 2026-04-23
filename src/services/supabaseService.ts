import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL dan Anon Key diperlukan. Sila lengkapkan persediaan di menu Settings.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

/**
 * Uploads an image to Supabase Storage and returns the public URL
 */
export async function uploadEvidence(file: File, studentId: string): Promise<string> {
  const supabase = getSupabase();
  const fileExt = file.name.split('.').pop();
  const fileName = `${studentId}-${Date.now()}.${fileExt}`;
  const filePath = `evidence/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('student-evidence')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    throw new Error('Gagal memuat naik imej ke Supabase');
  }

  const { data } = supabase.storage
    .from('student-evidence')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

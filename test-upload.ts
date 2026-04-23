import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
  console.log('Testing Supabase Storage Upload...');
  
  const bucketName = 'student-evidence';
  const fileName = `test-connection-${Date.now()}.txt`;
  const fileContent = 'Supabase Connection Test';

  try {
    // 1. Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) throw bucketError;
    
    if (!buckets.find(b => b.name === bucketName)) {
      console.error(`Error: Bucket "${bucketName}" not found. Please create it first.`);
      return;
    }
    console.log(`✅ Bucket "${bucketName}" found.`);

    // 2. Attempt Upload
    console.log(`Attempting to upload: ${fileName}...`);
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      if (uploadError.message.includes('row-level security')) {
        console.error('❌ FAILED: RLS Policy still blocking upload.');
        console.error('Message:', uploadError.message);
      } else {
        console.error('❌ FAILED: Upload error:', uploadError.message);
      }
      return;
    }

    console.log('🚀 SUCCESS! File uploaded successfully.');
    console.log('Data:', data);

    // 3. Cleanup (Optional but good)
    await supabase.storage.from(bucketName).remove([fileName]);
    console.log('🧹 Cleaned up test file.');

  } catch (err: any) {
    console.error('Unexpected error:', err.message);
  }
}

testUpload();

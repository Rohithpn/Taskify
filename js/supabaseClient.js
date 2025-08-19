const { createClient } = window.supabase;

const supabaseUrl = "https://rdqkfymxuppvznbinsbq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcWtmeW14dXBwdnpuYmluc2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTMwMjksImV4cCI6MjA3MDIyOTAyOX0.atK-YHisjknBzmM2NKFUogj4uM5vmE-0PL8HFGUk-Lk";

export const supabase = createClient(supabaseUrl, supabaseKey);
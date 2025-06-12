import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the entire application
const supabaseUrl = "https://hwwqkxwjzaufduacqjgs.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3d3FreHdqemF1ZmR1YWNxamdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2OTU4MTEsImV4cCI6MjA2MzI3MTgxMX0.5MHrJiJM1a_Jpwy4R1nHsnxl5Pc6kIVZ38KeJ_pWhQE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

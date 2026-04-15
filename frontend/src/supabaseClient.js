import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xgxgmbeytkrhudbazmdx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneGdtYmV5dGtyaHVkYmF6bWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzI5NzcsImV4cCI6MjA5MDgwODk3N30.nZhhmtU_3XBC8_5ZHncvq_tSYGyOOnJHvmvyLBdBHHo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

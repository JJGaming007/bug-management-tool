import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

export const createBrowserClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key',
  )

export const supabase = createBrowserClient()

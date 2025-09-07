// src/lib/supabase/client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * NOTE:
 * - During dev, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
 * - In production, make sure those env vars are set in your deployment provider.
 */

if (!supabaseUrl || !supabaseAnonKey) {
  // Avoid throwing here — throwing at import breaks the entire app render.
  // Instead, log a friendly message. When someone calls the stubbed methods,
  // they will receive a helpful error.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Supabase client will be a stub.'
  )
}

function createStub() {
  const err = () =>
    new Error(
      'Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
    )

  // Minimal stub that mimics the shape of the supabase client surface we commonly use.
  const stub: Partial<SupabaseClient> = {
    auth: {
      signInWithPassword: async () => {
        throw err()
      },
      signUp: async () => {
        throw err()
      },
      signOut: async () => {
        throw err()
      },
      getSession: async () => {
        throw err()
      },
      onAuthStateChange: () => ({ data: { subscription: null } }),
    } as any,
    from: (_table: string) => {
      return {
        select: async () => {
          throw err()
        },
        insert: async () => {
          throw err()
        },
        update: async () => {
          throw err()
        },
        delete: async () => {
          throw err()
        },
        eq: () => ({ select: async () => { throw err() } }),
        order: () => ({ select: async () => { throw err() } }),
      } as any
    },
    rpc: async () => {
      throw err()
    },
  }
  return stub as SupabaseClient
}

export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createStub()

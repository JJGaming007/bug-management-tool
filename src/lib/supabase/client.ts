import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Environment variables not configured.\n' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.\n' +
    'Copy .env.example to .env.local and fill in your Supabase project credentials.'
  )
}

/**
 * Create a stub client that returns empty data instead of throwing errors.
 * This allows the UI to render gracefully when Supabase isn't configured.
 */
function createStubClient(): SupabaseClient {
  const notConfiguredError = new Error(
    'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )

  // Create chainable query builder stub that acts like a Promise
  const createQueryStub = () => {
    const result = { data: null, error: notConfiguredError, count: null }
    const stub: Record<string, unknown> = {
      select: () => stub,
      insert: () => stub,
      update: () => stub,
      delete: () => stub,
      upsert: () => stub,
      eq: () => stub,
      neq: () => stub,
      gt: () => stub,
      gte: () => stub,
      lt: () => stub,
      lte: () => stub,
      like: () => stub,
      ilike: () => stub,
      is: () => stub,
      in: () => stub,
      contains: () => stub,
      containedBy: () => stub,
      order: () => stub,
      limit: () => stub,
      range: () => stub,
      single: () => stub,
      maybeSingle: () => stub,
      filter: () => stub,
      match: () => stub,
      textSearch: () => stub,
      or: () => stub,
      and: () => stub,
      not: () => stub,
      // Make it thenable to work with async/await
      then: (resolve: (value: typeof result) => void, reject?: (error: Error) => void) => {
        return Promise.resolve(result).then(resolve, reject)
      },
      catch: (handler: (error: Error) => void) => {
        return Promise.resolve(result).catch(handler)
      },
      finally: (handler: () => void) => {
        return Promise.resolve(result).finally(handler)
      },
    }
    return stub
  }

  const storageStub = {
    from: () => ({
      upload: async () => ({ data: null, error: notConfiguredError }),
      download: async () => ({ data: null, error: notConfiguredError }),
      remove: async () => ({ data: null, error: notConfiguredError }),
      list: async () => ({ data: null, error: notConfiguredError }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      createSignedUrl: async () => ({ data: null, error: notConfiguredError }),
    }),
    listBuckets: async () => ({ data: null, error: notConfiguredError }),
    createBucket: async () => ({ data: null, error: notConfiguredError }),
    deleteBucket: async () => ({ data: null, error: notConfiguredError }),
  }

  const authStub = {
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: notConfiguredError }),
    signUp: async () => ({ data: { user: null, session: null }, error: notConfiguredError }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    updateUser: async () => ({ data: { user: null }, error: notConfiguredError }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
    resetPasswordForEmail: async () => ({ data: null, error: notConfiguredError }),
  }

  return {
    auth: authStub,
    from: () => createQueryStub(),
    storage: storageStub,
    rpc: async () => ({ data: null, error: notConfiguredError }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
    }),
    removeChannel: async () => ({ error: null }),
    removeAllChannels: async () => [],
  } as unknown as SupabaseClient
}

// Create the Supabase client
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createStubClient()

// Helper to check connection status
export async function checkSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { connected: false, error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    if (error) {
      return { connected: false, error: error.message }
    }
    return { connected: true }
  } catch (e) {
    return { connected: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

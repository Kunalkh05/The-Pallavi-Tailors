import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate that a proper URL is configured
function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
        return false
    }
}

const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 20

// Create client with either real or dummy credentials
// The dummy client will fail gracefully on API calls, but won't crash on import
export const supabase: SupabaseClient = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
    isConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjYwMDAwMDAsImV4cCI6MTk0MTU3NjAwMH0.placeholder'
)

export { isConfigured as isSupabaseConfigured }

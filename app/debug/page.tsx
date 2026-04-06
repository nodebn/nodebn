import { getPublicSupabase } from "@/lib/supabase/public";

export default async function DebugPage() {
  console.log('🔍 DEBUG PAGE: Starting debug checks...')

  try {
    // Test database connection
    const supabase = getPublicSupabase()
    const { data, error } = await supabase
      .from('stores')
      .select('count')
      .limit(1)
      .single()

    console.log('🔍 DEBUG PAGE: Database test result:', { success: !error, error: error?.message })

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        <p>Check Vercel logs for debug output.</p>
        <p>Database connection: {error ? 'FAILED' : 'SUCCESS'}</p>
      </div>
    )
  } catch (err) {
    console.error('🔍 DEBUG PAGE: Unexpected error:', err)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Debug Page - Error</h1>
        <p>Check Vercel logs for details.</p>
      </div>
    )
  }
}
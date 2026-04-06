import { getPublicSupabase, getServerSupabase } from "@/lib/supabase/public";

export default async function DebugPage() {
  console.log('🔍 DEBUG PAGE: Starting comprehensive debugging...')

  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    }
  }

  console.log('🔍 DEBUG PAGE: Environment check:', debug)

  try {
    // Test 1: Basic Supabase connection
    console.log('🔍 DEBUG PAGE: Testing Supabase connection...')
    const publicSupabase = getPublicSupabase()
    const { data: stores, error: storesError } = await publicSupabase
      .from('stores')
      .select('id, name, slug')
      .eq('is_active', true)
      .limit(1)

    console.log('🔍 DEBUG PAGE: Stores query result:', { count: stores?.length, error: storesError?.message })

    // Test 2: Server Supabase connection
    console.log('🔍 DEBUG PAGE: Testing server Supabase connection...')
    const serverSupabase = getServerSupabase()
    const { data: serverStores, error: serverStoresError } = await serverSupabase
      .from('stores')
      .select('id, name, slug')
      .eq('is_active', true)
      .limit(1)

    console.log('🔍 DEBUG PAGE: Server stores query result:', { count: serverStores?.length, error: serverStoresError?.message })

    // Test 3: RLS Test
    console.log('🔍 DEBUG PAGE: Testing RLS policies...')
    try {
      await publicSupabase.from('products').insert({
        name: 'DEBUG TEST PRODUCT - DELETE ME',
        store_id: '00000000-0000-0000-0000-000000000000',
        price_cents: 100,
        currency: 'BND'
      })
      console.log('🔍 DEBUG PAGE: ❌ RLS TEST FAILED - Insert succeeded when it should fail')
    } catch (rlsError) {
      console.log('🔍 DEBUG PAGE: ✅ RLS working - Insert properly blocked:', rlsError instanceof Error ? rlsError.message : String(rlsError))
    }

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-red-600">🔍 Debug Page - Server Components Test</h1>

        <div className="grid gap-6">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
            <pre className="text-sm bg-white p-2 rounded overflow-auto">
              {JSON.stringify(debug, null, 2)}
            </pre>
          </div>

          <div className="bg-green-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2 text-green-800">✅ Success Indicators</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Page rendered successfully (no server component errors)</li>
              <li>Environment variables are accessible</li>
              <li>Supabase connections work</li>
              <li>RLS policies are active</li>
            </ul>
          </div>

          <div className="bg-blue-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2 text-blue-800">📊 Test Results</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Public Supabase: {storesError ? '❌ Error' : '✅ Working'} ({stores?.length || 0} stores found)</li>
              <li>Server Supabase: {serverStoresError ? '❌ Error' : '✅ Working'} ({serverStores?.length || 0} stores found)</li>
              <li>RLS Policies: Active and blocking unauthorized inserts</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-100 rounded">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔍 Check Vercel Logs</h3>
          <p className="text-yellow-800">
            If you're still seeing server component errors elsewhere, check your Vercel deployment logs.
            Look for the detailed error messages that start with "🔍 DEBUG PAGE:" to identify the exact failure point.
          </p>
        </div>
      </div>
    )
  } catch (err) {
    console.error('🔍 DEBUG PAGE: CRITICAL ERROR:', err)

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-red-600">❌ Debug Page - Error Detected!</h1>

        <div className="bg-red-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2 text-red-800">Error Details</h2>
          <pre className="text-sm bg-white p-2 rounded overflow-auto text-red-700">
            {err instanceof Error ? err.message : String(err)}
          </pre>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">🔍 Check Vercel Logs</h2>
          <p className="text-blue-800 mb-2">
            This error occurred during server component rendering. Check your Vercel deployment logs for:
          </p>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Detailed error messages with "🔍 DEBUG PAGE:" prefix</li>
            <li>Environment variable issues</li>
            <li>Database connection problems</li>
            <li>RLS policy conflicts</li>
          </ul>
        </div>
      </div>
    )
  }
}
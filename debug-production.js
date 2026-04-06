// Add this to your app/[slug]/page.tsx temporarily to debug production errors

// Add at the top of the component, before the first database query:
console.log('🔍 DEBUG: Page render started for slug:', params.slug)
console.log('🔍 DEBUG: Environment check:', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
  supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
})

// After each database query, add:
console.log('🔍 DEBUG: Store query result:', { store: !!store, error: error?.message })

// This will show in your Vercel logs and help identify where the error occurs
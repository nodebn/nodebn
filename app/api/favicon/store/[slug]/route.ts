import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const storeSlug = params.slug

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: store, error } = await supabase
      .from('stores')
      .select('logo_url')
      .eq('slug', storeSlug)
      .eq('is_active', true)
      .single()

    if (error || !store?.logo_url) {
      // Return default favicon if no store logo
      return NextResponse.redirect(new URL('/favicon.svg', request.url))
    }

    // Redirect to the store's logo URL
    return NextResponse.redirect(store.logo_url)

  } catch (error) {
    console.error('Favicon API error:', error)
    return NextResponse.redirect(new URL('/favicon.svg', request.url))
  }
}

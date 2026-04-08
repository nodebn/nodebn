import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  console.log('🔄 Revalidating storefront for slug:', slug);
  if (slug) {
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/categories/[category]`);
    revalidatePath(`/${slug}/[productSlug]`);
    console.log('✅ Revalidated paths:', `/${slug}`, `/${slug}/categories/[category]`, `/${slug}/[productSlug]`);
  }
  return new Response(JSON.stringify({
    revalidated: true,
    slug,
    timestamp: new Date().toISOString(),
    cacheBust: Date.now()
  }), {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
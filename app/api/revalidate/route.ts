import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  console.log('Revalidating slug:', slug);
  if (slug) {
    revalidatePath(`/${slug}`);
    console.log('Revalidated path:', `/${slug}`);
  }
  return Response.json({ revalidated: true });
}
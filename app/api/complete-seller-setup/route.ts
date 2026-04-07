import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface CompleteSetupRequest {
  token: string;
  password: string;
  storeName: string;
  storeSlug: string;
  whatsappNumber?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteSetupRequest = await request.json();
    const { token, password, storeName, storeSlug, whatsappNumber } = body;

    // Validate input
    if (!token || !password || !storeName || !storeSlug) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!storeSlug.match(/^[a-z0-9-]+$/)) {
      return NextResponse.json(
        { error: 'Store slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify the token again and get email
    const { data: tokenData, error: tokenError } = await supabase
      .from('seller_verification_tokens')
      .select('email, expires_at, used_at')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (tokenData.used_at) {
      return NextResponse.json(
        { error: 'Verification token has already been used' },
        { status: 400 }
      );
    }

    const email = tokenData.email;

    // Check if store slug is already taken
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', storeSlug)
      .single();

    if (existingStore) {
      return NextResponse.json(
        { error: 'Store URL slug is already taken. Please choose a different one.' },
        { status: 409 }
      );
    }

    // Create the user account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since they verified via our system
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Create the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        name: storeName,
        slug: storeSlug,
        owner_id: userId,
        whatsapp_number: whatsappNumber || null,
        is_active: true,
      })
      .select('id')
      .single();

    if (storeError) {
      console.error('Store creation error:', storeError);

      // Clean up the auth user if store creation fails
      await supabase.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: 'Failed to create store' },
        { status: 500 }
      );
    }

    // Mark verification token as used
    const { error: updateError } = await supabase
      .from('seller_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (updateError) {
      console.error('Token update error:', updateError);
      // Don't fail the whole process for this
    }

    console.log(`Seller account created: ${email}, store: ${storeSlug}`);

    return NextResponse.json({
      success: true,
      message: 'Seller account created successfully!',
      storeId: store.id,
      userId,
    });

  } catch (error) {
    console.error('Complete setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
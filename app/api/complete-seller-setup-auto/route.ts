import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface AutoCompleteSetupRequest {
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AutoCompleteSetupRequest = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get the verification token with metadata
    const { data: tokenData, error: tokenError } = await supabase
      .from('seller_verification_tokens')
      .select('email, metadata, expires_at, used_at')
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
    const { password, storeName, whatsappNumber } = tokenData.metadata as {
      password: string;
      storeName: string;
      whatsappNumber: string | null;
    };

    if (!password || !storeName) {
      return NextResponse.json(
        { error: 'Incomplete registration data' },
        { status: 400 }
      );
    }

    // Generate a store slug
    const baseSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let storeSlug = baseSlug;
    let counter = 1;

    // Check if slug is available
    while (true) {
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', storeSlug)
        .single();

      if (!existingStore) break;
      storeSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the user account
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Mark email as confirmed
    });

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create the store
    const { error: storeError } = await supabase
      .from('stores')
      .insert({
        name: storeName,
        slug: storeSlug,
        owner_id: userData.user.id,
        whatsapp_number: whatsappNumber,
        is_active: true,
      });

    if (storeError) {
      console.error('Store creation error:', storeError);
      // Clean up the user if store creation fails
      await supabase.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json(
        { error: 'Failed to create store' },
        { status: 500 }
      );
    }

    // Mark the token as used
    const { error: updateError } = await supabase
      .from('seller_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (updateError) {
      console.error('Token update error:', updateError);
      // Don't fail the request for this
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      storeSlug,
    });

  } catch (error) {
    console.error('Auto complete setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
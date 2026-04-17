import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

interface TokenVerificationRequest {
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenVerificationRequest = await request.json();
    const { token } = body;

    console.log('🔍 TOKEN VERIFICATION DEBUG: Request received');
    console.log('🔍 TOKEN VERIFICATION DEBUG: Token:', token?.substring(0, 20) + '...');

    if (!token) {
      console.log('🔍 TOKEN VERIFICATION DEBUG: No token provided');
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Find and validate the verification token
    console.log('🔍 TOKEN VERIFICATION DEBUG: Looking up token in database');
    const { data: tokenData, error: tokenError } = await supabase
      .from('seller_verification_tokens')
      .select('email, user_id, expires_at, used_at')
      .eq('token', token)
      .single();

    console.log('🔍 TOKEN VERIFICATION DEBUG: Token lookup result:', {
      found: !!tokenData,
      error: tokenError?.message,
      email: tokenData?.email,
      expires: tokenData?.expires_at,
      used: tokenData?.used_at
    });

    if (tokenError || !tokenData) {
      console.log('🔍 TOKEN VERIFICATION DEBUG: Token not found or error');
      // Provide more specific error
      const specificError = tokenError?.code === 'PGRST116' ? 'Token not found in database' : 'Database error';
      return NextResponse.json(
        { error: `Invalid verification token: ${specificError}` },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    console.log('🔍 TOKEN VERIFICATION DEBUG: Expiration check', {
      now: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isExpired: now > expiresAt
    });

    if (now > expiresAt) {
      console.log('🔍 TOKEN VERIFICATION DEBUG: Token is expired');
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if token was already used
    console.log('🔍 TOKEN VERIFICATION DEBUG: Usage check', {
      usedAt: tokenData.used_at,
      isUsed: !!tokenData.used_at
    });

    if (tokenData.used_at) {
      console.log('🔍 TOKEN VERIFICATION DEBUG: Token already used');
      return NextResponse.json(
        { error: 'Verification token has already been used' },
        { status: 400 }
      );
    }

    // Mark token as used
    console.log('🔍 TOKEN VERIFICATION DEBUG: Marking token as used');
    const { error: updateError } = await supabase
      .from('seller_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (updateError) {
      console.error('🔍 TOKEN VERIFICATION DEBUG: Failed to mark token as used:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify token' },
        { status: 500 }
      );
    }

    // Confirm the user in Supabase Auth
    console.log('🔍 TOKEN VERIFICATION DEBUG: Confirming user');
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(tokenData.user_id, {
      email_confirm: true,
    });

    if (confirmError) {
      console.error('🔍 TOKEN VERIFICATION DEBUG: Failed to confirm user:', confirmError);
      // Still return success since token is verified
    } else {
      console.log('🔍 TOKEN VERIFICATION DEBUG: User confirmed successfully');
    }

    // Get user details and create store/subscription
    const { data: userDetails, error: userError } = await supabaseAdmin.auth.admin.getUserById(tokenData.user_id);
    if (userError) {
      console.error('🔍 TOKEN VERIFICATION DEBUG: Failed to get user details:', userError);
    } else {
      const storeName = userDetails.user_metadata?.store_name;
      const whatsappNumber = userDetails.user_metadata?.whatsapp_number;

      if (storeName) {
        // Create store
        const slug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const { error: storeError } = await supabaseAdmin
          .from('stores')
          .insert({
            owner_id: tokenData.user_id,
            name: storeName,
            slug: slug,
            whatsapp_number: whatsappNumber || null,
            plan: 'free',
            is_active: true,
          });

        if (storeError) {
          console.error('🔍 TOKEN VERIFICATION DEBUG: Failed to create store:', storeError);
        } else {
          console.log('🔍 TOKEN VERIFICATION DEBUG: Store created successfully');
        }

        // Create subscription
        const { error: subError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: tokenData.user_id,
            plan: 'free',
            status: 'active',
          });

        if (subError) {
          console.error('🔍 TOKEN VERIFICATION DEBUG: Failed to create subscription:', subError);
        } else {
          console.log('🔍 TOKEN VERIFICATION DEBUG: Subscription created successfully');
        }
      }
    }

    return NextResponse.json({
      success: true,
      email: tokenData.email,
      message: 'Email verified successfully! You can now log in.',
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
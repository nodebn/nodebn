import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
      .select('email, expires_at, used_at')
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
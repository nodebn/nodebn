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
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
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

    return NextResponse.json({
      success: true,
      email: tokenData.email,
      message: 'Token is valid',
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
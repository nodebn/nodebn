import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface TokenVerificationRequest {
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenVerificationRequest = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Find and validate the verification token
    const { data: tokenData, error: tokenError } = await supabase
      .from('seller_verification_tokens')
      .select('email, expires_at, used_at')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
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
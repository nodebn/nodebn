import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Email sending configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'nodebrunei@gmail.com';
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'resend';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || EMAIL_FROM;

interface CompleteSetupRequest {
  token: string;
  password: string;
  storeName: string;
  storeSlug: string;
  whatsappNumber?: string;
}

async function sendVerificationCompleteNotification(email: string, storeName: string, storeSlug: string, whatsappNumber?: string) {
  const notificationHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seller Verification Complete - NodeBN</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; line-height: 1.6; color: #374151; }
        .highlight { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 24px 0; }
        .footer { background-color: #f9fafb; padding: 24px 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; color: white; }
        .details { background-color: #f3f4f6; padding: 16px; border-radius: 6px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 14px; margin: 16px 0; }
        .link { color: #3b82f6; text-decoration: none; font-weight: 500; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NodeBN</div>
            <h1>Seller Verification Complete</h1>
        </div>
        <div class="content">
            <p>Hi Admin,</p>
            <p>Great news! A seller has successfully verified their account and completed setup. They're now ready to start selling on NodeBN!</p>

            <div class="highlight">
                <strong>Seller Details:</strong><br>
                📧 Email: ${email}<br>
                🏪 Store Name: ${storeName}<br>
                🔗 Store URL: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${storeSlug}" class="link">${storeSlug}</a><br>
                ${whatsappNumber ? `📱 WhatsApp: ${whatsappNumber}` : ''}
            </div>

            <p>The seller can now:</p>
            <ul>
                <li>Access their dashboard</li>
                <li>Add products and manage inventory</li>
                <li>Configure store settings</li>
                <li>Start receiving orders</li>
            </ul>

            <div class="details">
                Verification Completed: ${new Date().toLocaleString()}<br>
                Status: Active & Ready to Sell
            </div>

            <p>You can visit their store at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${storeSlug}" class="link">${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${storeSlug}</a></p>
        </div>
        <div class="footer">
            <p>This is an automated notification from NodeBN.</p>
            <p>NodeBN - WhatsApp Commerce Made Simple</p>
        </div>
    </div>
</body>
</html>`;

  const notificationText = `
Seller Verification Complete!

A seller has successfully verified their account and completed setup:

Email: ${email}
Store Name: ${storeName}
Store URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${storeSlug}
${whatsappNumber ? `WhatsApp: ${whatsappNumber}` : ''}
Verification Completed: ${new Date().toLocaleString()}
Status: Active & Ready to Sell

The seller can now access their dashboard and start selling!

Visit their store: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${storeSlug}

NodeBN - WhatsApp Commerce Made Simple
`;

  // Send notification email
  if (EMAIL_SERVICE === 'resend') {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured - skipping verification complete notification');
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: ADMIN_EMAIL,
          subject: `✅ Seller Verification Complete: ${storeName}`,
          html: notificationHtml,
          text: notificationText,
          reply_to: 'nodebrunei@gmail.com',
          headers: {
            'X-Entity-Ref-ID': `verification-complete-${Date.now()}`,
          },
          tags: [
            { name: 'email_type', value: 'admin_notification' },
            { name: 'event', value: 'seller_verified' },
            { name: 'priority', value: 'normal' },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.warn('⚠️ Failed to send verification complete notification:', error);
      } else {
        console.log('✅ Verification complete notification sent for seller:', email);
      }
    } catch (error) {
      console.warn('⚠️ Error sending verification complete notification:', error);
    }
  }
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

    // Send admin notification for completed verification
    console.log('📢 SENDING VERIFICATION COMPLETE NOTIFICATION');
    await sendVerificationCompleteNotification(email, storeName, storeSlug, whatsappNumber);

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
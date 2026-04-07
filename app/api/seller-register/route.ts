import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

// Email sending configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'nodebrunei@gmail.com'; // Your verified email address
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'resend'; // 'resend' or 'sendgrid'

interface SellerRegistrationRequest {
  email: string;
  password: string;
  storeName: string;
  whatsappNumber?: string;
}

async function sendVerificationEmail(email: string, token: string, storeName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/verify-seller?token=${token}`;

  console.log('🔗 VERIFICATION EMAIL DEBUG:');
  console.log('   App URL:', appUrl);
  console.log('   Token:', token.substring(0, 20) + '...');
  console.log('   Full verification URL:', verificationUrl);

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.warn('⚠️  WARNING: NEXT_PUBLIC_APP_URL not set! Using localhost fallback.');
    console.warn('   Make sure to set NEXT_PUBLIC_APP_URL=https://nodebn.vercel.app in Vercel env vars');
  }

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NodeBN - Verify Your Account</title>
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; line-height: 1.6; color: #374151; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.3); transition: all 0.2s ease; }
        .button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px 0 rgba(79, 70, 229, 0.4); }
        .footer { background-color: #f9fafb; padding: 24px 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; color: white; }
        .highlight { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 24px 0; }
        .link-text { word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 13px; color: #374151; border: 1px solid #d1d5db; margin: 16px 0; }
        .unsubscribe { color: #9ca3af; text-decoration: none; }
        .unsubscribe:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NodeBN</div>
            <h1>Welcome to NodeBN!</h1>
            <p>Your WhatsApp E-commerce Journey Starts Here</p>
        </div>

        <div class="content">
            <h2>Hello ${storeName} Team,</h2>

            <p>Thank you for choosing NodeBN as your WhatsApp e-commerce platform! We're excited to help you grow your business and reach more customers through the power of WhatsApp.</p>

            <div class="highlight">
                <h3>🎉 Your Seller Account is Almost Ready!</h3>
                <p>To complete your store registration and start creating your online storefront, please verify your email address.</p>
            </div>

            <h3>Verify Your Email Address</h3>
            <p>Click the button below to verify your email and activate your seller account:</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">✅ Verify My Seller Account</a>
            </div>

            <p><strong>This verification link will expire in 24 hours.</strong></p>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">${verificationUrl}</p>

            <h3>What's Next?</h3>
            <ul>
                <li>✅ Complete your store setup and branding</li>
                <li>✅ Add your first products and categories</li>
                <li>✅ Configure WhatsApp integration</li>
                <li>✅ Start receiving orders from customers</li>
            </ul>

            <h3>Security Notice</h3>
            <p>For your security, this verification link can only be used once. If you didn't request this verification, please ignore this email.</p>

            <h3>Need Help?</h3>
            <p>If you have any questions or need assistance with your account setup, our support team is here to help:</p>
            <p>📧 Email: support@nodebn.com<br>
            💬 WhatsApp: +1 (555) 123-4567<br>
            🌐 Website: https://nodebn.com/support</p>

            <p>We're committed to your success and can't wait to see your business thrive on NodeBN!</p>

            <p>Best regards,<br>
            <strong>The NodeBN Team</strong></p>
        </div>

        <div class="footer">
            <p>© 2026 NodeBN. All rights reserved.</p>
            <p>This email was sent to ${email}. If you no longer wish to receive these emails, you can <a href="[UNSUBSCRIBE_LINK]">unsubscribe</a>.</p>
        </div>
    </div>
</body>
</html>`;

  const emailText = `
Welcome to NodeBN!

Hello ${storeName} Team,

Thank you for choosing NodeBN as your WhatsApp e-commerce platform! We're excited to help you grow your business.

To complete your store registration and start selling, please verify your email address by clicking this link:
${verificationUrl}

This verification link will expire in 24 hours for security.

If the link doesn't work, copy and paste it into your browser.

Questions? Contact our support team at support@nodebn.com.

Best regards,
The NodeBN Team
NodeBN - WhatsApp Commerce Made Simple
`;

  // Send email using the configured service
  if (EMAIL_SERVICE === 'resend') {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: email,
        subject: 'Welcome to NodeBN - Verify Your Seller Account',
        html: emailHtml,
        text: emailText,
        reply_to: 'nodebrunei@gmail.com',
        headers: {
          'X-Entity-Ref-ID': `seller-verification-${Date.now()}`,
        },
        tags: [
          { name: 'email_type', value: 'seller_verification' },
          { name: 'priority', value: 'high' },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }
  } else if (EMAIL_SERVICE === 'sendgrid') {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          subject: 'Welcome to NodeBN - Verify Your Seller Account',
        }],
        from: { email: EMAIL_FROM },
        reply_to: { email: 'support@nodebn.com' },
        content: [
          { type: 'text/html', value: emailHtml },
          { type: 'text/plain', value: emailText },
        ],
        tracking_settings: {
          click_tracking: { enable: false },
          open_tracking: { enable: false },
        },
        categories: ['seller_verification'],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }
  } else {
    throw new Error(`Unsupported email service: ${EMAIL_SERVICE}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SellerRegistrationRequest = await request.json();
    const { email, password, storeName } = body;

    // Validate input
    if (!email || !password || !storeName) {
      return NextResponse.json(
        { error: 'Email, password, and store name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Check if user already exists in Supabase Auth
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser.users.some(user => user.email === email);

    // Check if there's an existing unused verification token
    const { data: existingToken } = await supabase
      .from('seller_verification_tokens')
      .select('id, used_at, expires_at')
      .eq('email', email)
      .is('used_at', null) // Only unused tokens
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const hasValidToken = existingToken && new Date(existingToken.expires_at) > new Date();

    if (userExists && !hasValidToken) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // If user exists but has a valid unused token, or if no user exists, allow registration
    // This handles re-registration for failed verifications or expired tokens
    if (userExists && hasValidToken) {
      console.log('User exists but has valid unused token - allowing re-registration');

      // Delete the old token to create a fresh one
      await supabase
        .from('seller_verification_tokens')
        .delete()
        .eq('id', existingToken.id);
    }

    // Generate new verification token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🎫 GENERATED TOKEN DEBUG:');
    console.log('   Token:', token.substring(0, 20) + '...');
    console.log('   Expires:', expiresAt.toISOString());
    console.log('   User exists:', userExists);
    console.log('   Has valid token:', hasValidToken);

    // Store verification token with registration details
    const { error: tokenError } = await supabase
      .from('seller_verification_tokens')
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
        // Store registration details for automatic account creation
        metadata: {
          password,
          storeName,
          whatsappNumber: whatsappNumber || null
        }
      });

    if (tokenError) {
      console.error('Token storage error:', tokenError);
      return NextResponse.json(
        { error: 'Failed to create verification token' },
        { status: 500 }
      );
    }

    console.log('✅ Token stored successfully for email:', email);

    // Send verification email
    try {
      console.log('📧 SENDING VERIFICATION EMAIL to:', email);
      await sendVerificationEmail(email, token, storeName);
      console.log('✅ VERIFICATION EMAIL SENT successfully');
    } catch (emailError) {
      console.error('❌ EMAIL SENDING ERROR:', emailError);

      // Clean up token if email fails
      await supabase
        .from('seller_verification_tokens')
        .delete()
        .eq('email', email);

      return NextResponse.json(
        { error: 'Failed to send verification email. Please check your email configuration and try again.' },
        { status: 500 }
      );
    }

    console.log('🎉 REGISTRATION COMPLETE for:', email);
    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email for a verification link to complete your account setup.',
      email: email,
      nextStep: 'Check your email and click the verification link to set up your seller account.',
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
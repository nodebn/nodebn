import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

// Email sending configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'nodebrunei@gmail.com'; // Your verified email address
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'resend'; // 'resend' or 'sendgrid'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || EMAIL_FROM; // Email to receive new seller notifications

interface SellerRegistrationRequest {
  email: string;
  password: string;
  storeName: string;
  whatsappNumber?: string;
}

async function sendAdminNotification(email: string, storeName: string, whatsappNumber?: string) {

  const notificationHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Seller Registration - NodeBN</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; line-height: 1.6; color: #374151; }
        .highlight { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 24px 0; }
        .footer { background-color: #f9fafb; padding: 24px 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; color: white; }
        .details { background-color: #f3f4f6; padding: 16px; border-radius: 6px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 14px; margin: 16px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NodeBN</div>
            <h1>New Seller Registration</h1>
        </div>
        <div class="content">
            <p>Hi Admin,</p>
            <p>A new seller has just registered on NodeBN! Here are the details:</p>

            <div class="highlight">
                <strong>New Seller Details:</strong><br>
                📧 Email: ${email}<br>
                🏪 Store Name: ${storeName}<br>
                ${whatsappNumber ? `📱 WhatsApp: ${whatsappNumber}` : ''}
            </div>

            <p>The seller will need to verify their email address before they can set up their store and start selling.</p>

            <div class="details">
                Registration Time: ${new Date().toLocaleString()}<br>
                Status: Awaiting Email Verification
            </div>

            <p>You can monitor the seller's progress in the admin dashboard once they complete verification.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from NodeBN.</p>
            <p>NodeBN - WhatsApp Commerce Made Simple</p>
        </div>
    </div>
</body>
</html>`;

  const notificationText = `
New Seller Registration Alert

A new seller has registered on NodeBN:

Email: ${email}
Store Name: ${storeName}
${whatsappNumber ? `WhatsApp: ${whatsappNumber}` : ''}
Registration Time: ${new Date().toLocaleString()}
Status: Awaiting Email Verification

The seller will need to verify their email before setting up their store.

NodeBN - WhatsApp Commerce Made Simple
`;

  // Send notification email
  if (EMAIL_SERVICE === 'resend') {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured - skipping admin notification');
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
          subject: `🆕 New Seller Registration: ${storeName}`,
          html: notificationHtml,
          text: notificationText,
          reply_to: 'nodebrunei@gmail.com',
          headers: {
            'X-Entity-Ref-ID': `admin-notification-${Date.now()}`,
          },
          tags: [
            { name: 'email_type', value: 'admin_notification' },
            { name: 'priority', value: 'high' },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.warn('⚠️ Failed to send admin notification:', error);
      } else {
        console.log('✅ Admin notification sent for new seller:', email);
      }
    } catch (error) {
      console.warn('⚠️ Error sending admin notification:', error);
    }
  }
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
    const { email, password, storeName, whatsappNumber } = body;

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

    // Clean up any existing verification tokens for this email first
    // This handles re-registration cases and deleted accounts
    console.log('🧹 CLEANUP: Deleting existing tokens for email:', email);
    const { error: deleteError, count } = await supabase
      .from('seller_verification_tokens')
      .delete({ count: 'exact' })
      .eq('email', email);

    console.log('🧹 CLEANUP RESULT:', { error: deleteError, deletedCount: count });

    if (deleteError) {
      console.error('❌ DELETE ERROR:', deleteError);
      return NextResponse.json(
        { error: 'Failed to clean up existing tokens. Please try again.' },
        { status: 500 }
      );
    } else {
      console.log('✅ Tokens cleaned up successfully, count:', count);
    }

    // Check if user already exists in Supabase Auth
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser.users.some(user => user.email === email);

    if (userExists) {
      return NextResponse.json(
        { error: 'An account with this email already exists. If you deleted your account and want to re-register, please contact support or try again later.' },
        { status: 409 }
      );
    }

    // Generate new verification token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours (increased from 24)

    console.log('🎫 GENERATED TOKEN DEBUG:');
    console.log('   Token:', token.substring(0, 20) + '...');
    console.log('   Expires:', expiresAt.toISOString());
    console.log('   User exists:', userExists);

    // Force cleanup again right before token creation
    console.log('🧹 FORCE CLEANUP: Double-checking token cleanup');
    const { error: forceDeleteError } = await supabase
      .from('seller_verification_tokens')
      .delete()
      .eq('email', email);

    if (forceDeleteError) {
      console.error('❌ FORCE DELETE ERROR:', forceDeleteError);
    } else {
      console.log('✅ Force cleanup completed');
    }

    // Create new token - try insert first, fallback to update if it exists
    console.log('🎫 CREATING TOKEN...');
    let tokenError = null;

    // Try insert first
    const { error: insertError } = await supabase
      .from('seller_verification_tokens')
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
        metadata: {
          password,
          storeName,
          whatsappNumber: whatsappNumber || null
        }
      });

    if (insertError) {
      console.log('❌ INSERT FAILED, trying update:', insertError.message);

      // If insert fails due to duplicate, try update instead
      if (insertError.code === '23505') { // duplicate key error
        console.log('🔄 DUPLICATE DETECTED, updating existing token...');
        const { error: updateError } = await supabase
          .from('seller_verification_tokens')
          .update({
            token,
            expires_at: expiresAt.toISOString(),
            used_at: null, // Reset used status
            metadata: {
              password,
              storeName,
              whatsappNumber: whatsappNumber || null
            }
          })
          .eq('email', email);

        if (updateError) {
          console.error('❌ UPDATE ALSO FAILED:', updateError);
          tokenError = updateError;
        } else {
          console.log('✅ TOKEN UPDATED SUCCESSFULLY');
          tokenError = null;
        }
      } else {
        tokenError = insertError;
      }
    } else {
      console.log('✅ TOKEN INSERTED SUCCESSFULLY');
    }

    if (tokenError) {
      console.error('Final token storage error:', tokenError);
      return NextResponse.json(
        { error: 'Failed to create verification token' },
        { status: 500 }
      );
    }

    if (tokenError) {
      console.error('Token storage error:', tokenError);
      return NextResponse.json(
        { error: 'Failed to create verification token' },
        { status: 500 }
      );
    }

    console.log('✅ Token stored successfully for email:', email);

    // Send verification email
    console.log('📧 Sending verification email to:', email);
    console.log('📧 Using service:', EMAIL_SERVICE);
    console.log('📧 From address:', EMAIL_FROM);

    if (!process.env.RESEND_API_KEY) {
      console.error('📧 RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_API_KEY.' },
        { status: 500 }
      );
    }

    try {
      // Create verification email HTML
      const verificationHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your NodeBN Seller Account</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; line-height: 1.6; color: #374151; }
        .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
        .footer { background-color: #f9fafb; padding: 24px 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; color: white; }
        .warning { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NodeBN</div>
            <h1>Welcome to NodeBN!</h1>
        </div>
        <div class="content">
            <p>Hi there,</p>
            <p>Thank you for registering as a seller on NodeBN! We're excited to have you join our platform.</p>
            
            <p>To complete your registration and start selling, please verify your email address by clicking the button below:</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-seller?token=${token}" class="button">Verify My Email</a>
            
            <div class="warning">
                <strong>Important:</strong> This verification link will expire in 24 hours for security reasons. If the link doesn't work, please register again.
            </div>
            
            <p>If you didn't create this account, you can safely ignore this email.</p>
            
            <p>Best regards,<br>The NodeBN Team</p>
        </div>
        <div class="footer">
            <p>This email was sent to ${email}. If you have any questions, contact us at support@nodebn.com</p>
        </div>
    </div>
</body>
</html>`;

      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailResult = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Verify Your NodeBN Seller Account',
        html: verificationHtml,
      });

      console.log('📧 Email send result:', emailResult);

      if (emailResult.error) {
        console.error('📧 Email send failed:', emailResult.error);
        return NextResponse.json(
          { error: `Failed to send verification email: ${emailResult.error.message || 'Unknown error'}` },
          { status: 500 }
        );
      }

      console.log('📧 Verification email sent successfully');
    } catch (emailError) {
      console.error('📧 Email sending error:', emailError);
      return NextResponse.json(
        { error: `Failed to send verification email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` },
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
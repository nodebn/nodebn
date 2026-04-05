import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, record, old_record } = body;

    // Only process subscription updates
    if (type === 'UPDATE' && record.table === 'subscriptions') {
      const oldPlan = old_record?.plan;
      const newPlan = record.plan;
      const userId = record.user_id;

      // Only send email if plan actually changed
      if (oldPlan !== newPlan && newPlan !== 'free') {
        // Get user details
        if (!supabase) {
          console.log('Supabase not configured');
          return NextResponse.json({ success: true });
        }
        const { data: user } = await supabase.auth.admin.getUserById(userId);

        if (user?.user?.email) {
          const planNames = {
            starter: 'Starter',
            professional: 'Professional',
            enterprise: 'Enterprise'
          };

          const planLimits = {
            starter: { stores: 1, products: 20 },
            professional: { stores: 3, products: 100 },
            enterprise: { stores: 10, products: 'unlimited' }
          };

          if (resend) {
            await resend.emails.send({
            from: 'NodeBN <noreply@nodebn.com>',
            to: user.user.email,
            subject: `🎉 Subscription Activated - ${planNames[newPlan as keyof typeof planNames]} Plan`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <title>Subscription Activated</title>
                </head>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin: 0;">🎉 Subscription Activated!</h1>
                    <p style="color: #6b7280; margin: 10px 0;">Welcome to the ${planNames[newPlan as keyof typeof planNames]} Plan</p>
                  </div>

                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0;">Your Plan Benefits:</h2>
                    <ul style="color: #4b5563; line-height: 1.6;">
                      <li><strong>Stores:</strong> ${planLimits[newPlan as keyof typeof planLimits].stores}</li>
                      <li><strong>Products:</strong> ${planLimits[newPlan as keyof typeof planLimits].products}</li>
                      <li>Advanced dashboard features</li>
                      <li>Priority support</li>
                      <li>WhatsApp integration</li>
                      <li>Custom branding options</li>
                    </ul>
                  </div>

                  <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="color: #065f46; margin: 0; font-weight: bold;">
                      ✅ Your subscription is now active and all features are unlocked!
                    </p>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
                       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Access Your Dashboard
                    </a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; text-align: center;">
                    Questions? Contact us at support@nodebn.com or WhatsApp +6738824395
                  </p>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    NodeBN - Modern E-commerce for Brunei Businesses<br>
                    © 2026 NodeBN. All rights reserved.
                  </p>
                </body>
              </html>
            `
          });

            console.log(`Subscription activation email sent to ${user.user.email} for ${newPlan} plan`);
          } else {
            console.log('Resend not configured - email not sent');
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
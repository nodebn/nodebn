import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import crypto from 'crypto';

const POCKET_USERNAME = process.env.POCKET_USERNAME!;
const POCKET_PASSWORD = process.env.POCKET_PASSWORD!;
const POCKET_SECRET_KEY = process.env.POCKET_SECRET_KEY!;
const POCKET_SANDBOX = process.env.POCKET_SANDBOX === 'true';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// AES-256-ECB encryption using createCipheriv
function encryptPayload(payload: any, secretKey: string): string {
  const cipher = crypto.createCipheriv('aes-256-ecb', secretKey, null);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export async function POST(request: NextRequest) {
  const { orderId, amount, currency, returnUrl, bankName } = await request.json();

  if (!orderId || !amount || !currency) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const baseUrl = POCKET_SANDBOX ? 'https://staging.pocket.com' : 'https://api.pocket.com'; // Update with actual URLs

  // Create payment payload with optional payment method restrictions (v1.0.6)
  let paymentMethodParams: Record<string, boolean> = {};
  if (bankName === 'Pocket') {
    paymentMethodParams = { enable_e_wallet: true };
  } else if (bankName === 'Visa/Mastercard') {
    paymentMethodParams = { enable_credit_card: true, enable_debit_card: true };
  }

  const payload = {
    username: POCKET_USERNAME,
    password: POCKET_PASSWORD,
    billOrInvoiceNo: orderId,
    amount: amount / 100, // Convert cents to decimal
    approvedUrl: `${APP_URL}/api/payments/pocket/verify?orderId=${orderId}&status=success`,
    declineUrl: `${APP_URL}/api/payments/pocket/verify?orderId=${orderId}&status=decline`,
    cancelUrl: `${APP_URL}/api/payments/pocket/verify?orderId=${orderId}&status=cancel`,
    ...paymentMethodParams, // Add optional parameters if applicable
  };

  // Encrypt the payload
  const encryptedPayload = encryptPayload(payload, POCKET_SECRET_KEY);

  console.log('Pocket payload:', payload);
  console.log('Pocket encrypted payload:', encryptedPayload);

  // Step 1: Validate payment request
  const validateUrl = `${baseUrl}/validatePaymentRequest`;
  const validateResponse = await fetch(validateUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      encryptedData: encryptedPayload,
    }),
  });

  if (!validateResponse.ok) {
    const error = await validateResponse.text();
    console.error('Pocket validatePaymentRequest failed:', validateResponse.status, error);
    return NextResponse.json({ error: 'Failed to validate payment request' }, { status: 500 });
  }

  const validateData = await validateResponse.json();
  console.log('Pocket validate response:', validateData);

  if (validateData.status !== 200 || !validateData.checkoutSessionID) {
    console.error('Pocket validation failed:', validateData);
    return NextResponse.json({ error: 'Payment validation failed' }, { status: 500 });
  }

  const checkoutSessionID = validateData.checkoutSessionID;

  // Update our order with pocket session ID
  const supabase = createServerSupabaseClient();
  const { error: updateError } = await supabase
    .from('orders')
    .update({ pocket_order_ref: checkoutSessionID })
    .eq('id', orderId);

  if (updateError) {
    console.error('Failed to update order with pocket session ID:', updateError);
    // Continue anyway
  }

  // Return the checkout URL
  const paymentUrl = `${baseUrl}/checkout/${checkoutSessionID}`;
  return NextResponse.json({
    paymentUrl,
    paymentId: checkoutSessionID,
  });
}
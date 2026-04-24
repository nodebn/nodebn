import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const POCKET_SANDBOX = process.env.POCKET_SANDBOX === 'true';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');

  if (!orderId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const baseUrl = POCKET_SANDBOX ? 'https://staging.pocket.com' : 'https://api.pocket.com'; // Update with actual URLs

  const supabase = createServerSupabaseClient();

  // Get order details
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, store_id, pocket_order_ref')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Order not found:', orderId, error);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Handle based on status
  if (status === 'success') {
    // Verify payment status
    const statusUrl = `${baseUrl}/checkPaymentStatus?billOrInvoiceNo=${orderId}`;
    const statusResponse = await fetch(statusUrl);

    if (!statusResponse.ok) {
      console.error('Failed to check payment status');
      return NextResponse.redirect(new URL('/', request.url));
    }

    const statusData = await statusResponse.json();
    console.log('Payment status check:', statusData);

    if (statusData.status === 'Success') {
      // Update order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', order.id);

      if (updateError) {
        console.error('Order update error:', updateError);
      }

      // Deduct stock
      console.log('🏭 Deducting stock after payment confirmation...');
      try {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select(`
            product_id,
            variant_id,
            quantity
          `)
          .eq('order_id', order.id);

        if (orderItems) {
          for (const item of orderItems) {
            if (item.variant_id) {
              await supabase.rpc('decrement_variant_stock', {
                variant_id: item.variant_id,
                quantity: item.quantity
              });
            } else {
              await supabase.rpc('decrement_product_stock', {
                product_id: item.product_id,
                quantity: item.quantity
              });
            }
          }
        }
        console.log('✅ Stock deducted successfully');
      } catch (stockError) {
        console.error('❌ Stock deduction failed:', stockError);
      }

      // Send notification to seller
      const { data: store } = await supabase
        .from('stores')
        .select('owner_id')
        .eq('id', order.store_id)
        .single();

      if (store?.owner_id) {
        await supabase.from('notifications').insert({
          user_id: store.owner_id,
          type: 'payment_received',
          title: 'Payment Received',
          message: `Payment received for order ${order.id.slice(-8).toUpperCase()}`,
          data: { order_id: order.id },
        });
      }

      // Redirect to WhatsApp with confirmation
      const { data: fullOrder } = await supabase
        .from('orders')
        .select(`
          customer_name,
          customer_address,
          customer_notes,
          customer_whatsapp,
          total_cents,
          currency,
          payment_method,
          order_items (
            name,
            quantity,
            price_cents,
            currency
          ),
          stores (
            name,
            whatsapp_number
          )
        `)
        .eq('id', order.id)
        .single();

      if (fullOrder) {
        const stores = fullOrder.stores as unknown as { name: string; whatsapp_number: string } | null;
        if (stores?.whatsapp_number) {
        const items = fullOrder.order_items || [];
        const totalBND = (fullOrder.total_cents / 100).toFixed(2);

        let message = `*PAYMENT CONFIRMED*\n`;
        message += `*Store:* ${stores.name}\n`;
        message += `\n*Customer:*\n`;
        message += `• *Name:* ${fullOrder.customer_name}\n`;
        message += `• *Service:* ${fullOrder.customer_address}\n`;
        if (fullOrder.customer_notes) {
          message += `• *Notes:* ${fullOrder.customer_notes}\n`;
        }
        message += `\n*Items:*\n`;
        items.forEach((item: any, index: number) => {
          const itemTotal = ((item.price_cents * item.quantity) / 100).toFixed(2);
          message += `${index + 1}. ${item.name} x${item.quantity} - ${item.currency} ${itemTotal}\n`;
        });
        message += `\n*Total:* ${fullOrder.currency} ${totalBND}\n`;
        message += `\n*Payment:* ${fullOrder.payment_method || 'Pocket'} (Confirmed)\n`;
        message += `\nThank you for your order! 🎉\n`;
        message += `\n*Powered by NodeBN*`;

        const whatsappUrl = `https://wa.me/${stores.whatsapp_number}?text=${encodeURIComponent(message)}`;
        return NextResponse.redirect(whatsappUrl);
        }
      }
    }
  } else if (status === 'decline' || status === 'cancel') {
    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', order.id);

    if (updateError) {
      console.error('Order cancellation error:', updateError);
    }
  }

  // Default redirect to home or order page
  return NextResponse.redirect(new URL('/', request.url));
}
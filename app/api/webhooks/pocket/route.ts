import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import crypto from 'crypto';

const POCKET_SALT = process.env.POCKET_SALT!;

export async function GET(request: NextRequest) {
  return handleWebhook(request);
}

export async function POST(request: NextRequest) {
  return handleWebhook(request);
}

async function handleWebhook(request: NextRequest) {
  try {
    let data: any;

    if (request.method === 'GET') {
      // For GET, data is in query params
      const url = new URL(request.url);
      data = {
        successIndicator: url.searchParams.get('successIndicator'),
        Message: url.searchParams.get('Message'),
        OrderId: url.searchParams.get('OrderId'),
      };
    } else {
      // For POST, data is in body
      const body = await request.text();
      data = JSON.parse(body);
    }

    console.log('Pocket webhook data:', data);

    const { successIndicator, Message, OrderId, status, order_ref } = data;

    // For now, assume success if successIndicator is present
    const isSuccess = successIndicator || Message === 'Successful Payment';

    if (!isSuccess) {
      console.log('Payment not successful');
      return NextResponse.json({ success: false });
    }

    // Find the order by pocket order_ref
    const supabase = createServerSupabaseClient();
    const orderRef = order_ref || OrderId;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, store_id')
      .eq('pocket_order_ref', orderRef)
      .single();

    if (orderError || !order) {
      console.error('Order not found for pocket ref:', orderRef, orderError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status to paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', order.id);

    if (updateError) {
      console.error('Order update error:', updateError);
      if (request.method === 'GET') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Deduct stock after payment confirmation
    console.log('🏭 Deducting stock after payment confirmation...');
    try {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          product_id,
          variant_id,
          quantity,
          products (
            stock_quantity
          ),
          product_variants (
            stock_quantity
          )
        `)
        .eq('order_id', order.id);

      if (orderItems) {
        for (const item of orderItems) {
          if (item.variant_id) {
            // Deduct from variant
            await supabase.rpc('decrement_variant_stock', {
              variant_id: item.variant_id,
              quantity: item.quantity
            });
          } else {
            // Deduct from product
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
      // Continue - order is still processed
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

    // For GET requests (user redirect), redirect to WhatsApp
    if (request.method === 'GET') {
      // Generate WhatsApp message similar to redirect route
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

      const stores = fullOrder?.stores as unknown as { name: string; whatsapp_number: string } | null;
      if (fullOrder && stores?.whatsapp_number) {
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

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Pocket webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleLegacyWebhook(request: NextRequest) {
  try {
    const { order_id, status } = await request.json();

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    if (status === 'paid') {
      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', order_id);

      if (error) {
        console.error('Order update error:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      // Send notification to seller
      const { data: order } = await supabase
        .from('orders')
        .select('store_id')
        .eq('id', order_id)
        .single();

      if (order) {
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
            message: `Payment received for order ${order_id.slice(-8).toUpperCase()}`,
            data: { order_id },
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Pocket webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const orderId = params.orderId;

  if (!orderId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const supabase = createServerSupabaseClient();

  // Get order details
  const { data: order, error } = await supabase
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
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const store = order.stores as unknown as { name: string; whatsapp_number: string };
  if (!store?.whatsapp_number) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Format WhatsApp message
  const items = order.order_items || [];
  const totalBND = (order.total_cents / 100).toFixed(2);

  let message = `*PAYMENT CONFIRMED*\n`;
  message += `*Store:* ${store.name}\n`;
  message += `\n*Customer:*\n`;
  message += `• *Name:* ${order.customer_name}\n`;
  message += `• *Service:* ${order.customer_address}\n`;
  if (order.customer_notes) {
    message += `• *Notes:* ${order.customer_notes}\n`;
  }
  message += `\n*Items:*\n`;
  items.forEach((item: any, index: number) => {
    const itemTotal = ((item.price_cents * item.quantity) / 100).toFixed(2);
    message += `${index + 1}. ${item.name} x${item.quantity} - ${item.currency} ${itemTotal}\n`;
  });
  message += `\n*Total:* ${order.currency} ${totalBND}\n`;
  message += `\n*Payment:* ${order.payment_method || 'Pocket'} (Confirmed)\n`;
  message += `\nThank you for your order! 🎉\n`;
  message += `\n*Powered by NodeBN*`;

  const whatsappUrl = `https://wa.me/${store.whatsapp_number}?text=${encodeURIComponent(message)}`;

  return NextResponse.redirect(whatsappUrl);
}
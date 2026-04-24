import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CartLine } from '@/hooks/useCart';

interface CustomerDetails {
  name: string;
  address: string;
  notes: string;
  whatsapp: string;
  fulfilmentDate?: string;
  fulfilmentTime?: string;
}

interface CheckoutRequest {
  storeId: string;
  cartItems: CartLine[];
  customer: CustomerDetails;
  totalCents: number;
  currency: string;
  whatsappMessage: string;
  selectedPayment?: string;
  bankName?: string;
}

async function deductStockFromInventory(cartItems: CartLine[]) {
  const supabase = createServerSupabaseClient();

  console.log(`🔄 Processing ${cartItems.length} cart items for stock deduction`);

  for (const item of cartItems) {
    console.log(`📦 Processing item: ${item.name}, quantity: ${item.quantity}, variant_id: ${item.variant_id}`);

    if (item.variant_id) {
      // Deduct from variant stock
      const { error } = await supabase.rpc('decrement_variant_stock', {
        variant_id: item.variant_id,
        quantity: item.quantity
      });

      if (error) {
        console.error(`❌ Variant stock deduction failed:`, error);
        throw new Error(`Stock deduction failed: ${error.message}`);
      }
    } else {
      // Deduct from product stock
      const { error } = await supabase.rpc('decrement_product_stock', {
        product_id: item.productId,
        quantity: item.quantity
      });

      if (error) {
        console.error(`❌ Product stock deduction failed:`, error);
        throw new Error(`Stock deduction failed: ${error.message}`);
      }
    }
  }

  console.log('✅ All stock deductions completed');
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
  const { storeId, cartItems, customer, totalCents, currency, whatsappMessage, selectedPayment, bankName } = body;

  console.log('🛒 API Checkout started for store:', storeId);
  console.log('💳 Payment details:', { selectedPayment, bankName });

  // Validate input
  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // Fallback: if bankName is not provided, try to get it from selectedPayment
  let finalBankName = bankName;
  if (!finalBankName && selectedPayment) {
    const { data: paymentData } = await supabase
      .from('payments')
      .select('bank_name')
      .eq('id', selectedPayment)
      .single();
    finalBankName = paymentData?.bank_name;
    console.log('🔄 Fallback bankName lookup:', finalBankName);
  }

    // Debug authentication context
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Checkout auth context:', {
      user: user ? { id: user.id, email: user.email } : null,
      authError: authError?.message,
      env: {
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });

    // Check if Pocket payment first
    let isPocketPayment = false;
    if (selectedPayment) {
      const { data: paymentData } = await supabase
        .from('payments')
        .select('bank_name')
        .eq('id', selectedPayment)
        .single();
      isPocketPayment = paymentData?.bank_name === 'Pocket';
    }

    // Create order using database function that bypasses RLS
    console.log('📝 Creating order via database function...');
    const { data: orderId, error: orderError } = await supabase.rpc('create_order_bypass_rls', {
      p_store_id: storeId,
      p_customer_name: customer.name.trim(),
      p_customer_address: customer.address.trim(),
      p_customer_notes: customer.notes.trim(),
      p_total_cents: totalCents,
      p_currency: currency,
      p_whatsapp_message: whatsappMessage,
      p_customer_whatsapp: customer.whatsapp,
      p_fulfilment_date: customer.fulfilmentDate,
      p_fulfilment_time: customer.fulfilmentTime,
      p_payment_method: finalBankName,
    });

    let order: { id: string } | undefined;
    if (orderError) {
      console.error('❌ Database function failed:', orderError);
      // Fallback to direct insert if function doesn't exist
      console.log('⚠️ Falling back to direct insert...');
      const { data: directOrder, error: directError } = await supabase
        .from('orders')
          .insert({
            store_id: storeId,
            customer_name: customer.name.trim(),
            customer_address: customer.address.trim(),
            customer_notes: customer.notes.trim(),
            total_cents: totalCents,
            currency,
            whatsapp_message: whatsappMessage,
            customer_whatsapp: customer.whatsapp,
            fulfilment_date: customer.fulfilmentDate,
            fulfilment_time: customer.fulfilmentTime,
            payment_method: finalBankName,
            status: isPocketPayment ? 'pending' : 'completed', // Pending for Pocket until payment confirmed
          })
        .select('id')
        .single();

      if (directError) {
        console.error('❌ Direct insert also failed:', directError);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }

      order = directOrder;
      console.log('✅ Order created via direct insert:', order.id);
    } else {
      order = { id: orderId };
      console.log('✅ Order created via database function:', order.id);
    }

    if (!order) {
      console.error('❌ Order creation failed: no order created');
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    console.log('✅ Order created:', order?.id);

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order!.id,
      product_id: item.productId,
      variant_id: item.variant_id,
      variant_name: item.variant_name,
      name: item.name,
      price_cents: item.price_cents,
      quantity: item.quantity,
      currency: item.currency,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Order items creation failed:', itemsError);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    console.log('✅ Order items created');

    // Deduct stock (skip for Pocket - deduct after payment confirmation)
    if (!isPocketPayment) {
      console.log('🏭 Deducting stock...');
      await deductStockFromInventory(cartItems);
      console.log('✅ Stock deducted successfully');
    } else {
      console.log('💳 Skipping stock deduction for Pocket payment - will deduct after confirmation');
    }

    // Mark order as completed (or pending for Pocket)
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: isPocketPayment ? 'pending' : 'completed', updated_at: new Date().toISOString() })
      .eq('id', order!.id);

    if (updateError) {
      console.error('❌ Order status update failed:', updateError);
      // Don't fail the whole operation for this
    }

    // Send notification to seller
    console.log('📢 Sending notification to seller...');
    try {
      const { data: store } = await supabase
        .from('stores')
        .select('owner_id')
        .eq('id', storeId)
        .single();

      if (store?.owner_id) {
        await supabase.from('notifications').insert({
          user_id: store.owner_id,
          type: 'new_order',
          title: 'New Order Received',
          message: `Order #${order!.id.slice(-8).toUpperCase()} from ${customer.name} for ${(totalCents / 100).toFixed(2)} ${currency}`,
          data: { order_id: order!.id }
        });
        console.log('✅ Notification sent to seller');
      }
    } catch (notifError) {
      console.error('⚠️ Notification failed:', notifError);
      // Don't fail checkout for this
    }

    console.log('🎉 Checkout completed successfully');
    return NextResponse.json({
      success: true,
      orderId: order!.id,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('❌ API Checkout error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
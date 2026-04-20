"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CartLine } from "@/hooks/useCart";

async function deductStockFromInventory(cartItems: CartLine[]) {
  const supabase = createServerSupabaseClient();

  console.log(`🔄 Processing ${cartItems.length} cart items for stock deduction`);

  for (const item of cartItems) {
    console.log(`📦 Processing item: ${item.name}, quantity: ${item.quantity}, variant_id: ${item.variant_id}, productId: ${item.productId}`);

    if (item.variant_id) {
      // Deduct from variant stock
      console.log(`🎯 Deducting ${item.quantity} from variant ${item.variant_id}`);
      const { data, error } = await supabase.rpc('decrement_variant_stock', {
        variant_id: item.variant_id,
        quantity: item.quantity
      });

      if (error) {
        console.error(`❌ Variant stock deduction failed for ${item.variant_id}:`, error);
        throw new Error(`Variant stock deduction failed: ${error.message}`);
      } else {
        console.log(`✅ Variant stock deduction successful for ${item.variant_id}, result:`, data);
      }
    } else {
      // Deduct from product stock
      console.log(`🎯 Deducting ${item.quantity} from product ${item.productId}`);
      const { data, error } = await supabase.rpc('decrement_product_stock', {
        product_id: item.productId,
        quantity: item.quantity
      });

      if (error) {
        console.error(`❌ Product stock deduction failed for ${item.productId}:`, error);
        throw new Error(`Product stock deduction failed: ${error.message}`);
      } else {
        console.log(`✅ Product stock deduction successful for ${item.productId}, result:`, data);
      }
    }
  }

  console.log('✅ All stock deductions completed');
}

export interface CustomerDetails {
  name: string;
  address: string;
  notes: string;
  whatsapp: string;
}

export async function placeOrder(
  storeId: string,
  cartItems: CartLine[],
  customer: CustomerDetails,
  totalCents: number,
  currency: string,
  whatsappMessage: string,
) {
  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const supabase = createServerSupabaseClient();

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      store_id: storeId,
      customer_name: customer.name.trim(),
      customer_address: customer.address.trim(),
      customer_notes: customer.notes.trim(),
      total_cents: totalCents,
      currency,
      whatsapp_message: whatsappMessage,
    })
    .select("id")
    .single();

  if (orderError) {
    console.error("Order insert error:", orderError);
    throw new Error("Failed to create order");
  }

  // Insert order items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variant_id,
    variant_name: item.variant_name,
    name: item.name,
    price_cents: item.price_cents,
    quantity: item.quantity,
    currency: item.currency,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
    // Optionally delete the order if items fail, but for now just throw
    throw new Error("Failed to create order items");
  }

  // NOTE: Stock deduction moved to after WhatsApp confirmation
  // Will be called from checkout component after WhatsApp link generation

  return { orderId: order.id };
}

export async function completeOrderWithStockDeduction(orderId: string, cartItems: CartLine[]) {
  const supabase = createServerSupabaseClient();

  console.log(`🎯 Starting completeOrderWithStockDeduction for order: ${orderId}`);

  try {
    // Verify order exists and hasn't been completed yet
    console.log(`🔍 Checking order ${orderId} status...`);
    const { data: order, error: orderCheck } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();

    if (orderCheck) {
      console.error('❌ Order check error:', orderCheck);
      throw new Error(`Order check failed: ${orderCheck.message}`);
    }

    if (!order) {
      console.error('❌ Order not found:', orderId);
      throw new Error('Order not found');
    }

    console.log(`📋 Order ${orderId} status: ${order.status}`);

    // Check if stock deduction already happened
    if (order.status === 'completed') {
      console.log('ℹ️ Order already completed, skipping stock deduction');
      return { success: true };
    }

    console.log(`🏭 Starting stock deduction for ${cartItems.length} items...`);

    // Deduct stock from inventory
    await deductStockFromInventory(cartItems);

    console.log(`💾 Updating order ${orderId} status to completed...`);

    // Mark order as completed
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Failed to update order status:', updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    console.log(`✅ Order ${orderId} completed with stock deduction`);
    return { success: true };

  } catch (error) {
    console.error('❌ Failed to complete order with stock deduction:', error);
    throw error;
  }
}
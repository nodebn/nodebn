"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CartLine } from "@/hooks/useCart";

async function deductStockFromInventory(cartItems: CartLine[]) {
  const supabase = createServerSupabaseClient();

  for (const item of cartItems) {
    if (item.variant_id) {
      // Deduct from variant stock
      const { error } = await supabase.rpc('decrement_variant_stock', {
        variant_id: item.variant_id,
        quantity: item.quantity
      });

      if (error) {
        console.error(`Failed to deduct stock for variant ${item.variant_id}:`, error);
        // Continue with other items even if one fails
      }
    } else {
      // Deduct from product stock
      const { error } = await supabase.rpc('decrement_product_stock', {
        product_id: item.productId,
        quantity: item.quantity
      });

      if (error) {
        console.error(`Failed to deduct stock for product ${item.productId}:`, error);
        // Continue with other items even if one fails
      }
    }
  }
}

export interface CustomerDetails {
  name: string;
  address: string;
  notes: string;
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

  // Deduct stock from inventory
  await deductStockFromInventory(cartItems);

  return { orderId: order.id };
}
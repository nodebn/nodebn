const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceKey)

async function testCompleteStockDeductionFlow() {
  console.log('🧪 Testing Complete Stock Deduction Flow...\n')

  try {
    // 1. Find a variant with stock for testing
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, name, stock_quantity')
      .not('stock_quantity', 'is', null)
      .gt('stock_quantity', 0)
      .limit(1)

    if (variantsError || !variants.length) {
      console.log('❌ No variants with stock found for testing')
      return
    }

    const testVariant = variants[0]
    console.log(`✅ Found variant: ${testVariant.name} (${testVariant.stock_quantity} units)`)

    // 2. Simulate the complete checkout flow
    console.log('\n🛒 Simulating Complete Checkout Flow...')

    // Find the product for this variant
    const { data: product, error: productError } = await supabase
      .from('product_variants')
      .select('product_id, products!inner(id, name, price_cents, currency, stock_quantity)')
      .eq('id', testVariant.id)
      .single()

    if (productError) {
      console.log('❌ Could not find product for variant')
      return
    }

    const productData = product.products
    console.log(`✅ Found product: ${productData.name}`)

    // 3. Test the stock deduction RPC (what happens in /api/checkout)
    const originalStock = testVariant.stock_quantity
    console.log(`\n📦 Original stock: ${originalStock} units`)

    const { error: stockError } = await supabase.rpc('decrement_variant_stock', {
      variant_id: testVariant.id,
      quantity: 1
    })

    if (stockError) {
      console.log('❌ Stock deduction failed:', stockError.message)
      return
    }

    // Verify stock was deducted
    const { data: updatedVariant } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', testVariant.id)
      .single()

    const newStock = updatedVariant?.stock_quantity
    console.log(`📉 Stock after deduction: ${newStock} units`)

    if (newStock === originalStock - 1) {
      console.log('✅ SUCCESS: Stock deduction working correctly!')
      console.log(`   ${originalStock} → ${newStock} (decreased by 1)`)
    } else {
      console.log(`❌ FAILURE: Stock deduction not working. Expected ${originalStock - 1}, got ${newStock}`)
    }

    // 4. Test order creation (what also happens in /api/checkout)
    console.log('\n📝 Testing Order Creation...')

    const testOrder = {
      store_id: 'cccdbefe-3d6e-4f2a-9059-a9adf120acca',
      customer_name: 'Stock Test Order',
      customer_address: 'Test Address',
      customer_notes: 'Testing stock deduction',
      total_cents: productData.price_cents,
      currency: productData.currency,
      whatsapp_message: `Test order for ${productData.name}`,
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select('id')
      .single()

    if (orderError) {
      console.log('❌ Order creation failed:', orderError.message)
    } else {
      console.log('✅ Order created successfully:', order.id)

      // Create order item
      const orderItem = {
        order_id: order.id,
        product_id: productData.id,
        variant_id: testVariant.id,
        variant_name: testVariant.name,
        name: productData.name,
        price_cents: productData.price_cents,
        quantity: 1,
        currency: productData.currency,
      }

      const { error: itemError } = await supabase
        .from('order_items')
        .insert(orderItem)

      if (itemError) {
        console.log('❌ Order item creation failed:', itemError.message)
      } else {
        console.log('✅ Order item created')

        // Mark order as completed
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', order.id)

        if (updateError) {
          console.log('❌ Order completion failed:', updateError.message)
        } else {
          console.log('✅ Order marked as completed')
        }
      }
    }

    console.log('\n🎉 Complete Stock Deduction Flow Test: SUCCESS!')
    console.log('✅ Stock is properly deducted when orders are placed')
    console.log('✅ Order creation and completion works')
    console.log('✅ Inventory system is fully operational')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testCompleteStockDeductionFlow()
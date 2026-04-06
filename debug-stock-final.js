const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugStockFinal() {
  console.log('🔍 Final stock system diagnosis...\n')

  try {
    // 1. Check recent orders and their status
    console.log('1. Checking recent orders...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, created_at, customer_name')
      .order('created_at', { ascending: false })
      .limit(5)

    if (ordersError) {
      console.error('❌ Orders query failed:', ordersError.message)
      return
    }

    console.log('Recent orders:')
    orders.forEach(order => {
      console.log(`  📦 ${order.id}: ${order.status} - ${order.customer_name} (${order.created_at})`)
    })

    // 2. Check order items for the most recent order
    if (orders.length > 0) {
      const latestOrder = orders[0]
      console.log(`\n2. Checking items for latest order: ${latestOrder.id}`)

      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, variant_id, name, quantity')
        .eq('order_id', latestOrder.id)

      if (itemsError) {
        console.error('❌ Order items query failed:', itemsError.message)
      } else {
        console.log('Order items:')
        orderItems.forEach(item => {
          console.log(`  🛒 ${item.name}: ${item.quantity} units (variant: ${item.variant_id || 'none'})`)
        })
      }
    }

    // 3. Check current stock levels
    console.log('\n3. Checking current stock levels...')

    // Products with stock
    const { data: productsStock, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .not('stock_quantity', 'is', null)

    if (productsError) {
      console.error('❌ Products stock query failed:', productsError.message)
    } else {
      console.log('Products with stock:')
      productsStock.forEach(product => {
        console.log(`  📦 ${product.name}: ${product.stock_quantity} units`)
      })
    }

    // Variants with stock
    const { data: variantsStock, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, name, stock_quantity, product_id')
      .not('stock_quantity', 'is', null)

    if (variantsError) {
      console.error('❌ Variants stock query failed:', variantsError.message)
    } else {
      console.log('Variants with stock:')
      variantsStock.forEach(variant => {
        console.log(`  🔸 ${variant.name}: ${variant.stock_quantity} units`)
      })
    }

    // 4. Test RPC functions directly
    console.log('\n4. Testing RPC functions...')

    if (variantsStock.length > 0) {
      const testVariant = variantsStock[0]
      console.log(`Testing stock deduction on variant: ${testVariant.name} (current: ${testVariant.stock_quantity})`)

      // Test with quantity 1 (should work if stock > 0)
      if (testVariant.stock_quantity > 0) {
        try {
          const { error: deductError } = await supabase.rpc('decrement_variant_stock', {
            variant_id: testVariant.id,
            quantity: 1
          })

          if (deductError) {
            console.error('❌ RPC call failed:', deductError.message)
          } else {
            console.log('✅ RPC call succeeded - checking updated stock...')

            // Check if stock actually decreased
            const { data: updatedVariant } = await supabase
              .from('product_variants')
              .select('stock_quantity')
              .eq('id', testVariant.id)
              .single()

            console.log(`📊 Stock after test: ${updatedVariant?.stock_quantity} (was ${testVariant.stock_quantity})`)
          }
        } catch (e) {
          console.error('❌ RPC test error:', e.message)
        }
      } else {
        console.log('⚠️ Cannot test deduction - variant has 0 stock')
      }
    } else {
      console.log('⚠️ No variants with stock to test')
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugStockFinal()

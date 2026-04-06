const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugStock() {
  console.log('🔍 Debugging stock system...\n')

  try {
    // 1. Check if RPC functions exist
    console.log('1. Testing RPC function existence...')
    try {
      await supabase.rpc('decrement_product_stock', {
        product_id: '00000000-0000-0000-0000-000000000000',
        quantity: 0
      })
      console.log('✅ decrement_product_stock function exists')
    } catch (e) {
      if (e.message.includes('function')) {
        console.log('❌ decrement_product_stock function NOT found')
      } else {
        console.log('✅ decrement_product_stock function exists (expected error for fake ID)')
      }
    }

    // 2. Check orders table structure
    console.log('\n2. Checking orders table...')
    const { data: orderSample, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .limit(1)

    if (orderError) {
      console.log('❌ Orders table error:', orderError.message)
    } else {
      console.log('✅ Orders table accessible')
      if (orderSample && orderSample.length > 0) {
        console.log('Sample order status:', orderSample[0].status || 'null (column missing)')
      }
    }

    // 3. Check recent orders
    console.log('\n3. Checking recent orders...')
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (recentError) {
      console.log('❌ Recent orders query failed:', recentError.message)
    } else {
      console.log('✅ Recent orders:')
      recentOrders.forEach(order => {
        console.log(`  - Order ${order.id}: status=${order.status || 'null'}, created=${order.created_at}`)
      })
    }

    // 4. Check if any products have stock set
    console.log('\n4. Checking products with stock...')
    const { data: stockedProducts, error: stockError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .not('stock_quantity', 'is', null)
      .limit(5)

    if (stockError) {
      console.log('❌ Stock check failed:', stockError.message)
    } else {
      console.log(`✅ Found ${stockedProducts.length} products with stock set:`)
      stockedProducts.forEach(product => {
        console.log(`  - ${product.name}: ${product.stock_quantity} units`)
      })
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error)
  }
}

debugStock()

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStockDB() {
  console.log('🧪 Testing stock database setup...\n')

  try {
    // Check if stock_quantity columns exist
    console.log('1. Checking products table...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .limit(3)

    if (productsError) {
      console.error('❌ Products query failed:', productsError.message)
    } else {
      console.log('✅ Products table accessible')
      console.log('Sample products with stock_quantity:', products)
    }

    console.log('\n2. Checking product_variants table...')
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, name, stock_quantity')
      .limit(3)

    if (variantsError) {
      console.error('❌ Variants query failed:', variantsError.message)
    } else {
      console.log('✅ Variants table accessible')
      console.log('Sample variants with stock_quantity:', variants)
    }

    console.log('\n3. Checking orders table status column...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status')
      .limit(3)

    if (ordersError) {
      console.error('❌ Orders query failed:', ordersError.message)
    } else {
      console.log('✅ Orders table accessible')
      console.log('Sample orders with status:', orders)
    }

    console.log('\n4. Testing RPC functions...')

    // Test RPC function existence (this will fail if functions don't exist)
    try {
      const { error: rpcError } = await supabase.rpc('decrement_product_stock', {
        product_id: '00000000-0000-0000-0000-000000000000', // fake ID
        quantity: 0
      })
      if (rpcError && rpcError.message.includes('function')) {
        console.error('❌ RPC function decrement_product_stock not found')
      } else {
        console.log('✅ RPC function decrement_product_stock exists')
      }
    } catch (e) {
      console.error('❌ RPC function test failed:', e.message)
    }

  } catch (error) {
    console.error('❌ Database test failed:', error)
  }
}

testStockDB()

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDBConnection() {
  console.log('🔍 Checking database connection and permissions...\n')

  try {
    // Test basic connection
    console.log('1. Testing basic SELECT...')
    const { data: testData, error: testError } = await supabase
      .from('product_variants')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Basic SELECT failed:', testError.message)
      return
    }
    console.log('✅ Basic SELECT works')

    // Test INSERT (should fail for anon key)
    console.log('\n2. Testing INSERT permissions...')
    try {
      await supabase
        .from('product_variants')
        .insert({ name: 'test', product_id: '00000000-0000-0000-0000-000000000000' })
      console.log('⚠️ INSERT succeeded (unexpected for anon key)')
    } catch (e) {
      console.log('✅ INSERT correctly blocked:', e.message)
    }

    // Test UPDATE permissions
    console.log('\n3. Testing UPDATE permissions...')
    const { data: variant, error: getError } = await supabase
      .from('product_variants')
      .select('id, stock_quantity')
      .eq('stock_quantity', 4)
      .limit(1)
      .single()

    if (getError || !variant) {
      console.error('❌ Could not find test variant')
      return
    }

    console.log(`Found variant with stock: ${variant.stock_quantity}`)

    // Try UPDATE
    const originalStock = variant.stock_quantity
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: originalStock + 1 })  // Add 1 to test
      .eq('id', variant.id)

    if (updateError) {
      console.error('❌ UPDATE failed:', updateError.message)
    } else {
      console.log('✅ UPDATE succeeded')
      
      // Check if it actually changed
      const { data: checkVariant } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', variant.id)
        .single()
      
      console.log(`Stock after update: ${checkVariant?.stock_quantity} (was ${originalStock})`)
      
      // Reset
      await supabase
        .from('product_variants')
        .update({ stock_quantity: originalStock })
        .eq('id', variant.id)
    }

    // Test RPC function permissions
    console.log('\n4. Testing RPC function permissions...')
    try {
      const { error: rpcError } = await supabase.rpc('decrement_variant_stock', {
        variant_id: variant.id,
        quantity: 0  // Should succeed
      })
      
      if (rpcError) {
        console.error('❌ RPC call failed:', rpcError.message)
      } else {
        console.log('✅ RPC call succeeded')
      }
    } catch (e) {
      console.error('❌ RPC call error:', e.message)
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

checkDBConnection()

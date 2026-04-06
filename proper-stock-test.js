const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function properStockTest() {
  console.log('🧪 Proper stock deduction test...\n')

  try {
    // Get current stock
    const { data: variant, error: getError } = await supabase
      .from('product_variants')
      .select('id, name, stock_quantity')
      .eq('id', '029b7a5e-533a-4cc3-a904-00b8a6219f01')
      .single()

    if (getError || !variant) {
      console.error('❌ Could not get variant')
      return
    }

    console.log(`📊 Initial stock for ${variant.name}: ${variant.stock_quantity}`)

    // Call RPC function
    console.log('🔄 Calling decrement_variant_stock...')
    const { error: rpcError } = await supabase.rpc('decrement_variant_stock', {
      variant_id: variant.id,
      quantity: 1
    })

    if (rpcError) {
      console.error('❌ RPC Error:', rpcError.message)
      return
    }

    // Get stock after RPC call
    const { data: updatedVariant, error: updateError } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variant.id)
      .single()

    if (updateError) {
      console.error('❌ Could not check updated stock')
      return
    }

    const expectedStock = variant.stock_quantity - 1
    console.log(`📊 Stock after RPC: ${updatedVariant.stock_quantity} (expected: ${expectedStock})`)

    if (updatedVariant.stock_quantity === expectedStock) {
      console.log('✅ SUCCESS: Stock deduction worked correctly!')
    } else {
      console.log('❌ FAILURE: Stock was not deducted')
      
      // Additional debugging
      console.log('\n🔍 Additional checks:')
      
      // Check if function exists
      try {
        await supabase.rpc('decrement_variant_stock', { variant_id: variant.id, quantity: 0 })
        console.log('✅ RPC function exists and accepts calls')
      } catch (e) {
        console.log('❌ RPC function call failed:', e.message)
      }
      
      // Check manual update
      console.log('🔄 Trying manual UPDATE...')
      const { error: manualError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: variant.stock_quantity - 1 })
        .eq('id', variant.id)
      
      if (manualError) {
        console.log('❌ Manual update failed:', manualError.message)
      } else {
        console.log('✅ Manual update succeeded')
        
        // Check result
        const { data: manualCheck } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variant.id)
          .single()
        
        console.log(`📊 Stock after manual update: ${manualCheck?.stock_quantity}`)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

properStockTest()

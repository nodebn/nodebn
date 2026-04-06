const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStockDeduction() {
  console.log('🧪 Testing Stock Deduction with Service Role...\n')

  try {
    // 1. Find a variant with stock
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, name, stock_quantity')
      .not('stock_quantity', 'is', null)
      .gt('stock_quantity', 0)
      .limit(1)

    if (variantsError || !variants.length) {
      console.log('❌ No variants with stock found')
      return
    }

    const testVariant = variants[0]
    const originalStock = testVariant.stock_quantity

    console.log(`Found variant: ${testVariant.name} (${testVariant.id})`)
    console.log(`Current stock: ${originalStock}`)

    // 2. Test stock deduction
    console.log('\n📉 Testing stock deduction RPC...')
    const { error: rpcError } = await supabase.rpc('decrement_variant_stock', {
      variant_id: testVariant.id,
      quantity: 1
    })

    if (rpcError) {
      console.log('❌ RPC call failed:', rpcError.message)
      return
    }

    // 3. Check if stock actually decreased
    const { data: updatedVariant } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', testVariant.id)
      .single()

    const newStock = updatedVariant?.stock_quantity

    console.log(`Stock after RPC: ${newStock} (expected: ${originalStock - 1})`)

    if (newStock === originalStock - 1) {
      console.log('✅ SUCCESS: Stock deduction working!')
    } else {
      console.log('❌ FAILURE: Stock not deducted')

      // Reset for testing
      console.log('Resetting stock...')
      await supabase
        .from('product_variants')
        .update({ stock_quantity: originalStock })
        .eq('id', testVariant.id)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testStockDeduction()
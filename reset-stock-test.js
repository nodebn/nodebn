const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function resetAndTestStock() {
  console.log('🔄 Resetting and testing stock...\n')

  try {
    // Find a variant with stock
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('id, name, stock_quantity')
      .not('stock_quantity', 'is', null)
      .limit(5)

    if (error || !variants || variants.length === 0) {
      console.log('❌ No variants with stock found')
      return
    }

    console.log('Available variants:')
    variants.forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}: ${v.stock_quantity} units (${v.id})`)
    })

    // Reset the first variant to have stock for testing
    const testVariant = variants[0]
    if (testVariant.stock_quantity < 2) {
      console.log(`\n📈 Resetting ${testVariant.name} to 5 units for testing...`)
      await supabase
        .from('product_variants')
        .update({ stock_quantity: 5 })
        .eq('id', testVariant.id)
      
      console.log('✅ Stock reset to 5')
    }

    // Now test the RPC function
    console.log(`\n🧪 Testing RPC function on ${testVariant.name}...`)
    const { error: rpcError } = await supabase.rpc('decrement_variant_stock', {
      variant_id: testVariant.id,
      quantity: 1
    })

    if (rpcError) {
      console.error('❌ RPC Error:', rpcError.message)
    } else {
      console.log('✅ RPC Success!')
    }

    // Check final stock
    const { data: finalVariant } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', testVariant.id)
      .single()

    console.log(`📊 Final stock: ${finalVariant?.stock_quantity} (expected: 4)`)

    if (finalVariant?.stock_quantity === 4) {
      console.log('🎉 SUCCESS: Stock deduction is working!')
    } else {
      console.log('❌ FAILURE: Stock deduction not working')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

resetAndTestStock()

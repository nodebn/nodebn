const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRPCDirect() {
  console.log('🧪 Testing RPC function directly...\n')

  try {
    // Get a variant with stock > 0
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('id, name, stock_quantity')
      .gt('stock_quantity', 0)
      .limit(1)

    if (error || !variants || variants.length === 0) {
      console.log('❌ No variants with stock found')
      return
    }

    const variant = variants[0]
    console.log(`Testing variant: ${variant.name} (${variant.id})`)
    console.log(`Current stock: ${variant.stock_quantity}`)

    // Test deduction
    console.log('Calling decrement_variant_stock with quantity=1...')
    const { data, error: rpcError } = await supabase.rpc('decrement_variant_stock', {
      variant_id: variant.id,
      quantity: 1
    })

    if (rpcError) {
      console.error('❌ RPC Error:', rpcError.message)
      console.error('❌ Error details:', rpcError)
    } else {
      console.log('✅ RPC Success, returned:', data)

      // Check new stock
      const { data: updatedVariant, error: checkError } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', variant.id)
        .single()

      if (checkError) {
        console.error('❌ Check error:', checkError.message)
      } else {
        console.log(`📊 New stock: ${updatedVariant.stock_quantity} (expected: ${variant.stock_quantity - 1})`)
        
        if (updatedVariant.stock_quantity === variant.stock_quantity - 1) {
          console.log('✅ Stock deduction worked!')
        } else {
          console.log('❌ Stock deduction failed - no change in database')
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testRPCDirect()

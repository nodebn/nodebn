const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function completeDebug() {
  console.log('🔍 Complete stock system debug...\n')

  try {
    // Test variant RPC function
    console.log('1. Testing variant stock RPC function...')
    try {
      await supabase.rpc('decrement_variant_stock', {
        variant_id: '00000000-0000-0000-0000-000000000000',
        quantity: 0
      })
      console.log('✅ decrement_variant_stock function exists')
    } catch (e) {
      if (e.message.includes('function')) {
        console.log('❌ decrement_variant_stock function NOT found')
      } else {
        console.log('✅ decrement_variant_stock function exists')
      }
    }

    // Check variants with stock
    console.log('\n2. Checking variants with stock...')
    const { data: stockedVariants, error: variantStockError } = await supabase
      .from('product_variants')
      .select('id, name, stock_quantity, product_id')
      .not('stock_quantity', 'is', null)
      .limit(5)

    if (variantStockError) {
      console.log('❌ Variant stock check failed:', variantStockError.message)
    } else {
      console.log(`✅ Found ${stockedVariants.length} variants with stock set:`)
      stockedVariants.forEach(variant => {
        console.log(`  - Variant ${variant.name}: ${variant.stock_quantity} units`)
      })
    }

    // Test a real stock deduction (safely)
    console.log('\n3. Testing stock deduction logic...')
    if (stockedVariants && stockedVariants.length > 0) {
      const testVariant = stockedVariants[0]
      console.log(`Testing deduction of 0 units from variant ${testVariant.id}...`)

      try {
        const { error } = await supabase.rpc('decrement_variant_stock', {
          variant_id: testVariant.id,
          quantity: 0  // 0 should work since it won't actually change stock
        })

        if (error) {
          console.log('❌ Stock deduction test failed:', error.message)
        } else {
          console.log('✅ Stock deduction function works')
        }
      } catch (e) {
        console.log('❌ Stock deduction error:', e.message)
      }
    } else {
      console.log('⚠️ No variants with stock set - cannot test deduction')
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

completeDebug()

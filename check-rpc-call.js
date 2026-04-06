const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRPCCall() {
  console.log('🔍 Checking RPC call format...\n')

  try {
    // Test with exact same format as the application
    console.log('Testing RPC call format used in app...')
    
    const testResult = await supabase.rpc('decrement_variant_stock', {
      variant_id: '1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c',
      quantity: 1
    })
    
    console.log('RPC call result:', testResult)
    console.log('Error:', testResult.error)
    console.log('Data:', testResult.data)
    
    // Check stock after RPC call
    const { data: variant, error: checkError } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', '1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c')
      .single()
    
    if (checkError) {
      console.error('Check error:', checkError)
    } else {
      console.log('Stock after RPC call:', variant.stock_quantity)
    }
    
    // Try calling with named parameters
    console.log('\nTesting with positional parameters...')
    const altResult = await supabase.rpc('decrement_variant_stock', 
      '1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c', 1)
    
    console.log('Positional call result:', altResult)
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

checkRPCCall()

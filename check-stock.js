const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCurrentStock() {
  console.log('📦 Checking Current Stock Levels...\n')

  try {
    // 1. Check products with stock
    console.log('1. Products with stock:')
    console.log('======================')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, is_active')
      .not('stock_quantity', 'is', null)
      .eq('is_active', true)
      .order('stock_quantity', { ascending: false })

    if (productsError) {
      console.error('❌ Products query failed:', productsError.message)
      return
    }

    if (products.length === 0) {
      console.log('No products with stock found')
    } else {
      products.forEach(product => {
        const status = product.stock_quantity === 0 ? '❌ OUT OF STOCK' :
                      product.stock_quantity <= 5 ? '⚠️ LOW STOCK' : '✅ IN STOCK'
        console.log(`${status} ${product.name}: ${product.stock_quantity} units`)
      })
    }

    console.log()

    // 2. Check product variants with stock
    console.log('2. Product Variants with stock:')
    console.log('===============================')
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select(`
        id,
        name,
        stock_quantity,
        product_id,
        products!inner(name, is_active)
      `)
      .not('stock_quantity', 'is', null)
      .eq('products.is_active', true)
      .order('stock_quantity', { ascending: false })

    if (variantsError) {
      console.error('❌ Variants query failed:', variantsError.message)
      return
    }

    if (variants.length === 0) {
      console.log('No product variants with stock found')
    } else {
      variants.forEach(variant => {
        const status = variant.stock_quantity === 0 ? '❌ OUT OF STOCK' :
                      variant.stock_quantity <= 5 ? '⚠️ LOW STOCK' : '✅ IN STOCK'
        console.log(`${status} ${variant.products.name} - ${variant.name}: ${variant.stock_quantity} units`)
      })
    }

    console.log()

    // 3. Summary
    console.log('📊 STOCK SUMMARY:')
    console.log('================')
    const totalProducts = products.filter(p => p.stock_quantity > 0).length
    const totalVariants = variants.filter(v => v.stock_quantity > 0).length
    const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length
    const lowStockVariants = variants.filter(v => v.stock_quantity > 0 && v.stock_quantity <= 5).length
    const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length
    const outOfStockVariants = variants.filter(v => v.stock_quantity === 0).length

    console.log(`✅ Products in stock: ${totalProducts}`)
    console.log(`✅ Variants in stock: ${totalVariants}`)
    console.log(`⚠️ Products low stock (≤5): ${lowStockProducts}`)
    console.log(`⚠️ Variants low stock (≤5): ${lowStockVariants}`)
    console.log(`❌ Products out of stock: ${outOfStockProducts}`)
    console.log(`❌ Variants out of stock: ${outOfStockVariants}`)

    console.log('\n🎉 Stock check complete!')

  } catch (error) {
    console.error('❌ Stock check failed:', error.message)
  }
}

checkCurrentStock()
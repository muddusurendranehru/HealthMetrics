import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function getUnsplashUrl(foodName) {
  const searchTerm = foodName.split('(')[0].trim();
  const cleanTerm = searchTerm.replace(/[^a-zA-Z\s]/g, '').trim();
  return `https://source.unsplash.com/200x200/?${encodeURIComponent(cleanTerm)},food,indian`;
}

async function addImageUrls() {
  try {
    console.log('🖼️  Adding Image URLs to NutriBot Foods');
    console.log('=========================================\n');
    
    const foods = await sql`
      SELECT id, food_name, image_url
      FROM food_nutrition
      WHERE image_url IS NULL OR image_url = ''
    `;
    
    console.log(`📊 Found ${foods.length} foods without images\n`);
    
    if (foods.length === 0) {
      console.log('✅ All foods already have images!');
      return;
    }
    
    console.log('🎨 Using Unsplash real food images\n');
    
    let successCount = 0;
    
    for (const food of foods) {
      const imageUrl = getUnsplashUrl(food.food_name);
      
      await sql`
        UPDATE food_nutrition
        SET image_url = ${imageUrl}
        WHERE id = ${food.id}
      `;
      
      successCount++;
      
      if (successCount % 50 === 0) {
        console.log(`   ✓ Updated ${successCount}/${foods.length} items`);
      }
    }
    
    console.log(`\n✅ Successfully added images to ${successCount} foods!`);
    
    const samples = await sql`
      SELECT food_name, image_url
      FROM food_nutrition
      WHERE image_url IS NOT NULL
      LIMIT 5
    `;
    
    console.log('\n📸 Sample Results:');
    samples.forEach(food => {
      console.log(`   ${food.food_name}`);
      console.log(`   🔗 ${food.image_url}\n`);
    });
    
    const total = await sql`SELECT COUNT(*) as count FROM food_nutrition WHERE image_url IS NOT NULL`;
    console.log(`📊 Total foods with images: ${total[0].count}/1197`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

addImageUrls().catch(console.error);

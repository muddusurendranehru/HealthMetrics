import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const streetFoods = [
  // Samosa varieties (excluding generic "Samosa" - already exists)
  { food_name: 'Samosa (Vegetable)', calories: 252, protein_g: 5.0, carbs_g: 27.0, fats_g: 14.0 },
  { food_name: 'Samosa (Paneer)', calories: 268, protein_g: 7.0, carbs_g: 26.0, fats_g: 15.5 },
  { food_name: 'Samosa (Keema)', calories: 290, protein_g: 12.0, carbs_g: 25.0, fats_g: 16.0 },
  
  // Kachori varieties (excluding generic "Kachori" - already exists)
  { food_name: 'Kachori (Dal)', calories: 280, protein_g: 6.0, carbs_g: 30.0, fats_g: 15.0 },
  { food_name: 'Kachori (Pyaaz)', calories: 275, protein_g: 5.5, carbs_g: 29.0, fats_g: 14.5 },
  { food_name: 'Kachori (Matar)', calories: 285, protein_g: 7.0, carbs_g: 31.0, fats_g: 14.0 },
  
  // Pakora varieties (excluding existing ones)
  { food_name: 'Pakora (Chicken)', calories: 215, protein_g: 14.0, carbs_g: 12.0, fats_g: 13.5 },
  
  // Tikki and Pattice
  { food_name: 'Aloo Tikki', calories: 180, protein_g: 3.5, carbs_g: 25.0, fats_g: 7.0 },
  { food_name: 'Ragda Pattice', calories: 185, protein_g: 5.5, carbs_g: 27.0, fats_g: 6.0 },
  
  // Chaat items (excluding existing ones)
  { food_name: 'Papri Chaat', calories: 195, protein_g: 5.0, carbs_g: 28.0, fats_g: 6.5 },
  { food_name: 'Dahi Bhalla', calories: 150, protein_g: 6.0, carbs_g: 20.0, fats_g: 5.5 },
  
  // Rolls (excluding existing ones)
  { food_name: 'Kathi Roll (Paneer)', calories: 295, protein_g: 10.0, carbs_g: 34.0, fats_g: 12.5 },
  { food_name: 'Kathi Roll (Egg)', calories: 275, protein_g: 13.0, carbs_g: 30.0, fats_g: 11.0 },
  { food_name: 'Kebab Roll', calories: 270, protein_g: 14.0, carbs_g: 28.0, fats_g: 12.0 },
  { food_name: 'Seekh Kebab Roll', calories: 285, protein_g: 16.0, carbs_g: 27.0, fats_g: 13.5 },
  
  // Frankie (excluding existing ones)
  { food_name: 'Frankie (Chicken)', calories: 310, protein_g: 16.0, carbs_g: 35.0, fats_g: 12.0 },
  
  // Spring Roll (excluding existing "Spring Roll")
  { food_name: 'Spring Roll (Veg)', calories: 185, protein_g: 5.5, carbs_g: 25.0, fats_g: 6.5 },
  { food_name: 'Spring Roll (Chicken)', calories: 205, protein_g: 10.0, carbs_g: 22.0, fats_g: 8.5 },
  
  // Momos varieties (excluding existing generic ones)
  { food_name: 'Momos (Veg Steamed)', calories: 105, protein_g: 3.8, carbs_g: 16.5, fats_g: 2.0 },
  { food_name: 'Momos (Veg Fried)', calories: 195, protein_g: 5.0, carbs_g: 22.0, fats_g: 9.0 },
  { food_name: 'Momos (Chicken Steamed)', calories: 120, protein_g: 8.0, carbs_g: 14.0, fats_g: 3.5 },
  { food_name: 'Momos (Chicken Fried)', calories: 220, protein_g: 10.0, carbs_g: 20.0, fats_g: 11.0 },
  
  // Puffs
  { food_name: 'Puff (Veg)', calories: 285, protein_g: 5.5, carbs_g: 30.0, fats_g: 16.0 },
  { food_name: 'Puff (Egg)', calories: 295, protein_g: 9.0, carbs_g: 28.0, fats_g: 17.0 },
  { food_name: 'Puff (Chicken)', calories: 310, protein_g: 12.0, carbs_g: 27.0, fats_g: 18.0 },
  
  // Cutlets
  { food_name: 'Cutlet (Veg)', calories: 175, protein_g: 4.5, carbs_g: 22.0, fats_g: 7.5 },
  { food_name: 'Cutlet (Chicken)', calories: 195, protein_g: 12.0, carbs_g: 15.0, fats_g: 9.5 },
  
  // Burgers (excluding generic "burger")
  { food_name: 'Burger (Veg)', calories: 240, protein_g: 8.0, carbs_g: 32.0, fats_g: 9.0 },
  { food_name: 'Burger (Chicken)', calories: 265, protein_g: 15.0, carbs_g: 30.0, fats_g: 10.5 },
  { food_name: 'Burger (Paneer)', calories: 255, protein_g: 10.0, carbs_g: 31.0, fats_g: 10.0 },
  { food_name: 'Burger (Aloo Tikki)', calories: 235, protein_g: 6.5, carbs_g: 34.0, fats_g: 8.5 },
  { food_name: 'Burger (McAloo Tikki Style)', calories: 245, protein_g: 7.0, carbs_g: 35.0, fats_g: 9.0 },
  { food_name: 'Cheeseburger', calories: 295, protein_g: 16.0, carbs_g: 28.0, fats_g: 14.0 },
  { food_name: 'Chicken Burger (Crispy)', calories: 320, protein_g: 18.0, carbs_g: 30.0, fats_g: 15.0 },
  { food_name: 'Fish Burger', calories: 275, protein_g: 14.0, carbs_g: 28.0, fats_g: 12.5 },
  
  // Pizza varieties (excluding generic "pizza")
  { food_name: 'Pizza (Margherita)', calories: 266, protein_g: 11.0, carbs_g: 33.0, fats_g: 10.0 },
  { food_name: 'Pizza (Veggie)', calories: 250, protein_g: 10.5, carbs_g: 32.0, fats_g: 9.5 },
  { food_name: 'Pizza (Paneer Tikka)', calories: 280, protein_g: 12.0, carbs_g: 31.0, fats_g: 12.0 },
  { food_name: 'Pizza (Chicken)', calories: 290, protein_g: 14.0, carbs_g: 30.0, fats_g: 12.5 },
  { food_name: 'Pizza (Pepperoni)', calories: 298, protein_g: 13.0, carbs_g: 31.0, fats_g: 13.5 },
  { food_name: 'Pizza (Cheese)', calories: 271, protein_g: 12.0, carbs_g: 33.0, fats_g: 10.5 },
  
  // Fast food items
  { food_name: 'French Fries', calories: 312, protein_g: 3.4, carbs_g: 41.0, fats_g: 15.0 },
  { food_name: 'Potato Wedges', calories: 165, protein_g: 3.0, carbs_g: 24.0, fats_g: 6.5 },
  { food_name: 'Fried Chicken (Pieces)', calories: 260, protein_g: 19.0, carbs_g: 10.0, fats_g: 16.5 },
  { food_name: 'Chicken Nuggets', calories: 296, protein_g: 15.0, carbs_g: 18.0, fats_g: 18.5 },
  { food_name: 'Chicken Popcorn', calories: 285, protein_g: 16.0, carbs_g: 17.0, fats_g: 17.0 },
  { food_name: 'Hot Dog', calories: 290, protein_g: 10.5, carbs_g: 23.0, fats_g: 18.0 },
  { food_name: 'Corn Dog', calories: 250, protein_g: 8.0, carbs_g: 28.0, fats_g: 12.0 },
  { food_name: 'Nachos (with Cheese)', calories: 312, protein_g: 7.5, carbs_g: 36.0, fats_g: 15.5 },
  
  // Mexican items
  { food_name: 'Tacos (Veg)', calories: 185, protein_g: 5.0, carbs_g: 24.0, fats_g: 8.0 },
  { food_name: 'Tacos (Chicken)', calories: 225, protein_g: 12.0, carbs_g: 22.0, fats_g: 10.5 },
  { food_name: 'Burrito (Veg)', calories: 180, protein_g: 6.0, carbs_g: 28.0, fats_g: 5.5 },
  { food_name: 'Burrito (Chicken)', calories: 215, protein_g: 13.0, carbs_g: 26.0, fats_g: 7.5 },
  { food_name: 'Quesadilla (Cheese)', calories: 240, protein_g: 11.0, carbs_g: 25.0, fats_g: 11.5 },
  { food_name: 'Quesadilla (Chicken)', calories: 265, protein_g: 15.0, carbs_g: 24.0, fats_g: 13.0 },
  
  // Middle Eastern
  { food_name: 'Shawarma (Chicken)', calories: 250, protein_g: 18.0, carbs_g: 20.0, fats_g: 12.0 },
  { food_name: 'Shawarma (Paneer)', calories: 235, protein_g: 11.0, carbs_g: 22.0, fats_g: 11.5 },
  { food_name: 'Falafel', calories: 333, protein_g: 13.3, carbs_g: 31.8, fats_g: 17.8 },
  
  // Sandwiches (excluding existing ones)
  { food_name: 'Sandwich (Chicken Grilled)', calories: 230, protein_g: 14.0, carbs_g: 24.0, fats_g: 8.5 },
  { food_name: 'Egg Sandwich', calories: 215, protein_g: 11.0, carbs_g: 22.0, fats_g: 9.5 },
  { food_name: 'Chicken Sandwich', calories: 245, protein_g: 15.0, carbs_g: 23.0, fats_g: 10.5 },
  { food_name: 'Fish Sandwich', calories: 255, protein_g: 13.5, carbs_g: 25.0, fats_g: 11.5 },
  
  // Wraps
  { food_name: 'Dosa Wrap', calories: 180, protein_g: 4.5, carbs_g: 32.0, fats_g: 4.0 },
  { food_name: 'Paneer Wrap', calories: 265, protein_g: 11.0, carbs_g: 30.0, fats_g: 11.5 },
  { food_name: 'Chicken Wrap', calories: 285, protein_g: 16.0, carbs_g: 29.0, fats_g: 12.0 },
  { food_name: 'Falafel Wrap', calories: 295, protein_g: 12.0, carbs_g: 35.0, fats_g: 12.5 },
  
  // Desserts/Snacks
  { food_name: 'Donuts', calories: 452, protein_g: 4.9, carbs_g: 51.0, fats_g: 25.0 },
  { food_name: 'Croissant', calories: 406, protein_g: 8.2, carbs_g: 45.8, fats_g: 21.0 },
  { food_name: 'Muffin (Chocolate)', calories: 425, protein_g: 6.0, carbs_g: 52.0, fats_g: 22.0 },
  { food_name: 'Cookies (Chocolate Chip)', calories: 502, protein_g: 5.4, carbs_g: 64.0, fats_g: 25.0 },
  
  // Restaurant items
  { food_name: 'Fried Rice (Restaurant Style)', calories: 130, protein_g: 4.0, carbs_g: 24.0, fats_g: 2.5 },
  { food_name: 'Noodles (Hakka)', calories: 175, protein_g: 5.5, carbs_g: 29.0, fats_g: 4.0 }
];

async function importStreetFoods() {
  console.log(`🚀 Starting import of ${streetFoods.length} street foods...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const food of streetFoods) {
    try {
      await sql`
        INSERT INTO food_nutrition (food_name, calories, protein_g, carbs_g, fats_g)
        VALUES (
          ${food.food_name},
          ${food.calories},
          ${food.protein_g},
          ${food.carbs_g},
          ${food.fats_g}
        )
      `;
      console.log(`✅ Added: ${food.food_name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add ${food.food_name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n✨ Import complete!`);
  console.log(`✅ Successfully added: ${successCount} foods`);
  console.log(`❌ Failed: ${errorCount} foods`);
  
  // Show new total
  const result = await sql`SELECT COUNT(*) as total FROM food_nutrition`;
  console.log(`📊 Total foods in database: ${result[0].total}`);
}

importStreetFoods().catch(console.error);

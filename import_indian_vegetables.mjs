import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const indianVegetables = [
  { food_name: 'Palak (Spinach)', calories: 23, protein_g: 2.9, carbs_g: 3.6, fats_g: 0.4 },
  { food_name: 'Vankaya (Brinjal)', calories: 25, protein_g: 1.0, carbs_g: 6.0, fats_g: 0.2 },
  { food_name: 'Carrot (Gajjar)', calories: 41, protein_g: 0.9, carbs_g: 10.0, fats_g: 0.2 },
  { food_name: 'Tomato (Tamatar)', calories: 18, protein_g: 0.9, carbs_g: 3.9, fats_g: 0.2 },
  { food_name: 'Cucumber (Kheera)', calories: 16, protein_g: 0.7, carbs_g: 3.6, fats_g: 0.1 },
  { food_name: 'Capsicum (Simla Mirch)', calories: 31, protein_g: 1.0, carbs_g: 6.0, fats_g: 0.3 },
  { food_name: 'Onion (Pyaz)', calories: 40, protein_g: 1.1, carbs_g: 9.3, fats_g: 0.1 },
  { food_name: 'Cauliflower (Gobi)', calories: 25, protein_g: 1.9, carbs_g: 5.0, fats_g: 0.3 },
  { food_name: 'Cabbage (Patta Gobi)', calories: 25, protein_g: 1.3, carbs_g: 5.8, fats_g: 0.1 },
  { food_name: 'Dosakai (Yellow Cucumber)', calories: 16, protein_g: 0.7, carbs_g: 3.5, fats_g: 0.1 },
  { food_name: 'Potato (Aloo)', calories: 77, protein_g: 2.0, carbs_g: 17.5, fats_g: 0.1 },
  { food_name: 'Bendakaya (Okra)', calories: 33, protein_g: 1.9, carbs_g: 7.5, fats_g: 0.2 },
  { food_name: 'Green Chilli (Mirchi)', calories: 40, protein_g: 1.9, carbs_g: 8.8, fats_g: 0.4 },
  { food_name: 'Sweet Potato (Shakarkandi)', calories: 86, protein_g: 1.6, carbs_g: 20.1, fats_g: 0.1 },
  { food_name: 'Beetroot (Chukandar)', calories: 43, protein_g: 1.6, carbs_g: 9.6, fats_g: 0.2 },
  { food_name: 'Pumpkin (Kaddu)', calories: 26, protein_g: 1.0, carbs_g: 6.5, fats_g: 0.1 },
  { food_name: 'Bottle Gourd (Lauki)', calories: 14, protein_g: 0.6, carbs_g: 3.4, fats_g: 0.0 },
  { food_name: 'Ridge Gourd (Turai)', calories: 20, protein_g: 1.2, carbs_g: 4.0, fats_g: 0.2 },
  { food_name: 'Bitter Gourd (Karela)', calories: 17, protein_g: 1.0, carbs_g: 3.7, fats_g: 0.2 },
  { food_name: 'Snake Gourd (Chichinda)', calories: 18, protein_g: 0.5, carbs_g: 4.0, fats_g: 0.2 },
  { food_name: 'Pointed Gourd (Parwal)', calories: 20, protein_g: 2.0, carbs_g: 2.9, fats_g: 0.3 },
  { food_name: 'Radish (Mooli)', calories: 16, protein_g: 0.7, carbs_g: 3.4, fats_g: 0.1 },
  { food_name: 'White Radish (Mullangi)', calories: 18, protein_g: 0.6, carbs_g: 4.1, fats_g: 0.1 },
  { food_name: 'Turnip (Shalgam)', calories: 28, protein_g: 0.9, carbs_g: 6.4, fats_g: 0.1 },
  { food_name: 'Mushroom (Khumb)', calories: 22, protein_g: 3.1, carbs_g: 3.3, fats_g: 0.3 },
  { food_name: 'Green Beans (Beans)', calories: 31, protein_g: 1.8, carbs_g: 7.0, fats_g: 0.2 },
  { food_name: 'Cluster Beans (Guar)', calories: 49, protein_g: 3.2, carbs_g: 10.8, fats_g: 0.4 },
  { food_name: 'Broad Beans (Sem)', calories: 72, protein_g: 5.4, carbs_g: 12.0, fats_g: 0.7 },
  { food_name: 'French Beans', calories: 31, protein_g: 1.8, carbs_g: 7.0, fats_g: 0.2 },
  { food_name: 'Green Peas (Matar)', calories: 81, protein_g: 5.4, carbs_g: 14.5, fats_g: 0.4 },
  { food_name: 'Corn (Makka)', calories: 86, protein_g: 3.3, carbs_g: 19.0, fats_g: 1.4 },
  { food_name: 'Coriander Leaves (Dhania)', calories: 23, protein_g: 2.1, carbs_g: 3.7, fats_g: 0.5 },
  { food_name: 'Mint Leaves (Pudina)', calories: 70, protein_g: 3.8, carbs_g: 14.9, fats_g: 0.9 },
  { food_name: 'Curry Leaves (Kadi Patta)', calories: 108, protein_g: 6.1, carbs_g: 18.7, fats_g: 1.0 },
  { food_name: 'Fenugreek Leaves (Methi)', calories: 49, protein_g: 4.4, carbs_g: 6.0, fats_g: 0.9 },
  { food_name: 'Amaranth Leaves (Thotakura)', calories: 23, protein_g: 2.5, carbs_g: 4.0, fats_g: 0.3 },
  { food_name: 'Colocasia Leaves (Arbi Patta)', calories: 56, protein_g: 5.8, carbs_g: 9.9, fats_g: 1.0 },
  { food_name: 'Drumstick (Moringa)', calories: 37, protein_g: 2.1, carbs_g: 8.5, fats_g: 0.2 },
  { food_name: 'Drumstick Leaves', calories: 64, protein_g: 9.4, carbs_g: 12.5, fats_g: 1.7 },
  { food_name: 'Ivy Gourd (Tindora)', calories: 19, protein_g: 0.6, carbs_g: 4.3, fats_g: 0.1 },
  { food_name: 'Ash Gourd (Petha)', calories: 13, protein_g: 0.4, carbs_g: 3.0, fats_g: 0.2 },
  { food_name: 'Red Pumpkin (Lal Kaddu)', calories: 26, protein_g: 1.0, carbs_g: 6.5, fats_g: 0.1 },
  { food_name: 'Spring Onion (Hara Pyaz)', calories: 32, protein_g: 1.8, carbs_g: 7.3, fats_g: 0.2 },
  { food_name: 'Garlic (Lehsun)', calories: 149, protein_g: 6.4, carbs_g: 33.1, fats_g: 0.5 },
  { food_name: 'Ginger (Adrak)', calories: 80, protein_g: 1.8, carbs_g: 17.8, fats_g: 0.8 },
  { food_name: 'Red Onion (Lal Pyaz)', calories: 40, protein_g: 1.1, carbs_g: 9.3, fats_g: 0.1 },
  { food_name: 'White Onion (Safed Pyaz)', calories: 40, protein_g: 1.1, carbs_g: 9.3, fats_g: 0.1 },
  { food_name: 'Shallots (Chinna Ullipaya)', calories: 72, protein_g: 2.5, carbs_g: 16.8, fats_g: 0.1 },
  { food_name: 'Cherry Tomato', calories: 18, protein_g: 0.9, carbs_g: 3.9, fats_g: 0.2 },
  { food_name: 'Red Capsicum', calories: 31, protein_g: 1.0, carbs_g: 6.0, fats_g: 0.3 },
  { food_name: 'Yellow Capsicum', calories: 27, protein_g: 1.0, carbs_g: 6.3, fats_g: 0.2 },
  { food_name: 'Green Capsicum', calories: 20, protein_g: 0.9, carbs_g: 4.6, fats_g: 0.2 },
  { food_name: 'Chana (Chickpeas)', calories: 164, protein_g: 8.9, carbs_g: 27.4, fats_g: 2.6 },
  { food_name: 'Rajma (Kidney Beans)', calories: 127, protein_g: 8.7, carbs_g: 22.8, fats_g: 0.5 },
  { food_name: 'Kabuli Chana', calories: 164, protein_g: 8.9, carbs_g: 27.4, fats_g: 2.6 },
  { food_name: 'Kala Chana (Black Chickpeas)', calories: 364, protein_g: 17.0, carbs_g: 61.0, fats_g: 6.0 },
  { food_name: 'Green Moong (Mung Beans)', calories: 105, protein_g: 7.0, carbs_g: 19.0, fats_g: 0.4 },
  { food_name: 'Yellow Moong Dal', calories: 347, protein_g: 24.0, carbs_g: 63.0, fats_g: 1.2 },
  { food_name: 'Masoor Dal (Red Lentils)', calories: 116, protein_g: 9.0, carbs_g: 20.0, fats_g: 0.4 },
  { food_name: 'Toor Dal (Pigeon Peas)', calories: 335, protein_g: 22.0, carbs_g: 62.0, fats_g: 1.5 },
  { food_name: 'Urad Dal (Black Gram)', calories: 341, protein_g: 25.0, carbs_g: 59.0, fats_g: 1.6 },
  { food_name: 'Chana Dal (Split Chickpeas)', calories: 360, protein_g: 22.0, carbs_g: 60.0, fats_g: 5.6 },
  { food_name: 'Soybean', calories: 446, protein_g: 36.0, carbs_g: 30.0, fats_g: 20.0 },
  { food_name: 'Peanuts (Moongphali)', calories: 567, protein_g: 25.8, carbs_g: 16.1, fats_g: 49.2 },
  { food_name: 'Baby Corn', calories: 86, protein_g: 3.3, carbs_g: 19.0, fats_g: 1.4 },
  { food_name: 'Coconut (Nariyal)', calories: 354, protein_g: 3.3, carbs_g: 15.2, fats_g: 33.5 },
  { food_name: 'Raw Mango (Kairi)', calories: 60, protein_g: 0.8, carbs_g: 15.0, fats_g: 0.4 },
  { food_name: 'Green Papaya', calories: 39, protein_g: 0.6, carbs_g: 10.0, fats_g: 0.1 },
  { food_name: 'Raw Banana (Kela)', calories: 89, protein_g: 1.1, carbs_g: 22.8, fats_g: 0.3 },
  { food_name: 'Raw Jackfruit (Kathal)', calories: 95, protein_g: 1.7, carbs_g: 23.2, fats_g: 0.6 },
  { food_name: 'Plantain Stem (Vazhapindi)', calories: 20, protein_g: 0.5, carbs_g: 4.5, fats_g: 0.1 },
  { food_name: 'Banana Flower (Vazhaipoo)', calories: 51, protein_g: 1.6, carbs_g: 9.9, fats_g: 0.5 },
  { food_name: 'Taro Root (Arbi)', calories: 112, protein_g: 1.5, carbs_g: 26.5, fats_g: 0.2 },
  { food_name: 'Yam (Suran)', calories: 118, protein_g: 1.5, carbs_g: 27.9, fats_g: 0.2 },
  { food_name: 'Elephant Foot Yam (Jimikand)', calories: 118, protein_g: 1.5, carbs_g: 27.9, fats_g: 0.2 },
  { food_name: 'Lotus Root (Kamal Kakdi)', calories: 74, protein_g: 2.6, carbs_g: 17.2, fats_g: 0.1 },
  { food_name: 'Lotus Stem (Nadru)', calories: 74, protein_g: 2.6, carbs_g: 17.2, fats_g: 0.1 },
  { food_name: 'Water Chestnut (Singhara)', calories: 97, protein_g: 1.4, carbs_g: 23.9, fats_g: 0.1 },
  { food_name: 'Sweet Corn (Meetha Makka)', calories: 86, protein_g: 3.3, carbs_g: 19.0, fats_g: 1.4 },
  { food_name: 'Baby Potato', calories: 77, protein_g: 2.0, carbs_g: 17.5, fats_g: 0.1 },
  { food_name: 'Broccoli', calories: 34, protein_g: 2.8, carbs_g: 7.0, fats_g: 0.4 },
  { food_name: 'Zucchini', calories: 17, protein_g: 1.2, carbs_g: 3.1, fats_g: 0.3 },
  { food_name: 'Lettuce (Salad Patta)', calories: 15, protein_g: 1.4, carbs_g: 2.9, fats_g: 0.2 },
  { food_name: 'Celery', calories: 14, protein_g: 0.7, carbs_g: 3.0, fats_g: 0.2 },
  { food_name: 'Leek', calories: 61, protein_g: 1.5, carbs_g: 14.2, fats_g: 0.3 },
  { food_name: 'Fennel (Saunf Bulb)', calories: 31, protein_g: 1.2, carbs_g: 7.3, fats_g: 0.2 },
  { food_name: 'Chinese Cabbage', calories: 16, protein_g: 1.2, carbs_g: 3.2, fats_g: 0.2 },
  { food_name: 'Red Cabbage (Lal Patta Gobi)', calories: 31, protein_g: 1.4, carbs_g: 7.4, fats_g: 0.2 },
  { food_name: 'Mustard Greens (Sarson Saag)', calories: 27, protein_g: 2.9, carbs_g: 4.7, fats_g: 0.4 },
  { food_name: 'Bathua (Lamb\'s Quarters)', calories: 43, protein_g: 4.2, carbs_g: 7.3, fats_g: 0.8 },
  { food_name: 'Baby Spinach (Choti Palak)', calories: 23, protein_g: 2.9, carbs_g: 3.6, fats_g: 0.4 },
  { food_name: 'Basil (Tulsi)', calories: 23, protein_g: 3.2, carbs_g: 2.7, fats_g: 0.6 },
  { food_name: 'Dill (Suva Bhaji)', calories: 43, protein_g: 3.5, carbs_g: 7.0, fats_g: 1.1 },
  { food_name: 'Parsley (Ajmood)', calories: 36, protein_g: 3.0, carbs_g: 6.3, fats_g: 0.8 },
  { food_name: 'Bay Leaf (Tej Patta)', calories: 313, protein_g: 7.6, carbs_g: 75.0, fats_g: 8.4 },
  { food_name: 'Oregano', calories: 265, protein_g: 9.0, carbs_g: 68.9, fats_g: 4.3 },
  { food_name: 'Thyme', calories: 101, protein_g: 5.6, carbs_g: 24.5, fats_g: 1.7 },
  { food_name: 'Rosemary', calories: 131, protein_g: 3.3, carbs_g: 20.7, fats_g: 5.9 }
];

async function importIndianVegetables() {
  console.log(`🚀 Starting import of ${indianVegetables.length} vegetables with Indian names...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const veg of indianVegetables) {
    try {
      await sql`
        INSERT INTO food_nutrition (food_name, calories, protein_g, carbs_g, fats_g)
        VALUES (
          ${veg.food_name},
          ${veg.calories},
          ${veg.protein_g},
          ${veg.carbs_g},
          ${veg.fats_g}
        )
      `;
      console.log(`✅ Added: ${veg.food_name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add ${veg.food_name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n✨ Import complete!`);
  console.log(`✅ Successfully added: ${successCount} vegetables`);
  console.log(`❌ Failed: ${errorCount} vegetables`);
  
  // Show new total
  const result = await sql`SELECT COUNT(*) as total FROM food_nutrition`;
  console.log(`📊 Total foods in database: ${result[0].total}`);
}

importIndianVegetables().catch(console.error);

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = "postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function testDatabaseContent() {
  const pool = new Pool({ connectionString });
  
  try {
    console.log("🔍 TESTING DATABASE STRUCTURE AND CONTENT");
    console.log("=" .repeat(80));
    
    // ========================================
    // 1. ALL TABLES
    // ========================================
    console.log("\n📋 ALL TABLES IN DATABASE:\n");
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`Total tables: ${tables.rows.length}\n`);
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // ========================================
    // 2. USERS TABLE
    // ========================================
    console.log("\n" + "=" .repeat(80));
    console.log("\n👤 TABLE: USERS\n");
    
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log("Columns:");
    usersColumns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  - ${col.column_name}: ${col.data_type} (${nullable})`);
    });
    
    const usersCount = await pool.query(`SELECT COUNT(*) as count FROM users`);
    console.log(`\nTotal rows: ${usersCount.rows[0].count}`);
    
    const usersSample = await pool.query(`
      SELECT id, email, username, full_name, age, created_at
      FROM users
      LIMIT 3
    `);
    
    console.log("\nSample data:");
    usersSample.rows.forEach((row, idx) => {
      console.log(`\n  Row ${idx + 1}:`);
      console.log(`    ID: ${row.id}`);
      console.log(`    Email: ${row.email}`);
      console.log(`    Username: ${row.username || 'NULL'}`);
      console.log(`    Full Name: ${row.full_name || 'NULL'}`);
      console.log(`    Age: ${row.age || 'NULL'}`);
      console.log(`    Created: ${row.created_at}`);
    });
    
    // ========================================
    // 3. MEALS TABLE
    // ========================================
    console.log("\n" + "=" .repeat(80));
    console.log("\n🍽️  TABLE: MEALS\n");
    
    const mealsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'meals'
      ORDER BY ordinal_position
    `);
    
    console.log("Columns:");
    mealsColumns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  - ${col.column_name}: ${col.data_type} (${nullable})`);
    });
    
    const mealsCount = await pool.query(`SELECT COUNT(*) as count FROM meals`);
    console.log(`\nTotal rows: ${mealsCount.rows[0].count}`);
    
    const mealsByType = await pool.query(`
      SELECT meal_type, COUNT(*) as count
      FROM meals
      GROUP BY meal_type
      ORDER BY count DESC
    `);
    
    console.log("\nMeals by type:");
    mealsByType.rows.forEach(row => {
      console.log(`  ${row.meal_type}: ${row.count}`);
    });
    
    const mealsSample = await pool.query(`
      SELECT id, user_id, meal_name, meal_type, calories, protein_g, carbs_g, fats_g
      FROM meals
      LIMIT 3
    `);
    
    console.log("\nSample data:");
    mealsSample.rows.forEach((row, idx) => {
      console.log(`\n  Row ${idx + 1}:`);
      console.log(`    Meal: ${row.meal_name} (${row.meal_type})`);
      console.log(`    Nutrition: ${row.calories} cal | P: ${row.protein_g}g | C: ${row.carbs_g}g | F: ${row.fats_g}g`);
    });
    
    // ========================================
    // 4. EXERCISES TABLE
    // ========================================
    console.log("\n" + "=" .repeat(80));
    console.log("\n💪 TABLE: EXERCISES\n");
    
    const exercisesCount = await pool.query(`SELECT COUNT(*) as count FROM exercises`);
    console.log(`Total rows: ${exercisesCount.rows[0].count}`);
    
    const exercisesSample = await pool.query(`
      SELECT id, exercise_name, exercise_type, duration_minutes, calories_burned
      FROM exercises
      LIMIT 3
    `);
    
    console.log("\nSample data:");
    exercisesSample.rows.forEach((row, idx) => {
      console.log(`\n  Row ${idx + 1}:`);
      console.log(`    Exercise: ${row.exercise_name} (${row.exercise_type})`);
      console.log(`    Duration: ${row.duration_minutes} min | Burned: ${row.calories_burned} cal`);
    });
    
    // ========================================
    // 5. SLEEP_RECORDS TABLE
    // ========================================
    console.log("\n" + "=" .repeat(80));
    console.log("\n😴 TABLE: SLEEP_RECORDS\n");
    
    const sleepCount = await pool.query(`SELECT COUNT(*) as count FROM sleep_records`);
    console.log(`Total rows: ${sleepCount.rows[0].count}`);
    
    const sleepSample = await pool.query(`
      SELECT id, sleep_date, total_hours, sleep_quality
      FROM sleep_records
      LIMIT 3
    `);
    
    console.log("\nSample data:");
    sleepSample.rows.forEach((row, idx) => {
      console.log(`\n  Row ${idx + 1}:`);
      console.log(`    Date: ${row.sleep_date}`);
      console.log(`    Hours: ${row.total_hours} | Quality: ${row.sleep_quality}/5`);
    });
    
    // ========================================
    // 6. FOOD_NUTRITION TABLE
    // ========================================
    console.log("\n" + "=" .repeat(80));
    console.log("\n🍕 TABLE: FOOD_NUTRITION\n");
    
    const foodColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'food_nutrition'
      ORDER BY ordinal_position
    `);
    
    console.log("Columns:");
    foodColumns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  - ${col.column_name}: ${col.data_type} (${nullable})`);
    });
    
    const foodCount = await pool.query(`SELECT COUNT(*) as count FROM food_nutrition`);
    console.log(`\nTotal rows: ${foodCount.rows[0].count}`);
    
    const foodByCategory = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM food_nutrition
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `);
    
    console.log("\nTop 5 categories:");
    foodByCategory.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} foods`);
    });
    
    const foodSample = await pool.query(`
      SELECT id, food_name, local_name, calories, protein_g, carbs_g, fats_g, serving_size, category
      FROM food_nutrition
      LIMIT 5
    `);
    
    console.log("\nSample data:");
    foodSample.rows.forEach((row, idx) => {
      console.log(`\n  Row ${idx + 1}:`);
      console.log(`    Name: ${row.food_name}`);
      if (row.local_name) console.log(`    Local: ${row.local_name}`);
      console.log(`    Category: ${row.category}`);
      console.log(`    Nutrition: ${row.calories} cal | P: ${row.protein_g}g | C: ${row.carbs_g}g | F: ${row.fats_g}g`);
      console.log(`    Serving: ${row.serving_size}`);
    });
    
    // Search test - Pizza
    console.log("\n🔍 Search test: 'pizza'");
    const pizzaSearch = await pool.query(`
      SELECT food_name, local_name, calories, protein_g, carbs_g, fats_g
      FROM food_nutrition
      WHERE food_name ILIKE '%pizza%' OR local_name ILIKE '%pizza%'
      LIMIT 5
    `);
    
    if (pizzaSearch.rows.length > 0) {
      console.log(`\nFound ${pizzaSearch.rows.length} results:`);
      pizzaSearch.rows.forEach((row, idx) => {
        console.log(`  ${idx + 1}. ${row.food_name} - ${row.calories} cal | P: ${row.protein_g}g | C: ${row.carbs_g}g | F: ${row.fats_g}g`);
      });
    } else {
      console.log("  No pizza found. Add some pizza data!");
    }
    
    // ========================================
    // 7. USER_SESSIONS TABLE
    // ========================================
    console.log("\n" + "=" .repeat(80));
    console.log("\n🔐 TABLE: USER_SESSIONS\n");
    
    const sessionsCount = await pool.query(`SELECT COUNT(*) as count FROM user_sessions`);
    console.log(`Active sessions: ${sessionsCount.rows[0].count}`);
    
    // ========================================
    // SUMMARY
    // ========================================
    console.log("\n" + "=" .repeat(80));
    console.log("\n📊 DATABASE SUMMARY\n");
    
    const summary = await pool.query(`
      SELECT 
          'users' as table_name,
          (SELECT COUNT(*) FROM users) as row_count
      UNION ALL
      SELECT 
          'meals' as table_name,
          (SELECT COUNT(*) FROM meals) as row_count
      UNION ALL
      SELECT 
          'exercises' as table_name,
          (SELECT COUNT(*) FROM exercises) as row_count
      UNION ALL
      SELECT 
          'sleep_records' as table_name,
          (SELECT COUNT(*) FROM sleep_records) as row_count
      UNION ALL
      SELECT 
          'food_nutrition' as table_name,
          (SELECT COUNT(*) FROM food_nutrition) as row_count
      UNION ALL
      SELECT 
          'user_sessions' as table_name,
          (SELECT COUNT(*) FROM user_sessions) as row_count
    `);
    
    summary.rows.forEach(row => {
      console.log(`  ${row.table_name.padEnd(20)}: ${row.row_count} rows`);
    });
    
    console.log("\n" + "=" .repeat(80));
    console.log("\n✅ DATABASE TEST COMPLETE!\n");
    
  } catch (error) {
    console.error("❌ Error testing database:", error);
    console.error("Error details:", error.message);
  } finally {
    await pool.end();
  }
}

testDatabaseContent();


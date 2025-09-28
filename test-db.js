import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const connectionString = "postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function testDatabase() {
  const pool = new Pool({ connectionString });
  
  try {
    console.log("🔌 Testing database connection...");
    
    // 1. Show all tables
    console.log("\n📋 Showing all tables:");
    const tablesResult = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log("Tables found:", tablesResult.rows.map(row => row.table_name));
    
    // 2. Show users table structure
    console.log("\n👤 Users table structure:");
    const usersColumnsResult = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"
    );
    console.log("Users columns:", usersColumnsResult.rows);
    
    // 3. Show meals table structure
    console.log("\n🍽️ Meals table structure:");
    const mealsColumnsResult = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'meals'"
    );
    console.log("Meals columns:", mealsColumnsResult.rows);
    
    // 4. Create a test user first using correct column names
    console.log("\n➕ Creating test user...");
    const testUserResult = await pool.query(
      "INSERT INTO users (email, password_hash, username, full_name) VALUES ($1, $2, $3, $4) RETURNING id, email",
      ['test@example.com', 'hashed_password', 'testuser', 'Test User']
    );
    const testUserId = testUserResult.rows[0].id;
    console.log("Test user created:", testUserResult.rows[0]);
    
    // 5. Test meal insert with correct column names
    console.log("\n🍕 Testing meal insert...");
    const mealInsertResult = await pool.query(
      "INSERT INTO meals (user_id, meal_type, meal_name, calories, protein_g, carbs_g, fats_g) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [testUserId, 'breakfast', 'Test Meal', 300, 20.5, 30.0, 10.0]
    );
    console.log("Meal inserted:", mealInsertResult.rows[0]);
    
    // 6. Test meal fetch
    console.log("\n📖 Testing meal fetch...");
    const mealFetchResult = await pool.query(
      "SELECT * FROM meals WHERE user_id = $1",
      [testUserId]
    );
    console.log("Meals found:", mealFetchResult.rows);
    
    // 7. Clean up test data
    console.log("\n🧹 Cleaning up test data...");
    await pool.query("DELETE FROM meals WHERE user_id = $1", [testUserId]);
    await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
    console.log("Test data cleaned up");
    
    console.log("\n✅ DATABASE OPERATIONS WORK");
    
  } catch (error) {
    console.error("❌ Database test failed:", error);
    console.error("Error details:", error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();
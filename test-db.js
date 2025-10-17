import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const connectionString = "postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function checkDatabase() {
  const pool = new Pool({ connectionString });
  
  try {
    console.log("🔍 CHECKING DATABASE STRUCTURE AND CONTENT");
    console.log("=".repeat(80));
    
    // 1. Get all tables
    const tablesResult = await pool.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`\n📊 TOTAL TABLES FOUND: ${tables.length}`);
    console.log(`Tables: ${tables.join(', ')}\n`);
    
    // 2. Check each table
    for (const tableName of tables) {
      console.log("=".repeat(80));
      console.log(`\n🔹 TABLE: ${tableName.toUpperCase()}\n`);
      
      // Get columns with detailed info
      const columnsResult = await pool.query(
        `SELECT 
          column_name, 
          data_type, 
          column_default,
          is_nullable,
          character_maximum_length
         FROM information_schema.columns 
         WHERE table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      );
      
      console.log("📋 COLUMNS:");
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
        const defaultVal = col.column_default ? `DEFAULT: ${col.column_default}` : '';
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`   - ${col.column_name}: ${col.data_type}${maxLength} ${nullable} ${defaultVal}`);
      });
      
      // Get primary key info
      const pkResult = await pool.query(
        `SELECT a.attname
         FROM pg_index i
         JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
         WHERE i.indrelid = $1::regclass AND i.indisprimary`,
        [tableName]
      );
      
      if (pkResult.rows.length > 0) {
        console.log(`\n🔑 PRIMARY KEY: ${pkResult.rows.map(r => r.attname).join(', ')}`);
      }
      
      // Get row count
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const rowCount = parseInt(countResult.rows[0].count);
      
      console.log(`\n📊 ROW COUNT: ${rowCount}`);
      
      // Show sample data if exists
      if (rowCount > 0) {
        const sampleResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT 3`);
        
        console.log(`\n📄 SAMPLE DATA (first 3 rows):`);
        sampleResult.rows.forEach((row, index) => {
          console.log(`\n   Row ${index + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            let displayValue = value;
            if (value === null) displayValue = 'NULL';
            else if (typeof value === 'string' && value.length > 60) {
              displayValue = value.substring(0, 57) + '...';
            } else if (value instanceof Date) {
              displayValue = value.toISOString();
            }
            console.log(`      ${key}: ${displayValue}`);
          });
        });
      } else {
        console.log("   (Table is empty - no data)");
      }
      
      console.log("\n");
    }
    
    console.log("=".repeat(80));
    console.log("\n✅ DATABASE CHECK COMPLETE!\n");
    
  } catch (error) {
    console.error("❌ Error checking database:", error);
    console.error("Error details:", error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
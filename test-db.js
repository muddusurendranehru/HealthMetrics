import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

neonConfig.webSocketConstructor = ws;

async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');
        
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        // Create connection pool
        const pool = new Pool({ connectionString });
        const db = drizzle({ client: pool });

        // Test basic connection
        console.log('✅ Database connection established');

        // List all existing tables
        console.log('📋 Listing existing tables...');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        console.log('📊 Found tables:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        // Count records in users table
        console.log('👥 Checking users table...');
        const usersCountResult = await pool.query('SELECT COUNT(*) as count FROM users');
        const userCount = usersCountResult.rows[0].count;
        console.log(`  Found ${userCount} users in the database`);

        // Verify expected tables exist
        const expectedTables = ['users', 'meals', 'exercises', 'sleep_records', 'weight_tracking', 'water_intake'];
        const existingTables = tablesResult.rows.map(row => row.table_name);
        
        console.log('🔍 Verifying expected tables...');
        expectedTables.forEach(tableName => {
            if (existingTables.includes(tableName)) {
                console.log(`  ✅ ${tableName} - EXISTS`);
            } else {
                console.log(`  ❌ ${tableName} - MISSING`);
            }
        });

        // Get table structures for schema reference
        console.log('🏗️  Analyzing table structures...');
        for (const tableName of expectedTables) {
            if (existingTables.includes(tableName)) {
                const columnsResult = await pool.query(`
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND table_schema = 'public'
                    ORDER BY ordinal_position;
                `, [tableName]);
                
                console.log(`\n📝 ${tableName} structure:`);
                columnsResult.rows.forEach(col => {
                    console.log(`  - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
                });
            }
        }

        await pool.end();
        
        console.log('\n🎉 DATABASE CONNECTION SUCCESS');
        console.log('✅ All database tests completed successfully');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testDatabaseConnection();

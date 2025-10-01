import express from 'express';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import bcrypt from 'bcrypt';
import path from 'path';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const connectionString = "postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString });

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dashboard.html'));
});

// ========================================
// AUTH ENDPOINTS
// ========================================

// Register/Signup
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, full_name, created_at`,
      [
        username || email.split('@')[0],
        email,
        hashedPassword,
        full_name || username || email.split('@')[0]
      ]
    );
    
    console.log('✅ New user registered:', email);
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find user
    const users = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (users.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users.rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('✅ User logged in:', email);
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ========================================
// FOOD SEARCH (300K+ foods)
// ========================================

app.get('/api/foods/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ foods: [] });
    }
    
    const foods = await pool.query(
      `SELECT * FROM food_nutrition 
       WHERE food_name ILIKE $1
       ORDER BY food_name
       LIMIT 20`,
      [`%${q}%`]
    );
    
    console.log(`✅ Search "${q}": ${foods.rows.length} results`);
    res.json({ foods: foods.rows });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ========================================
// MEALS - INSERT & FETCH
// ========================================

// Add meal (INSERT)
app.post('/api/meals/add', async (req, res) => {
  try {
    const { user_id, food_name, calories, protein_g, carbs_g, fats_g } = req.body;
    
    if (!user_id || !food_name) {
      return res.status(400).json({ error: 'User ID and food name required' });
    }
    
    const result = await pool.query(
      `INSERT INTO meal_logs (
        user_id, 
        food_name, 
        calories, 
        protein_g, 
        carbs_g, 
        fats_g,
        meal_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
      RETURNING *`,
      [
        user_id,
        food_name,
        calories || 0,
        protein_g || 0,
        carbs_g || 0,
        fats_g || 0
      ]
    );
    
    console.log(`✅ Meal added for user ${user_id}:`, food_name);
    res.json({ success: true, meal: result.rows[0] });
  } catch (error) {
    console.error('❌ Add meal error:', error);
    res.status(500).json({ error: 'Failed to add meal' });
  }
});

// Get user's meals (FETCH)
app.get('/api/meals/today', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const meals = await pool.query(
      `SELECT * FROM meal_logs 
       WHERE user_id = $1
       AND meal_date = CURRENT_DATE
       ORDER BY created_at DESC`,
      [user_id]
    );
    
    console.log(`✅ Fetched ${meals.rows.length} meals for user ${user_id}`);
    res.json({ meals: meals.rows });
  } catch (error) {
    console.error('❌ Fetch meals error:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Delete meal
app.delete('/api/meals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'DELETE FROM meal_logs WHERE id = $1',
      [id]
    );
    
    console.log(`✅ Meal deleted: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString() 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health Tracker API ready`);
});
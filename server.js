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

// API ENDPOINTS

// POST /api/login - Return user data for test@example.com
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    // For simplicity, hardcode the test user as requested
    if (email === 'test@example.com') {
      res.json({
        user: {
          id: 1,
          email: "test@example.com"
        }
      });
    } else {
      // Try to find user in database
      const result = await pool.query(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length > 0) {
        res.json({
          user: {
            id: result.rows[0].id,
            email: result.rows[0].email
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// POST /api/meals - Insert meal with user_id
app.post('/api/meals', async (req, res) => {
  try {
    const { user_id, meal_name, calories, protein_g, carbs_g, fats_g, meal_type } = req.body;
    
    console.log('Adding meal for user_id:', user_id, 'meal:', meal_name);
    
    if (!user_id || !meal_name || !calories) {
      return res.status(400).json({ message: 'user_id, meal_name, and calories are required' });
    }
    
    const result = await pool.query(
      `INSERT INTO meals (user_id, meal_name, calories, protein_g, carbs_g, fats_g, meal_type, meal_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE) 
       RETURNING *`,
      [user_id, meal_name, calories, protein_g || 0, carbs_g || 0, fats_g || 0, meal_type || 'snack']
    );
    
    res.status(201).json({
      message: 'Meal added successfully',
      meal: result.rows[0]
    });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({ message: 'Failed to add meal' });
  }
});

// GET /api/meals/:userId - Get meals for specific user
app.get('/api/meals/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    console.log('Fetching meals for user_id:', userId);
    
    const result = await pool.query(
      'SELECT * FROM meals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch meals error:', error);
    res.status(500).json({ message: 'Failed to fetch meals' });
  }
});

// GET /api/meals (alternative endpoint for query parameter)
app.get('/api/meals', async (req, res) => {
  try {
    const userId = req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ message: 'user_id query parameter is required' });
    }
    
    console.log('Fetching meals for user_id:', userId);
    
    const result = await pool.query(
      'SELECT * FROM meals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch meals error:', error);
    res.status(500).json({ message: 'Failed to fetch meals' });
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
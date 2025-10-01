import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { insertUserSchema, insertMealSchema, insertExerciseSchema, insertSleepRecordSchema, insertWeightTrackingSchema, insertWaterIntakeSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import path from "path";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), "public")));
  
  // Serve static HTML files
  app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
  });

  app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "dashboard.html"));
  });

  // Test endpoint
  app.get("/api/test", (req, res) => {
    res.json({ message: "API Working", timestamp: new Date().toISOString() });
  });

  // Login/signup without /api prefix for HTML compatibility
  app.post("/signup", async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "User with this email already exists" 
        });
      }

      // Hash password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const userToCreate = {
        email: userData.email,
        passwordHash: hashedPassword
      };
      
      const user = await storage.createUser(userToCreate);
      
      // Don't return password in response
      const { passwordHash, ...userResponse } = user;
      
      res.status(201).json({ 
        message: "User created successfully", 
        user: userResponse 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Signup error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  app.post("/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Compare hashed password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Don't return password in response
      const { passwordHash: _, ...userResponse } = user;
      
      res.json({ 
        success: true, 
        user: userResponse 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // User signup
  app.post("/api/signup", async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "User with this email already exists" 
        });
      }

      // Hash password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const userToCreate = {
        email: userData.email,
        passwordHash: hashedPassword
      };
      
      const user = await storage.createUser(userToCreate);
      
      // Don't return password in response
      const { passwordHash, ...userResponse } = user;
      
      res.status(201).json({ 
        message: "User created successfully", 
        user: userResponse 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Signup error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Compare hashed password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Don't return password in response
      const { passwordHash: _, ...userResponse } = user;
      
      res.json({ 
        success: true, 
        user: userResponse 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Get user profile
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ 
          message: "User not found" 
        });
      }

      // Don't return password in response
      const { passwordHash, ...userResponse } = user;
      
      res.json(userResponse);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Meal routes
  app.post("/api/meals", async (req, res) => {
    try {
      console.log('Received meal data:', req.body);
      
      // Prepare data for storage with correct field names
      const mealData = {
        userId: parseInt(req.body.user_id), // INTEGER
        mealName: req.body.meal_name, // STRING
        mealType: req.body.meal_type, // STRING
        calories: parseInt(req.body.calories), // INTEGER
        proteinG: req.body.protein_g ? parseFloat(req.body.protein_g) : null, // DECIMAL
        carbsG: req.body.carbs_g ? parseFloat(req.body.carbs_g) : null, // DECIMAL
        fatsG: req.body.fats_g ? parseFloat(req.body.fats_g) : null, // DECIMAL
        mealDate: req.body.meal_date, // DATE 'YYYY-MM-DD'
        notes: req.body.notes || null // TEXT
      };
      
      console.log('Processed meal data for storage:', mealData);
      
      // Save to database using storage interface
      const meal = await storage.createMeal(mealData);
      console.log('Created meal:', meal);
      
      res.status(201).json(meal);
    } catch (error) {
      console.error("Create meal error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error.message 
      });
    }
  });

  // ========================================
  // STANDARDIZED MEAL ENDPOINTS (must come before /api/meals/:userId)
  // ========================================

  // Get today's meals (standardized)
  app.get('/api/meals/today', async (req, res) => {
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({ error: 'User ID required' });
      }
      
      const result = await db.execute(sql`
        SELECT * FROM meal_logs 
        WHERE user_id = ${user_id}
        AND meal_date = CURRENT_DATE
        ORDER BY created_at DESC
      `);
      
      console.log(`✅ Fetched ${result.rows.length} meals for user ${user_id}`);
      res.json({ meals: result.rows });
    } catch (error) {
      console.error('❌ Fetch meals error:', error);
      res.status(500).json({ error: 'Failed to fetch meals' });
    }
  });

  // Add meal endpoint (standardized)
  app.post('/api/meals/add', async (req, res) => {
    try {
      const { user_id, food_name, calories, protein_g, carbs_g, fats_g } = req.body;
      
      if (!user_id || !food_name) {
        return res.status(400).json({ error: 'User ID and food name required' });
      }
      
      const result = await db.execute(sql`
        INSERT INTO meal_logs (
          user_id, 
          food_name, 
          calories, 
          protein_g, 
          carbs_g, 
          fats_g,
          meal_date
        )
        VALUES (
          ${user_id},
          ${food_name},
          ${calories || 0},
          ${protein_g || 0},
          ${carbs_g || 0},
          ${fats_g || 0},
          CURRENT_DATE
        )
        RETURNING *
      `);
      
      console.log(`✅ Meal added for user ${user_id}:`, food_name);
      res.json({ success: true, meal: result.rows[0] });
    } catch (error) {
      console.error('❌ Add meal error:', error);
      res.status(500).json({ error: 'Failed to add meal' });
    }
  });

  app.get("/api/meals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId); // Convert to INTEGER
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: "Valid integer userId is required" });
      }
      
      console.log('Fetching meals for user_id:', userId);
      
      // Get meals from database using storage interface
      const meals = await storage.getUserMeals(userId);
      console.log(`Found ${meals.length} meals for user ${userId}`);
      
      res.json(meals);
    } catch (error) {
      console.error("Get meals error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error.message 
      });
    }
  });

  // Exercise routes
  app.post("/api/exercises", async (req, res) => {
    try {
      console.log('Received exercise data:', req.body);
      
      // Prepare data for storage with correct field names
      const exerciseData = {
        userId: parseInt(req.body.user_id), // INTEGER
        exerciseName: req.body.exercise_name, // STRING
        exerciseType: req.body.exercise_type, // STRING
        durationMinutes: req.body.duration_minutes ? parseInt(req.body.duration_minutes) : null, // INTEGER
        caloriesBurned: req.body.calories_burned ? parseInt(req.body.calories_burned) : null, // INTEGER
        exerciseDate: req.body.exercise_date // DATE 'YYYY-MM-DD'
      };
      
      console.log('Processed exercise data for storage:', exerciseData);
      
      // Save to database using storage interface
      const exercise = await storage.createExercise(exerciseData);
      console.log('Created exercise:', exercise);
      
      res.status(201).json(exercise);
    } catch (error) {
      console.error("Create exercise error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error.message 
      });
    }
  });

  app.get("/api/exercises/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId); // Convert to INTEGER
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: "Valid integer userId is required" });
      }
      
      console.log('Fetching exercises for user_id:', userId);
      
      // Get exercises from database using storage interface
      const exercises = await storage.getUserExercises(userId);
      console.log(`Found ${exercises.length} exercises for user ${userId}`);
      
      res.json(exercises);
    } catch (error) {
      console.error("Get exercises error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error.message 
      });
    }
  });

  // Sleep routes
  app.post("/api/sleep", async (req, res) => {
    try {
      console.log('Received sleep data:', req.body);
      
      // Prepare data for storage with correct field names
      const sleepData = {
        userId: parseInt(req.body.user_id), // INTEGER
        sleepDate: req.body.sleep_date, // DATE 'YYYY-MM-DD'
        bedtime: req.body.bedtime, // TIMESTAMP
        wakeTime: req.body.wake_time, // TIMESTAMP
        totalHours: req.body.total_hours ? parseFloat(req.body.total_hours) : null, // NUMERIC
        sleepQuality: req.body.sleep_quality ? parseInt(req.body.sleep_quality) : null, // INTEGER 1-5
        notes: req.body.notes // TEXT
      };
      
      console.log('Processed sleep data for storage:', sleepData);
      
      // Save to database using storage interface
      const sleepRecord = await storage.createSleepRecord(sleepData);
      console.log('Created/updated sleep record:', sleepRecord);
      
      res.status(201).json(sleepRecord);
    } catch (error) {
      console.error("Create sleep record error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error.message 
      });
    }
  });

  app.get("/api/sleep/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId); // Convert to INTEGER
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: "Valid integer userId is required" });
      }
      
      console.log('Fetching sleep records for user_id:', userId);
      
      // Get sleep records from database using storage interface
      const sleepRecords = await storage.getUserSleepRecords(userId);
      console.log(`Found ${sleepRecords.length} sleep records for user ${userId}`);
      
      res.json(sleepRecords);
    } catch (error) {
      console.error("Get sleep records error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error.message 
      });
    }
  });

  // Food lookup route
  app.get("/api/food/:name", async (req, res) => {
    try {
      const foodName = req.params.name.toLowerCase();
      console.log('Looking up food:', foodName);
      
      // Search food_nutrition table using raw SQL for LIKE search
      const result = await db.execute(sql`
        SELECT * FROM food_nutrition 
        WHERE LOWER(food_name) LIKE ${`%${foodName}%`}
        ORDER BY 
          CASE WHEN LOWER(food_name) = ${foodName} THEN 1 ELSE 2 END,
          food_name
        LIMIT 10
      `);
      
      const foods = result.rows.map((row: any) => ({
        id: row.id,
        foodName: row.food_name,
        calories: row.calories,
        proteinG: row.protein_g,
        carbsG: row.carbs_g,
        fatsG: row.fats_g
      }));
      
      console.log(`Found ${foods.length} foods matching "${foodName}"`);
      res.json(foods);
    } catch (error) {
      console.error("Food lookup error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error.message 
      });
    }
  });

  // Weight routes
  app.post("/api/weight", async (req, res) => {
    try {
      const weightData = insertWeightTrackingSchema.parse(req.body);
      const weightRecord = await storage.createWeightRecord(weightData);
      res.status(201).json(weightRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Create weight record error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Water intake routes
  app.post("/api/water", async (req, res) => {
    try {
      const waterData = insertWaterIntakeSchema.parse(req.body);
      const waterRecord = await storage.createWaterIntake(waterData);
      res.status(201).json(waterRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Create water intake error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Get recent data for dashboard
  app.get("/api/recent/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const [meals, exercises, sleepRecords, weightRecords, waterIntake] = await Promise.all([
        storage.getUserMeals(userId, 5),
        storage.getUserExercises(userId, 5),
        storage.getUserSleepRecords(userId, 5),
        storage.getUserWeightRecords(userId, 5),
        storage.getUserWaterIntake(userId)
      ]);

      res.json({
        meals,
        exercises,
        sleepRecords,
        weightRecords,
        waterIntake: waterIntake.slice(0, 5)
      });
    } catch (error) {
      console.error("Get recent data error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // ========================================
  // FOOD SEARCH ENDPOINT
  // ========================================

  // Food search endpoint (standardized)
  app.get('/api/foods/search', async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.length < 2) {
        return res.json({ foods: [] });
      }
      
      const result = await db.execute(sql`
        SELECT * FROM food_nutrition 
        WHERE food_name ILIKE ${`%${q}%`}
        ORDER BY food_name
        LIMIT 20
      `);
      
      console.log(`✅ Search "${q}": ${result.rows.length} results`);
      res.json({ foods: result.rows });
    } catch (error) {
      console.error('❌ Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Delete meal
  app.delete('/api/meals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      await db.execute(sql`
        DELETE FROM meal_logs WHERE id = ${parseInt(id)}
      `);
      
      console.log(`✅ Meal deleted: ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Delete meal error:', error);
      res.status(500).json({ error: 'Failed to delete meal' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'NutriBot API running!',
      database: 'Neon PostgreSQL',
      foods: '142+ available'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

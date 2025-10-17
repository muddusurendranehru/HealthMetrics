import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import "./session";

// Load environment variables
dotenv.config();

// Neon Database Connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Check your .env file.");
}
const sql = neon(DATABASE_URL);

// ========================================
// AUTHENTICATION MIDDLEWARE
// ========================================
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// ========================================
// REGISTER ROUTES
// ========================================
export async function registerRoutes(app: Express): Promise<Server> {
  
  // ========================================
  // AUTH ROUTES
  // ========================================

  // SIGNUP - Email, Password, Confirm Password
  app.post("/api/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      // Check if email already exists
      const existingEmail = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;
      
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user
      const result = await sql`
        INSERT INTO users (email, password_hash)
        VALUES (${email}, ${hashedPassword})
        RETURNING id, email, created_at
      `;
      
      console.log("✅ New user registered:", email);
      return res.status(201).json({ 
        message: "User created successfully", 
        user: result[0] 
      });
    } catch (error) {
      console.error("❌ Signup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // LOGIN - Email, Password (with session)
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      // Find user by email
      const users = await sql`
        SELECT * FROM users WHERE email = ${email.trim()}
      `;
      
      const user = users[0];
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Save to session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      
      // Save session before responding
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        
        console.log("✅ User logged in:", user.email);
        
        return res.json({ 
          success: true, 
          user: {
            id: user.id,
            email: user.email
          }
        });
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // LOGOUT
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Logout error:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      console.log("✅ User logged out");
      return res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // GET CURRENT USER
  app.get('/api/me', requireAuth, async (req: Request, res: Response) => {
    try {
      const users = await sql`
        SELECT id, email, username, full_name, created_at 
        FROM users 
        WHERE id = ${req.session.userId}
      `;
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      return res.json({ user: users[0] });
    } catch (error) {
      console.error('❌ Get user error:', error);
      return res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // ========================================
  // FOOD SEARCH (for meal entry)
  // ========================================

  app.get("/api/foods/search", requireAuth, async (req, res) => {
    try {
      const q = req.query.q as string;
      
      if (!q || q.length < 2) {
        return res.json({ foods: [] });
      }
      
      // Search by food_name, local_name, or search_tags
      const foods = await sql`
        SELECT * FROM food_nutrition 
        WHERE food_name ILIKE ${`%${q}%`}
           OR local_name ILIKE ${`%${q}%`}
           OR search_tags ILIKE ${`%${q}%`}
        ORDER BY food_name
        LIMIT 30
      `;
      
      console.log(`✅ Search "${q}": ${foods.length} results`);
      return res.json({ foods: foods });
    } catch (error) {
      console.error("❌ Search error:", error);
      return res.status(500).json({ error: "Search failed" });
    }
  });

  // ========================================
  // MEALS ROUTES (Diet Tracking)
  // ========================================

  // ADD MEAL
  app.post("/api/meals", requireAuth, async (req, res) => {
    try {
      const { mealName, mealType, calories, proteinG, carbsG, fatsG, notes } = req.body;
      const userId = req.session.userId!;
      
      if (!mealName || !mealType) {
        return res.status(400).json({ error: "Meal name and type required" });
      }
      
      const result = await sql`
        INSERT INTO meals (
          user_id, meal_name, meal_type, 
          calories, protein_g, carbs_g, fats_g, notes
        )
        VALUES (
          ${userId}, ${mealName}, ${mealType},
          ${calories || 0}, ${proteinG || 0}, ${carbsG || 0}, ${fatsG || 0}, ${notes || null}
        )
        RETURNING *
      `;
      
      console.log(`✅ Meal added for user ${userId}:`, mealName);
      return res.json({ success: true, meal: result[0] });
    } catch (error) {
      console.error("❌ Add meal error:", error);
      return res.status(500).json({ error: "Failed to add meal" });
    }
  });

  // GET TODAY'S MEALS
  app.get("/api/meals/today", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      const meals = await sql`
        SELECT * FROM meals 
        WHERE user_id = ${userId}
        AND meal_date = CURRENT_DATE
        ORDER BY created_at DESC
      `;
      
      console.log(`✅ Found ${meals.length} meals for user ${userId} today`);
      return res.json({ meals: meals });
    } catch (error) {
      console.error("❌ Fetch meals error:", error);
      return res.status(500).json({ error: "Failed to fetch meals" });
    }
  });

  // GET MEALS (with date range for 90 days)
  app.get("/api/meals", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { startDate, endDate } = req.query;
      
      let meals;
      if (startDate && endDate) {
        meals = await sql`
          SELECT * FROM meals 
          WHERE user_id = ${userId}
          AND meal_date BETWEEN ${startDate as string} AND ${endDate as string}
          ORDER BY meal_date DESC, created_at DESC
        `;
      } else {
        // Default: last 7 days
        meals = await sql`
          SELECT * FROM meals 
          WHERE user_id = ${userId}
          AND meal_date >= CURRENT_DATE - INTERVAL '7 days'
          ORDER BY meal_date DESC, created_at DESC
        `;
      }
      
      return res.json({ meals: meals });
    } catch (error) {
      console.error("❌ Fetch meals error:", error);
      return res.status(500).json({ error: "Failed to fetch meals" });
    }
  });

  // DELETE MEAL
  app.delete("/api/meals/:id", requireAuth, async (req, res) => {
    try {
      const mealId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      const result = await sql`
        DELETE FROM meals 
        WHERE id = ${mealId} AND user_id = ${userId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Meal not found or unauthorized" });
      }
      
      console.log(`✅ Meal deleted: ${mealId} by user ${userId}`);
      return res.json({ success: true });
    } catch (error) {
      console.error("❌ Delete meal error:", error);
      return res.status(500).json({ error: "Failed to delete meal" });
    }
  });

  // ========================================
  // EXERCISES ROUTES
  // ========================================

  // ADD EXERCISE
  app.post("/api/exercises", requireAuth, async (req, res) => {
    try {
      const { exerciseName, exerciseType, durationMinutes, caloriesBurned, notes } = req.body;
      const userId = req.session.userId!;
      
      if (!exerciseName) {
        return res.status(400).json({ error: "Exercise name required" });
      }
      
      const result = await sql`
        INSERT INTO exercises (
          user_id, exercise_name, exercise_type, 
          duration_minutes, calories_burned, notes
        )
        VALUES (
          ${userId}, ${exerciseName}, ${exerciseType || null},
          ${durationMinutes || null}, ${caloriesBurned || null}, ${notes || null}
        )
        RETURNING *
      `;
      
      console.log(`✅ Exercise added for user ${userId}:`, exerciseName);
      return res.json({ success: true, exercise: result[0] });
    } catch (error) {
      console.error("❌ Add exercise error:", error);
      return res.status(500).json({ error: "Failed to add exercise" });
    }
  });

  // GET EXERCISES
  app.get("/api/exercises", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { startDate, endDate } = req.query;
      
      let exercises;
      if (startDate && endDate) {
        exercises = await sql`
          SELECT * FROM exercises 
          WHERE user_id = ${userId}
          AND exercise_date BETWEEN ${startDate as string} AND ${endDate as string}
          ORDER BY exercise_date DESC, created_at DESC
        `;
      } else {
        exercises = await sql`
          SELECT * FROM exercises 
          WHERE user_id = ${userId}
          AND exercise_date >= CURRENT_DATE - INTERVAL '7 days'
          ORDER BY exercise_date DESC, created_at DESC
        `;
      }
      
      return res.json({ exercises: exercises });
    } catch (error) {
      console.error("❌ Fetch exercises error:", error);
      return res.status(500).json({ error: "Failed to fetch exercises" });
    }
  });

  // ========================================
  // SLEEP ROUTES
  // ========================================

  // ADD SLEEP RECORD
  app.post("/api/sleep", requireAuth, async (req, res) => {
    try {
      const { sleepDate, totalHours, sleepQuality, notes } = req.body;
      const userId = req.session.userId!;
      
      if (!sleepDate) {
        return res.status(400).json({ error: "Sleep date required" });
      }
      
      const result = await sql`
        INSERT INTO sleep_records (
          user_id, sleep_date, total_hours, sleep_quality, notes
        )
        VALUES (
          ${userId}, ${sleepDate}, ${totalHours || null}, ${sleepQuality || null}, ${notes || null}
        )
        RETURNING *
      `;
      
      console.log(`✅ Sleep record added for user ${userId}`);
      return res.json({ success: true, sleep: result[0] });
    } catch (error) {
      console.error("❌ Add sleep error:", error);
      return res.status(500).json({ error: "Failed to add sleep record" });
    }
  });

  // GET SLEEP RECORDS
  app.get("/api/sleep", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { startDate, endDate } = req.query;
      
      let sleepRecords;
      if (startDate && endDate) {
        sleepRecords = await sql`
          SELECT * FROM sleep_records 
          WHERE user_id = ${userId}
          AND sleep_date BETWEEN ${startDate as string} AND ${endDate as string}
          ORDER BY sleep_date DESC
        `;
      } else {
        sleepRecords = await sql`
          SELECT * FROM sleep_records 
          WHERE user_id = ${userId}
          AND sleep_date >= CURRENT_DATE - INTERVAL '7 days'
          ORDER BY sleep_date DESC
        `;
      }
      
      return res.json({ sleep: sleepRecords });
    } catch (error) {
      console.error("❌ Fetch sleep error:", error);
      return res.status(500).json({ error: "Failed to fetch sleep records" });
    }
  });

  // ========================================
  // DASHBOARD SUMMARY (for speedometer display)
  // ========================================
  
  app.get("/api/dashboard/summary", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Get today's totals
      const todayMeals = await sql`
        SELECT 
          COALESCE(SUM(calories), 0) as total_calories,
          COALESCE(SUM(protein_g), 0) as total_protein,
          COALESCE(SUM(carbs_g), 0) as total_carbs,
          COALESCE(SUM(fats_g), 0) as total_fats,
          COUNT(*) as meal_count
        FROM meals
        WHERE user_id = ${userId}
        AND meal_date = CURRENT_DATE
      `;
      
      const todayExercises = await sql`
        SELECT 
          COALESCE(SUM(duration_minutes), 0) as total_minutes,
          COALESCE(SUM(calories_burned), 0) as total_burned,
          COUNT(*) as exercise_count
        FROM exercises
        WHERE user_id = ${userId}
        AND exercise_date = CURRENT_DATE
      `;
      
      const recentSleep = await sql`
        SELECT 
          total_hours,
          sleep_quality,
          sleep_date
        FROM sleep_records
        WHERE user_id = ${userId}
        ORDER BY sleep_date DESC
        LIMIT 1
      `;
      
      return res.json({
        today: {
          meals: todayMeals[0],
          exercises: todayExercises[0],
          sleep: recentSleep[0] || null
        }
      });
    } catch (error) {
      console.error("❌ Dashboard summary error:", error);
      return res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    return res.json({ 
      status: "ok", 
      message: "90-Day Health Tracker API running!",
      session: req.session?.userId ? "authenticated" : "guest",
      database: "Neon PostgreSQL",
      version: "1.0.0"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import path from "path";
import "./session";

// Neon Database Connection
const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// Phone number normalization for Indian numbers
function normalizePhoneNumber(phone: string): string {
  // Remove all spaces and special characters
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Handle different formats:
  // +919963123456 -> 9963123456
  // 919963123456 -> 9963123456
  // 9963123456 -> 9963123456
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  // Final validation: should be 10 digits starting with 6-9
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return cleaned;
  }
  
  throw new Error('Invalid Indian phone number format');
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

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

  // ========================================
  // AUTH ROUTES
  // ========================================

  // Register/Signup
  app.post("/api/signup", async (req, res) => {
    try {
      const { email, phone, password } = req.body;
      
      // Require either email or phone
      if ((!email && !phone) || !password) {
        return res.status(400).json({ message: "Phone number (or email) and password required" });
      }
      
      let normalizedPhone = null;
      
      // Normalize phone if provided
      if (phone) {
        try {
          normalizedPhone = normalizePhoneNumber(phone);
        } catch (error) {
          return res.status(400).json({ message: "Invalid phone number format. Use +91, 91, or 10-digit format" });
        }
        
        // Check if phone already exists
        const existingPhone: any[] = await sql`
          SELECT * FROM users WHERE phone_number = ${normalizedPhone}
        `;
        
        if (existingPhone.length > 0) {
          return res.status(400).json({ message: "Phone number already registered" });
        }
      }
      
      // Check if email already exists (if provided)
      if (email) {
        const existingEmail: any[] = await sql`
          SELECT * FROM users WHERE email = ${email}
        `;
        
        if (existingEmail.length > 0) {
          return res.status(400).json({ message: "Email already registered" });
        }
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user
      const result: any[] = await sql`
        INSERT INTO users (email, phone_number, password)
        VALUES (${email || null}, ${normalizedPhone}, ${hashedPassword})
        RETURNING id, email, phone_number, created_at
      `;
      
      console.log("✅ New user registered:", normalizedPhone || email);
      return res.status(201).json({ 
        message: "User created successfully", 
        user: result[0] 
      });
    } catch (error) {
      console.error("❌ Signup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login - WITH SESSION
  app.post("/api/login", async (req, res) => {
    try {
      const { identifier, password } = req.body; // identifier can be email or phone
      
      if (!identifier || !password) {
        return res.status(400).json({ message: "Phone/Email and password required" });
      }
      
      let user = null;
      
      // Check if identifier is phone number (contains only digits, possibly with + or spaces)
      const isPhone = /^[\+\d\s\-\(\)]+$/.test(identifier);
      
      if (isPhone) {
        // Try to normalize and find by phone
        try {
          const normalizedPhone = normalizePhoneNumber(identifier);
          const users: any[] = await sql`
            SELECT * FROM users WHERE phone_number = ${normalizedPhone}
          `;
          user = users[0] || null;
        } catch (error) {
          // Invalid phone format, continue to email check
        }
      }
      
      // If not found by phone, try email
      if (!user) {
        const users: any[] = await sql`
          SELECT * FROM users WHERE email = ${identifier}
        `;
        user = users[0] || null;
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid phone/email or password" });
      }
      
      // Check password (column is 'password' in this schema)
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid phone/email or password" });
      }
      
      // Save to session (server-side, secure!)
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      
      // IMPORTANT: Save session before responding to ensure cookie is set
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        
        console.log("✅ User logged in:", user.phone_number || user.email, "User ID:", user.id);
        
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

  // Logout
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

  // Get current user (check if logged in)
  app.get('/api/me', requireAuth, async (req: Request, res: Response) => {
    try {
      const users: any[] = await sql`
        SELECT id, email, first_name, last_name, created_at 
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
  // FOOD SEARCH
  // ========================================

  app.get("/api/foods/search", requireAuth, async (req, res) => {
    try {
      const q = req.query.q as string;
      
      if (!q || q.length < 2) {
        return res.json({ foods: [] });
      }
      
      const foods: any[] = await sql`
        SELECT * FROM food_nutrition 
        WHERE food_name ILIKE ${`%${q}%`}
        ORDER BY food_name
        LIMIT 20
      `;
      
      console.log(`✅ Search "${q}": ${foods.length} results`);
      return res.json({ foods: foods });
    } catch (error) {
      console.error("❌ Search error:", error);
      return res.status(500).json({ error: "Search failed" });
    }
  });

  // Get portion sizes for a food
  app.get("/api/foods/:foodId/portions", requireAuth, async (req, res) => {
    try {
      const foodId = parseInt(req.params.foodId);
      
      const portions: any[] = await sql`
        SELECT * FROM portion_sizes 
        WHERE food_id = ${foodId}
        ORDER BY portion_grams ASC
      `;
      
      console.log(`✅ Found ${portions.length} portions for food ${foodId}`);
      return res.json({ portions: portions });
    } catch (error) {
      console.error("❌ Get portions error:", error);
      return res.status(500).json({ error: "Failed to get portions" });
    }
  });

  // ========================================
  // MEALS - USING SESSION (SECURE)
  // ========================================

  // Add meal - uses session user ID
  app.post("/api/meals/add", requireAuth, async (req, res) => {
    try {
      const { food_name, calories, protein_g, carbs_g, fats_g, meal_type } = req.body;
      const user_id = req.session.userId!;
      
      if (!food_name) {
        return res.status(400).json({ error: "Food name required" });
      }
      
      // Default to 'snack' if no meal_type provided
      const mealType = meal_type || 'snack';
      
      console.log(`🔍 Adding ${mealType} for session user_id: ${user_id}`);
      
      const result: any[] = await sql`
        INSERT INTO meal_logs (
          user_id, 
          food_name, 
          calories, 
          protein_g, 
          carbs_g, 
          fats_g,
          meal_type,
          meal_date
        )
        VALUES (
          ${user_id},
          ${food_name},
          ${calories || 0},
          ${protein_g || 0},
          ${carbs_g || 0},
          ${fats_g || 0},
          ${mealType},
          CURRENT_DATE
        )
        RETURNING *
      `;
      
      console.log(`✅ Meal added for user ${user_id}:`, food_name);
      return res.json({ success: true, meal: result[0] });
    } catch (error) {
      console.error("❌ Add meal error:", error);
      return res.status(500).json({ error: "Failed to add meal" });
    }
  });

  // Get today's meals - uses session user ID
  app.get("/api/meals/today", requireAuth, async (req, res) => {
    try {
      const user_id = req.session.userId!;
      
      console.log(`🔍 Fetching meals for session user_id: ${user_id}`);
      
      const meals: any[] = await sql`
        SELECT * FROM meal_logs 
        WHERE user_id = ${user_id}
        AND meal_date = CURRENT_DATE
        ORDER BY created_at DESC
      `;
      
      console.log(`✅ Found ${meals.length} meals for user ${user_id}`);
      return res.json({ meals: meals });
    } catch (error) {
      console.error("❌ Fetch meals error:", error);
      return res.status(500).json({ error: "Failed to fetch meals" });
    }
  });

  // Delete meal - uses session, checks ownership
  app.delete("/api/meals/:id", requireAuth, async (req, res) => {
    try {
      const mealId = parseInt(req.params.id);
      const user_id = req.session.userId!;
      
      // Only delete if meal belongs to this user
      const result: any[] = await sql`
        DELETE FROM meal_logs 
        WHERE id = ${mealId} AND user_id = ${user_id}
        RETURNING *
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Meal not found or unauthorized" });
      }
      
      console.log(`✅ Meal deleted: ${mealId} by user ${user_id}`);
      return res.json({ success: true });
    } catch (error) {
      console.error("❌ Delete meal error:", error);
      return res.status(500).json({ error: "Failed to delete meal" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    return res.json({ 
      status: "ok", 
      message: "NutriBot API running!",
      session: req.session?.userId ? "authenticated" : "guest",
      database: "Neon PostgreSQL",
      foods: "142+ available"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMealSchema, insertExerciseSchema, insertSleepRecordSchema, insertWeightTrackingSchema, insertWaterIntakeSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
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
  // Serve static HTML files
  app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "index.html"));
  });

  app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "dashboard.html"));
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
      const mealData = insertMealSchema.parse(req.body);
      const meal = await storage.createMeal(mealData);
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Create meal error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  app.get("/api/meals/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const meals = await storage.getUserMealsForDate(userId, today);
      res.json(meals);
    } catch (error) {
      console.error("Get meals error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Exercise routes
  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Create exercise error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  app.get("/api/exercises", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const exercises = await storage.getUserExercisesForDate(userId, today);
      res.json(exercises);
    } catch (error) {
      console.error("Get exercises error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Sleep routes
  app.post("/api/sleep", async (req, res) => {
    try {
      const sleepData = insertSleepRecordSchema.parse(req.body);
      const sleepRecord = await storage.createSleepRecord(sleepData);
      res.status(201).json(sleepRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Create sleep record error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  app.get("/api/sleep", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const sleepRecords = await storage.getUserSleepForDate(userId, today);
      res.json(sleepRecords);
    } catch (error) {
      console.error("Get sleep records error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
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

  const httpServer = createServer(app);
  return httpServer;
}

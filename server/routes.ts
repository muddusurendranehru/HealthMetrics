import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Test endpoint
  app.get("/api/test", (req, res) => {
    res.json({ message: "API Working", timestamp: new Date().toISOString() });
  });

  // User signup
  app.post("/api/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "User with this email already exists" 
        });
      }

      // TODO: Hash password before storing
      const user = await storage.createUser(userData);
      
      // Don't return password in response
      const { password, ...userResponse } = user;
      
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

      // TODO: Compare hashed password
      if (user.password !== password) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Don't return password in response
      const { password: _, ...userResponse } = user;
      
      res.json({ 
        message: "Login successful", 
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
      const { password, ...userResponse } = user;
      
      res.json(userResponse);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

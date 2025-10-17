import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, date, serial, json, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========================================
// 90-DAY HEALTH TRACKER SCHEMA
// Database: Neon PostgreSQL
// All IDs: INTEGER (auto-increment)
// ========================================

// Users table - Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  username: varchar("username", { length: 100 }),
  fullName: varchar("full_name", { length: 255 }),
  age: integer("age"),
  weightKg: decimal("weight_kg"),
  heightCm: integer("height_cm"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meals table - Diet tracking (90 days)
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mealName: varchar("meal_name", { length: 255 }).notNull(),
  mealType: varchar("meal_type", { length: 50 }), // breakfast, lunch, dinner, snack
  calories: integer("calories"),
  proteinG: decimal("protein_g"),
  carbsG: decimal("carbs_g"),
  fatsG: decimal("fats_g"),
  mealDate: date("meal_date").default(sql`CURRENT_DATE`),
  mealTime: time("meal_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercises table - Exercise tracking (90 days)
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  exerciseName: varchar("exercise_name", { length: 255 }).notNull(),
  exerciseType: varchar("exercise_type", { length: 100 }), // cardio, strength, flexibility, etc.
  durationMinutes: integer("duration_minutes"),
  caloriesBurned: integer("calories_burned"),
  sets: integer("sets"),
  reps: integer("reps"),
  weightKg: decimal("weight_kg"),
  distanceKm: decimal("distance_km"),
  exerciseDate: date("exercise_date").default(sql`CURRENT_DATE`),
  exerciseTime: time("exercise_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sleep records table - Sleep tracking (90 days)
export const sleepRecords = pgTable("sleep_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sleepDate: date("sleep_date").notNull(),
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  totalHours: decimal("total_hours"),
  sleepQuality: integer("sleep_quality"), // 1-5 rating
  deepSleepHours: decimal("deep_sleep_hours"),
  remSleepHours: decimal("rem_sleep_hours"),
  awakeCount: integer("awake_count"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Food nutrition table - 7800+ Indian foods database
// 1800 routine foods (veg, non-veg, North & South India)
// 6000 healthy foods (millet dosa, ragi dosa, etc.)
export const foodNutrition = pgTable("food_nutrition", {
  id: serial("id").primaryKey(),
  foodName: varchar("food_name", { length: 500 }).notNull(), // Main name (e.g., "Millet Dosa")
  localName: varchar("local_name", { length: 500 }), // Local name (e.g., "Gadka" for millet porridge)
  calories: integer("calories").notNull(),
  proteinG: decimal("protein_g").notNull(),
  carbsG: decimal("carbs_g").notNull(),
  fatsG: decimal("fats_g").notNull(),
  fiberG: decimal("fiber_g").default("0"),
  servingSize: varchar("serving_size", { length: 100 }).default("100g"), // grams for dry fruits, pieces for items
  category: varchar("category", { length: 100 }).default("general"), // indian_breakfast, south_indian, north_indian, healthy, etc.
  searchTags: text("search_tags"), // Comma-separated: "breakfast,south-indian,healthy"
  createdAt: timestamp("created_at").defaultNow(),
});

// User sessions table - Session management
export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  meals: many(meals),
  exercises: many(exercises),
  sleepRecords: many(sleepRecords),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  user: one(users, {
    fields: [exercises.userId],
    references: [users.id],
  }),
}));

export const sleepRecordsRelations = relations(sleepRecords, ({ one }) => ({
  user: one(users, {
    fields: [sleepRecords.userId],
    references: [users.id],
  }),
}));

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertSleepRecordSchema = createInsertSchema(sleepRecords).omit({
  id: true,
  createdAt: true,
});

export const insertFoodNutritionSchema = createInsertSchema(foodNutrition).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertSleepRecord = z.infer<typeof insertSleepRecordSchema>;
export type SleepRecord = typeof sleepRecords.$inferSelect;

export type InsertFoodNutrition = z.infer<typeof insertFoodNutritionSchema>;
export type FoodNutrition = typeof foodNutrition.$inferSelect;

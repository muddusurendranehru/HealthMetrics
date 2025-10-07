import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, date, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(), // INTEGER auto-increment: 1, 2, 3...
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
});

// Meals table
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(), // INTEGER auto-increment
  userId: integer("user_id").notNull().references(() => users.id), // INTEGER reference
  mealName: varchar("meal_name").notNull(), // VARCHAR string
  mealType: varchar("meal_type").notNull(), // VARCHAR: 'breakfast', 'lunch', 'dinner', 'snack'
  calories: integer("calories").notNull(), // INTEGER (no decimals)
  proteinG: decimal("protein_g", { precision: 5, scale: 1 }), // NUMERIC decimal (12.5)
  carbsG: decimal("carbs_g", { precision: 5, scale: 1 }), // NUMERIC decimal (55.0)
  fatsG: decimal("fats_g", { precision: 5, scale: 1 }), // NUMERIC decimal (8.0)
  mealDate: date("meal_date").notNull(), // DATE: 'YYYY-MM-DD'
  notes: text("notes"), // TEXT optional
});

// Exercises table (simplified to match focus)
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  exerciseType: text("exercise_type").notNull(),
  exerciseName: text("exercise_name").notNull(),
  duration: integer("duration"), // in minutes
  caloriesBurned: integer("calories_burned"),
  intensity: text("intensity"), // low, medium, high
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// Sleep records table
export const sleepRecords = pgTable("sleep_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sleepDate: date("sleep_date").notNull(),
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }),
  sleepQuality: integer("sleep_quality"), // 1-5 scale
  deepSleepHours: decimal("deep_sleep_hours", { precision: 4, scale: 2 }),
  remSleepHours: decimal("rem_sleep_hours", { precision: 4, scale: 2 }),
  awakeCount: integer("awake_count"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weight tracking table
export const weightTracking = pgTable("weight_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
  notes: text("notes"),
});

// Water intake table
export const waterIntake = pgTable("water_intake", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 5, scale: 2 }).notNull(), // in ml or glasses
  unit: text("unit").default("glasses"), // glasses, ml, oz
  loggedAt: timestamp("logged_at").defaultNow(),
});

// Food nutrition table (629 foods database)
export const foodNutrition = pgTable("food_nutrition", {
  id: serial("id").primaryKey(),
  foodName: varchar("food_name").notNull(),
  calories: integer("calories").notNull(), // per 100g
  proteinG: decimal("protein_g", { precision: 5, scale: 1 }), // per 100g
  carbsG: decimal("carbs_g", { precision: 5, scale: 1 }), // per 100g
  fatsG: decimal("fats_g", { precision: 5, scale: 1 }), // per 100g
  imageUrl: varchar("image_url", { length: 500 }), // URL to food image
});

// Portion sizes table (Indian portion measurements)
export const portionSizes = pgTable("portion_sizes", {
  id: serial("id").primaryKey(),
  foodId: integer("food_id").notNull().references(() => foodNutrition.id),
  portionName: varchar("portion_name").notNull(), // e.g., "1 medium apple", "1 katori dal"
  portionGrams: integer("portion_grams").notNull(), // weight in grams
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  meals: many(meals),
  exercises: many(exercises),
  sleepRecords: many(sleepRecords),
  weightTracking: many(weightTracking),
  waterIntake: many(waterIntake),
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

export const weightTrackingRelations = relations(weightTracking, ({ one }) => ({
  user: one(users, {
    fields: [weightTracking.userId],
    references: [users.id],
  }),
}));

export const waterIntakeRelations = relations(waterIntake, ({ one }) => ({
  user: one(users, {
    fields: [waterIntake.userId],
    references: [users.id],
  }),
}));

export const foodNutritionRelations = relations(foodNutrition, ({ many }) => ({
  portions: many(portionSizes),
}));

export const portionSizesRelations = relations(portionSizes, ({ one }) => ({
  food: one(foodNutrition, {
    fields: [portionSizes.foodId],
    references: [foodNutrition.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  loggedAt: true,
});

export const insertSleepRecordSchema = createInsertSchema(sleepRecords).omit({
  id: true,
});

export const insertWeightTrackingSchema = createInsertSchema(weightTracking).omit({
  id: true,
  recordedAt: true,
});

export const insertWaterIntakeSchema = createInsertSchema(waterIntake).omit({
  id: true,
  loggedAt: true,
});

export const insertFoodNutritionSchema = createInsertSchema(foodNutrition).omit({
  id: true,
});

export const insertPortionSizeSchema = createInsertSchema(portionSizes).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertSleepRecord = z.infer<typeof insertSleepRecordSchema>;
export type SleepRecord = typeof sleepRecords.$inferSelect;

export type InsertWeightTracking = z.infer<typeof insertWeightTrackingSchema>;
export type WeightTracking = typeof weightTracking.$inferSelect;

export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;
export type WaterIntake = typeof waterIntake.$inferSelect;

export type InsertFoodNutrition = z.infer<typeof insertFoodNutritionSchema>;
export type FoodNutrition = typeof foodNutrition.$inferSelect;

export type InsertPortionSize = z.infer<typeof insertPortionSizeSchema>;
export type PortionSize = typeof portionSizes.$inferSelect;

import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - matching OLD database structure
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  dateOfBirth: date("date_of_birth"),
  height: decimal("height"),
  goalWeight: decimal("goal_weight"),
  activityLevel: text("activity_level"),
  createdAt: timestamp("created_at").defaultNow(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  passwordHash: varchar("password_hash"),
});

// Meals table - matching OLD database structure
export const meals = pgTable("meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mealType: text("meal_type").notNull(),
  foodItem: text("food_item").notNull(),
  calories: integer("calories").notNull(),
  protein: decimal("protein"),
  carbs: decimal("carbs"),
  fat: decimal("fat"),
  portion: text("portion"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// Exercises table - matching OLD database structure
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  exerciseType: text("exercise_type").notNull(),
  exerciseName: text("exercise_name").notNull(),
  duration: integer("duration"),
  caloriesBurned: integer("calories_burned"),
  intensity: text("intensity"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// Sleep records table
export const sleepRecords = pgTable("sleep_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sleepDate: date("sleep_date").notNull(),
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  hoursSlept: decimal("hours_slept"),
  sleepQuality: integer("sleep_quality"),
  notes: text("notes"),
});

// Weight tracking table
export const weightTracking = pgTable("weight_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  weight: decimal("weight").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
  notes: text("notes"),
});

// Water intake table
export const waterIntake = pgTable("water_intake", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount").notNull(),
  unit: text("unit").default("glasses"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// Food nutrition table
export const foodNutrition = pgTable("food_nutrition", {
  id: integer("id").primaryKey(),
  foodName: varchar("food_name", { length: 255 }).notNull(),
  calories: integer("calories").notNull(),
  proteinG: decimal("protein_g"),
  carbsG: decimal("carbs_g"),
  fatsG: decimal("fats_g"),
  imageUrl: varchar("image_url", { length: 500 }),
});

// Portion sizes table
export const portionSizes = pgTable("portion_sizes", {
  id: integer("id").primaryKey(),
  foodId: integer("food_id").notNull().references(() => foodNutrition.id),
  portionName: varchar("portion_name").notNull(),
  portionGrams: integer("portion_grams").notNull(),
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
  createdAt: true,
  phoneNumber: true,
  passwordHash: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  loggedAt: true,
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

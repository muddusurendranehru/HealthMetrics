import { 
  users, 
  type User, 
  type InsertUser,
  meals,
  type Meal,
  type InsertMeal,
  exercises,
  type Exercise,
  type InsertExercise,
  sleepRecords,
  type SleepRecord,
  type InsertSleepRecord,
  weightTracking,
  type WeightTracking,
  type InsertWeightTracking,
  waterIntake,
  type WaterIntake,
  type InsertWaterIntake
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Meal methods
  createMeal(meal: InsertMeal): Promise<Meal>;
  getUserMeals(userId: string, limit?: number): Promise<Meal[]>;
  getUserMealsForDate(userId: string, date: string): Promise<Meal[]>;

  // Exercise methods
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getUserExercises(userId: string, limit?: number): Promise<Exercise[]>;
  getUserExercisesForDate(userId: string, date: string): Promise<Exercise[]>;

  // Sleep methods
  createSleepRecord(sleepRecord: InsertSleepRecord): Promise<SleepRecord>;
  getUserSleepRecords(userId: string, limit?: number): Promise<SleepRecord[]>;
  getUserSleepForDate(userId: string, date: string): Promise<SleepRecord[]>;

  // Weight tracking methods
  createWeightRecord(weightRecord: InsertWeightTracking): Promise<WeightTracking>;
  getUserWeightRecords(userId: string, limit?: number): Promise<WeightTracking[]>;

  // Water intake methods
  createWaterIntake(waterRecord: InsertWaterIntake): Promise<WaterIntake>;
  getUserWaterIntake(userId: string, date?: Date): Promise<WaterIntake[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Meal methods
  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const [meal] = await db
      .insert(meals)
      .values(insertMeal)
      .returning();
    return meal;
  }

  async getUserMeals(userId: string, limit: number = 50): Promise<Meal[]> {
    return await db
      .select()
      .from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(desc(meals.loggedAt))
      .limit(limit);
  }

  async getUserMealsForDate(userId: string, date: string): Promise<Meal[]> {
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    
    return await db
      .select()
      .from(meals)
      .where(
        and(
          eq(meals.userId, userId),
          gte(meals.loggedAt, startOfDay),
          lte(meals.loggedAt, endOfDay)
        )
      )
      .orderBy(desc(meals.loggedAt));
  }

  // Exercise methods
  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await db
      .insert(exercises)
      .values(insertExercise)
      .returning();
    return exercise;
  }

  async getUserExercises(userId: string, limit: number = 50): Promise<Exercise[]> {
    return await db
      .select()
      .from(exercises)
      .where(eq(exercises.userId, userId))
      .orderBy(desc(exercises.loggedAt))
      .limit(limit);
  }

  async getUserExercisesForDate(userId: string, date: string): Promise<Exercise[]> {
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    
    return await db
      .select()
      .from(exercises)
      .where(
        and(
          eq(exercises.userId, userId),
          gte(exercises.loggedAt, startOfDay),
          lte(exercises.loggedAt, endOfDay)
        )
      )
      .orderBy(desc(exercises.loggedAt));
  }

  // Sleep methods
  async createSleepRecord(insertSleepRecord: InsertSleepRecord): Promise<SleepRecord> {
    const [sleepRecord] = await db
      .insert(sleepRecords)
      .values(insertSleepRecord)
      .returning();
    return sleepRecord;
  }

  async getUserSleepRecords(userId: string, limit: number = 50): Promise<SleepRecord[]> {
    return await db
      .select()
      .from(sleepRecords)
      .where(eq(sleepRecords.userId, userId))
      .orderBy(desc(sleepRecords.sleepDate))
      .limit(limit);
  }

  async getUserSleepForDate(userId: string, date: string): Promise<SleepRecord[]> {
    return await db
      .select()
      .from(sleepRecords)
      .where(
        and(
          eq(sleepRecords.userId, userId),
          eq(sleepRecords.sleepDate, date)
        )
      );
  }

  // Weight tracking methods
  async createWeightRecord(insertWeightRecord: InsertWeightTracking): Promise<WeightTracking> {
    const [weightRecord] = await db
      .insert(weightTracking)
      .values(insertWeightRecord)
      .returning();
    return weightRecord;
  }

  async getUserWeightRecords(userId: string, limit: number = 50): Promise<WeightTracking[]> {
    return await db
      .select()
      .from(weightTracking)
      .where(eq(weightTracking.userId, userId))
      .orderBy(desc(weightTracking.recordedAt))
      .limit(limit);
  }

  // Water intake methods
  async createWaterIntake(insertWaterIntake: InsertWaterIntake): Promise<WaterIntake> {
    const [waterRecord] = await db
      .insert(waterIntake)
      .values(insertWaterIntake)
      .returning();
    return waterRecord;
  }

  async getUserWaterIntake(userId: string, date?: Date): Promise<WaterIntake[]> {
    if (date) {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      return await db
        .select()
        .from(waterIntake)
        .where(
          and(
            eq(waterIntake.userId, userId),
            gte(waterIntake.loggedAt, startOfDay),
            lte(waterIntake.loggedAt, endOfDay)
          )
        )
        .orderBy(desc(waterIntake.loggedAt));
    }

    return await db
      .select()
      .from(waterIntake)
      .where(eq(waterIntake.userId, userId))
      .orderBy(desc(waterIntake.loggedAt));
  }
}

// Use in-memory storage for now until database is confirmed working
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private meals: Map<string, Meal>;
  private exercises: Map<string, Exercise>;
  private sleepRecords: Map<string, SleepRecord>;
  private weightRecords: Map<string, WeightTracking>;
  private waterRecords: Map<string, WaterIntake>;

  constructor() {
    this.users = new Map();
    this.meals = new Map();
    this.exercises = new Map();
    this.sleepRecords = new Map();
    this.weightRecords = new Map();
    this.waterRecords = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      dateOfBirth: insertUser.dateOfBirth ?? null,
      height: insertUser.height ?? null,
      goalWeight: insertUser.goalWeight ?? null,
      activityLevel: insertUser.activityLevel ?? null,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const id = randomUUID();
    const meal: Meal = {
      userId: insertMeal.userId,
      mealType: insertMeal.mealType,
      foodItem: insertMeal.foodItem,
      calories: insertMeal.calories,
      protein: insertMeal.protein ?? null,
      carbs: insertMeal.carbs ?? null,
      fat: insertMeal.fat ?? null,
      portion: insertMeal.portion ?? null,
      id,
      loggedAt: new Date()
    };
    this.meals.set(id, meal);
    return meal;
  }

  async getUserMeals(userId: string, limit: number = 50): Promise<Meal[]> {
    return Array.from(this.meals.values())
      .filter(meal => meal.userId === userId)
      .sort((a, b) => b.loggedAt!.getTime() - a.loggedAt!.getTime())
      .slice(0, limit);
  }

  async getUserMealsForDate(userId: string, date: string): Promise<Meal[]> {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
    
    return Array.from(this.meals.values())
      .filter(meal => {
        const mealDate = meal.loggedAt!;
        return meal.userId === userId && mealDate >= startOfDay && mealDate < endOfDay;
      })
      .sort((a, b) => b.loggedAt!.getTime() - a.loggedAt!.getTime());
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = {
      userId: insertExercise.userId,
      exerciseType: insertExercise.exerciseType,
      exerciseName: insertExercise.exerciseName,
      duration: insertExercise.duration ?? null,
      caloriesBurned: insertExercise.caloriesBurned ?? null,
      intensity: insertExercise.intensity ?? null,
      notes: insertExercise.notes ?? null,
      id,
      loggedAt: new Date()
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async getUserExercises(userId: string, limit: number = 50): Promise<Exercise[]> {
    return Array.from(this.exercises.values())
      .filter(exercise => exercise.userId === userId)
      .sort((a, b) => b.loggedAt!.getTime() - a.loggedAt!.getTime())
      .slice(0, limit);
  }

  async getUserExercisesForDate(userId: string, date: string): Promise<Exercise[]> {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
    
    return Array.from(this.exercises.values())
      .filter(exercise => {
        const exerciseDate = exercise.loggedAt!;
        return exercise.userId === userId && exerciseDate >= startOfDay && exerciseDate < endOfDay;
      })
      .sort((a, b) => b.loggedAt!.getTime() - a.loggedAt!.getTime());
  }

  async createSleepRecord(insertSleepRecord: InsertSleepRecord): Promise<SleepRecord> {
    const id = randomUUID();
    const sleepRecord: SleepRecord = {
      userId: insertSleepRecord.userId,
      sleepDate: insertSleepRecord.sleepDate,
      bedtime: insertSleepRecord.bedtime ?? null,
      wakeTime: insertSleepRecord.wakeTime ?? null,
      hoursSlept: insertSleepRecord.hoursSlept ?? null,
      sleepQuality: insertSleepRecord.sleepQuality ?? null,
      notes: insertSleepRecord.notes ?? null,
      id
    };
    this.sleepRecords.set(id, sleepRecord);
    return sleepRecord;
  }

  async getUserSleepRecords(userId: string, limit: number = 50): Promise<SleepRecord[]> {
    return Array.from(this.sleepRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => {
        const dateA = a.sleepDate ? new Date(a.sleepDate).getTime() : 0;
        const dateB = b.sleepDate ? new Date(b.sleepDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async getUserSleepForDate(userId: string, date: string): Promise<SleepRecord[]> {
    return Array.from(this.sleepRecords.values())
      .filter(record => record.userId === userId && record.sleepDate === date);
  }

  async createWeightRecord(insertWeightRecord: InsertWeightTracking): Promise<WeightTracking> {
    const id = randomUUID();
    const weightRecord: WeightTracking = {
      userId: insertWeightRecord.userId,
      weight: insertWeightRecord.weight,
      notes: insertWeightRecord.notes ?? null,
      id,
      recordedAt: new Date()
    };
    this.weightRecords.set(id, weightRecord);
    return weightRecord;
  }

  async getUserWeightRecords(userId: string, limit: number = 50): Promise<WeightTracking[]> {
    return Array.from(this.weightRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => b.recordedAt!.getTime() - a.recordedAt!.getTime())
      .slice(0, limit);
  }

  async createWaterIntake(insertWaterIntake: InsertWaterIntake): Promise<WaterIntake> {
    const id = randomUUID();
    const waterRecord: WaterIntake = {
      userId: insertWaterIntake.userId,
      amount: insertWaterIntake.amount,
      unit: insertWaterIntake.unit ?? null,
      id,
      loggedAt: new Date()
    };
    this.waterRecords.set(id, waterRecord);
    return waterRecord;
  }

  async getUserWaterIntake(userId: string, date?: Date): Promise<WaterIntake[]> {
    let records = Array.from(this.waterRecords.values())
      .filter(record => record.userId === userId);

    if (date) {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      records = records.filter(record => {
        const recordDate = record.loggedAt!;
        return recordDate >= startOfDay && recordDate < endOfDay;
      });
    }

    return records.sort((a, b) => b.loggedAt!.getTime() - a.loggedAt!.getTime());
  }
}

export const storage = new DatabaseStorage();

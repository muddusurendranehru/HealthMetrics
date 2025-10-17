# 📊 DATABASE TABLES - Complete Summary

## ✅ **6 Tables in Your Database**

---

## 1. 👤 **USERS** Table
**Purpose:** Authentication and user profiles

### Columns:
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NOT NULL | Primary key (auto-increment) |
| email | varchar(255) | NOT NULL | User email (unique) |
| password_hash | varchar(255) | NOT NULL | Hashed password |
| username | varchar(100) | NULL | Username |
| full_name | varchar(255) | NULL | Full name |
| age | integer | NULL | Age |
| weight_kg | numeric | NULL | Weight in kg |
| height_cm | integer | NULL | Height in cm |
| created_at | timestamp | NULL | Account creation time |
| updated_at | timestamp | NULL | Last update time |

### Sample Data:
```
User 1: test@example.com (testuser)
User 2: john@example.com (johndoe) - Age 30
User 3: jane@example.com (janesmith) - Age 28
```

**Total Rows:** 30 users

---

## 2. 🍽️ **MEALS** Table
**Purpose:** Track daily meals for 90 days

### Columns:
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NOT NULL | Primary key |
| user_id | integer | NOT NULL | Foreign key to users |
| meal_name | varchar(255) | NOT NULL | Name of meal |
| meal_type | varchar(50) | NULL | breakfast/lunch/dinner/snack |
| calories | integer | NULL | Calories |
| protein_g | numeric | NULL | Protein in grams |
| carbs_g | numeric | NULL | Carbohydrates in grams |
| fats_g | numeric | NULL | Fats in grams |
| meal_date | date | NULL | Date of meal |
| meal_time | time | NULL | Time of meal |
| notes | text | NULL | Additional notes |
| created_at | timestamp | NULL | Log creation time |

### Sample Data:
```
Meal 1: Oatmeal with Berries (breakfast)
  → 350 cal | P: 12.5g | C: 55g | F: 8g

Meal 2: Grilled Chicken Salad (lunch)
  → 450 cal | P: 35g | C: 20g | F: 18g

Meal 3: Salmon with Rice (dinner)
  → 550 cal | P: 40g | C: 45g | F: 22g
```

**Total Rows:** 6 meals
**By Type:** lunch (2), breakfast (1), dinner (1), snack (1)

---

## 3. 💪 **EXERCISES** Table
**Purpose:** Track workouts for 90 days

### Columns:
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NOT NULL | Primary key |
| user_id | integer | NOT NULL | Foreign key to users |
| exercise_name | varchar(255) | NOT NULL | Name of exercise |
| exercise_type | varchar(100) | NULL | cardio/strength/flexibility |
| duration_minutes | integer | NULL | Duration in minutes |
| calories_burned | integer | NULL | Calories burned |
| sets | integer | NULL | Number of sets |
| reps | integer | NULL | Repetitions |
| weight_kg | numeric | NULL | Weight used (kg) |
| distance_km | numeric | NULL | Distance (km) |
| exercise_date | date | NULL | Date of exercise |
| exercise_time | time | NULL | Time of exercise |
| notes | text | NULL | Additional notes |
| created_at | timestamp | NULL | Log creation time |

### Sample Data:
```
Exercise 1: Morning Run (cardio)
  → 30 min | 300 cal burned

Exercise 2: Push-ups (strength)
  → 15 min | 50 cal burned

Exercise 3: Yoga Flow (flexibility)
  → 45 min | 150 cal burned
```

**Total Rows:** 7 exercises

---

## 4. 😴 **SLEEP_RECORDS** Table
**Purpose:** Track sleep quality for 90 days

### Columns:
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NOT NULL | Primary key |
| user_id | integer | NOT NULL | Foreign key to users |
| sleep_date | date | NOT NULL | Date of sleep |
| bedtime | timestamp | NULL | Bedtime |
| wake_time | timestamp | NULL | Wake up time |
| total_hours | numeric | NULL | Total hours slept |
| sleep_quality | integer | NULL | Quality rating (1-5) |
| deep_sleep_hours | numeric | NULL | Deep sleep hours |
| rem_sleep_hours | numeric | NULL | REM sleep hours |
| awake_count | integer | NULL | Times woke up |
| notes | text | NULL | Additional notes |
| created_at | timestamp | NULL | Record creation time |

### Sample Data:
```
Sleep 1: Sept 27, 2025
  → 8 hours | Quality: 4/5

Sleep 2: Sept 26, 2025
  → 7 hours | Quality: 3/5

Sleep 3: Sept 25, 2025
  → 8 hours | Quality: 5/5 (Best!)
```

**Total Rows:** 3 records

---

## 5. 🍕 **FOOD_NUTRITION** Table
**Purpose:** Database of 7,800+ Indian foods with local names

### Columns:
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NOT NULL | Primary key |
| food_name | varchar(500) | NOT NULL | Main food name |
| local_name | varchar(500) | NULL | Regional/local name |
| calories | integer | NOT NULL | Calories per serving |
| protein_g | numeric | NOT NULL | Protein in grams |
| carbs_g | numeric | NOT NULL | Carbs in grams |
| fats_g | numeric | NOT NULL | Fats in grams |
| fiber_g | numeric | NULL | Fiber in grams |
| serving_size | varchar(100) | NULL | Serving size description |
| category | varchar(100) | NULL | Food category |
| search_tags | text | NULL | Search tags |
| created_at | timestamp | NULL | Record creation time |

### Sample Data:
```
Food 1: idli plain 2pc (indian_breakfast)
  → 140 cal | P: 4g | C: 28g | F: 0.5g | Serving: 2 pieces

Food 2: rava idli 2pc (indian_breakfast)
  → 160 cal | P: 4.5g | C: 30g | F: 2g | Serving: 2 pieces

Food 3: dosa plain 1pc (indian_breakfast)
  → 170 cal | P: 3.5g | C: 29g | F: 4.5g | Serving: 1 piece

Food 4: masala dosa 1pc (indian_breakfast)
  → 200 cal | P: 4g | C: 32g | F: 6g | Serving: 1 piece

Pizza Search Results:
  → pizza cheese 1 slice: 285 cal | P: 12g | C: 36g | F: 10g
```

**Total Rows:** 426 foods (ready for 7,800+)

### Top Categories:
- **indian_breakfast:** 45 foods
- **grains:** 36 foods
- **non_veg:** 36 foods
- **breads:** 36 foods
- **international:** 36 foods

**Ready to Add:**
- 1,800 routine Indian foods (veg, non-veg, North & South)
- 6,000 healthy foods (millet dosa, ragi dosa, etc.)
- Local names (gadka = millet porridge, vankaya = eggplant)
- Proper units (dry fruits in grams)

---

## 6. 🔐 **USER_SESSIONS** Table
**Purpose:** Manage user login sessions

### Columns:
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| sid | varchar | NOT NULL | Session ID (primary key) |
| sess | json | NOT NULL | Session data |
| expire | timestamp | NOT NULL | Session expiration |

**Total Rows:** 1 active session

---

## 📊 **Quick Stats**

```
Database: neondb (Neon PostgreSQL)
Region: Singapore (ap-southeast-1)
Status: ✅ Online

Table Summary:
  users               : 30 rows
  meals               : 6 rows
  exercises           : 7 rows
  sleep_records       : 3 rows
  food_nutrition      : 426 rows
  user_sessions       : 1 row
  
  Total Tables: 6
  Total Data Rows: 473
```

---

## 🚀 **How to Test Database**

### Run Database Test:
```powershell
npm run test:db
```

Or directly:
```powershell
node test-database-content.js
```

This will show:
- ✅ All table names
- ✅ Table structures (columns)
- ✅ Sample data from each table
- ✅ Row counts
- ✅ Search test (pizza)
- ✅ Complete summary

---

## ✨ **Your Database is Ready!**

All tables are set up according to your rules:
- ✅ INTEGER primary keys (not UUID)
- ✅ Clean structure (removed 5 unnecessary tables)
- ✅ 90-day tracking ready
- ✅ Indian food database with local names
- ✅ Session-based authentication

**Next Step:** Start the server and test the full flow! 🎉


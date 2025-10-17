-- ========================================
-- 90-DAY HEALTH TRACKER - SQL QUERIES
-- All INSERT and FETCH Queries
-- ========================================

-- ========================================
-- 1. INSERT QUERIES
-- ========================================

-- INSERT NEW USER (Sign Up)
INSERT INTO users (email, password_hash)
VALUES ('customer@example.com', '$2a$10$hashed_password_here');

-- INSERT MEAL (Add Food Entry)
INSERT INTO meals (
    user_id,
    meal_name,
    meal_type,
    calories,
    protein_g,
    carbs_g,
    fats_g,
    meal_date
) VALUES (
    35,
    'dosa plain 1pc',
    'breakfast',
    170,
    3.5,
    29.0,
    4.5,
    CURRENT_DATE
);

-- INSERT EXERCISE
INSERT INTO exercises (
    user_id,
    exercise_name,
    exercise_type,
    duration_minutes,
    calories_burned,
    exercise_date
) VALUES (
    35,
    'Morning Run',
    'cardio',
    30,
    300,
    CURRENT_DATE
);

-- INSERT SLEEP RECORD
INSERT INTO sleep_records (
    user_id,
    sleep_date,
    total_hours,
    sleep_quality
) VALUES (
    35,
    CURRENT_DATE,
    7.5,
    4
);

-- INSERT FOOD TO NUTRITION DATABASE
INSERT INTO food_nutrition (
    food_name,
    local_name,
    calories,
    protein_g,
    carbs_g,
    fats_g,
    fiber_g,
    serving_size,
    category,
    search_tags
) VALUES (
    'Chicken Biryani 1 plate',
    'Kodi Pulao',
    450,
    25.0,
    55.0,
    18.0,
    3.0,
    '1 plate (300g)',
    'non_veg',
    'biryani,chicken,rice,non-veg,south-indian'
);

-- INSERT MULTIPLE FOODS AT ONCE
INSERT INTO food_nutrition (food_name, local_name, calories, protein_g, carbs_g, fats_g, serving_size, category, search_tags) VALUES
('Mutton Pizza 1 slice', NULL, 320, 14.0, 38.0, 12.0, '1 slice', 'international', 'pizza,mutton,non-veg'),
('Chicken Pizza 1 slice', NULL, 285, 12.0, 36.0, 10.0, '1 slice', 'international', 'pizza,chicken,non-veg'),
('Ragi Dosa 1pc', 'Kezhvaragu Dosai', 120, 3.0, 22.0, 2.5, '1 piece', 'healthy', 'dosa,ragi,healthy,south-indian'),
('Millet Porridge 1 bowl', 'Gadka', 180, 5.0, 35.0, 3.0, '1 bowl', 'healthy', 'millet,porridge,healthy,breakfast'),
('Brinjal Curry 1 bowl', 'Vankaya Koora', 95, 2.5, 12.0, 4.5, '1 bowl (200g)', 'veg', 'brinjal,curry,veg,south-indian'),
('Almonds 30g', 'Badam', 170, 6.0, 6.0, 15.0, '30 grams', 'dry_fruits', 'almonds,nuts,healthy,snack'),
('Cashews 30g', 'Kaju', 155, 5.0, 9.0, 12.0, '30 grams', 'dry_fruits', 'cashew,nuts,healthy,snack'),
('Walnuts 30g', 'Akhrot', 195, 4.5, 4.0, 19.0, '30 grams', 'dry_fruits', 'walnuts,nuts,healthy,omega3');

-- ========================================
-- 2. FETCH QUERIES
-- ========================================

-- FETCH ALL USERS
SELECT id, email, username, full_name, age, created_at
FROM users
ORDER BY created_at DESC;

-- FETCH SPECIFIC USER (Login Check)
SELECT * FROM users
WHERE email = 'padmavathi2@gmail.com';

-- FETCH TODAY'S MEALS FOR A USER
SELECT * FROM meals
WHERE user_id = 35
AND meal_date = CURRENT_DATE
ORDER BY created_at DESC;

-- FETCH MEALS FOR DATE RANGE (7 days)
SELECT * FROM meals
WHERE user_id = 35
AND meal_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY meal_date DESC, created_at DESC;

-- FETCH MEALS FOR 90 DAYS
SELECT * FROM meals
WHERE user_id = 35
AND meal_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY meal_date DESC;

-- FETCH DASHBOARD SUMMARY (Today's Totals)
SELECT 
    COALESCE(SUM(calories), 0) as total_calories,
    COALESCE(SUM(protein_g), 0) as total_protein,
    COALESCE(SUM(carbs_g), 0) as total_carbs,
    COALESCE(SUM(fats_g), 0) as total_fats,
    COUNT(*) as meal_count
FROM meals
WHERE user_id = 35
AND meal_date = CURRENT_DATE;

-- FETCH FOOD SEARCH (Search for "dosa")
SELECT * FROM food_nutrition
WHERE food_name ILIKE '%dosa%'
   OR local_name ILIKE '%dosa%'
   OR search_tags ILIKE '%dosa%'
ORDER BY food_name
LIMIT 30;

-- FETCH FOOD SEARCH (Search for "pizza")
SELECT * FROM food_nutrition
WHERE food_name ILIKE '%pizza%'
   OR local_name ILIKE '%pizza%'
ORDER BY food_name;

-- FETCH ALL EXERCISES FOR USER
SELECT * FROM exercises
WHERE user_id = 35
ORDER BY exercise_date DESC;

-- FETCH ALL SLEEP RECORDS FOR USER
SELECT * FROM sleep_records
WHERE user_id = 35
ORDER BY sleep_date DESC;

-- FETCH FOODS BY CATEGORY
SELECT * FROM food_nutrition
WHERE category = 'indian_breakfast'
ORDER BY food_name;

-- FETCH HIGH PROTEIN FOODS (>20g)
SELECT food_name, local_name, calories, protein_g, serving_size
FROM food_nutrition
WHERE protein_g > 20
ORDER BY protein_g DESC;

-- FETCH LOW CALORIE FOODS (<150 cal)
SELECT food_name, local_name, calories, protein_g, carbs_g, fats_g
FROM food_nutrition
WHERE calories < 150
ORDER BY calories ASC;

-- FETCH FOODS WITH LOCAL NAMES
SELECT food_name, local_name, category, serving_size
FROM food_nutrition
WHERE local_name IS NOT NULL
ORDER BY food_name;

-- ========================================
-- 3. STATISTICS QUERIES
-- ========================================

-- COUNT FOODS BY CATEGORY
SELECT category, COUNT(*) as count
FROM food_nutrition
GROUP BY category
ORDER BY count DESC;

-- COUNT MEALS BY TYPE (Today)
SELECT meal_type, COUNT(*) as count, SUM(calories) as total_calories
FROM meals
WHERE user_id = 35 AND meal_date = CURRENT_DATE
GROUP BY meal_type;

-- COUNT TOTAL USERS
SELECT COUNT(*) as total_users FROM users;

-- COUNT TOTAL FOODS
SELECT COUNT(*) as total_foods FROM food_nutrition;

-- ========================================
-- 4. UPDATE QUERIES
-- ========================================

-- UPDATE USER PROFILE
UPDATE users
SET full_name = 'Padmavathi', age = 28, weight_kg = 60.5
WHERE id = 35;

-- UPDATE FOOD NUTRITION
UPDATE food_nutrition
SET calories = 175, protein_g = 3.8
WHERE food_name = 'dosa plain 1pc';

-- UPDATE MEAL
UPDATE meals
SET calories = 180, notes = 'Had extra ghee'
WHERE id = 7;

-- ========================================
-- 5. DELETE QUERIES
-- ========================================

-- DELETE MEAL
DELETE FROM meals
WHERE id = 7 AND user_id = 35;

-- DELETE EXERCISE
DELETE FROM exercises
WHERE id = 1 AND user_id = 35;

-- DELETE SLEEP RECORD
DELETE FROM sleep_records
WHERE id = 1 AND user_id = 35;

-- DELETE FOOD FROM DATABASE
DELETE FROM food_nutrition
WHERE food_name = 'test food';

-- DELETE USER (CASCADE will delete all their data)
DELETE FROM users
WHERE id = 99;

-- ========================================
-- 6. ADVANCED QUERIES (90-Day Tracking)
-- ========================================

-- GET USER'S 90-DAY NUTRITION SUMMARY
SELECT 
    DATE_TRUNC('week', meal_date) as week,
    COUNT(*) as meals_logged,
    ROUND(AVG(calories)) as avg_calories,
    ROUND(AVG(protein_g), 1) as avg_protein,
    ROUND(AVG(carbs_g), 1) as avg_carbs,
    ROUND(AVG(fats_g), 1) as avg_fats
FROM meals
WHERE user_id = 35
AND meal_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY week
ORDER BY week DESC;

-- GET DAILY TOTALS FOR LAST 7 DAYS
SELECT 
    meal_date,
    COUNT(*) as meal_count,
    SUM(calories) as total_calories,
    ROUND(SUM(protein_g), 1) as total_protein,
    ROUND(SUM(carbs_g), 1) as total_carbs,
    ROUND(SUM(fats_g), 1) as total_fats
FROM meals
WHERE user_id = 35
AND meal_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY meal_date
ORDER BY meal_date DESC;

-- GET MOST EATEN FOODS (Last 30 days)
SELECT 
    meal_name,
    COUNT(*) as times_eaten,
    ROUND(AVG(calories)) as avg_calories
FROM meals
WHERE user_id = 35
AND meal_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY meal_name
ORDER BY times_eaten DESC
LIMIT 10;

-- GET EXERCISE SUMMARY (Last 30 days)
SELECT 
    exercise_type,
    COUNT(*) as sessions,
    SUM(duration_minutes) as total_minutes,
    SUM(calories_burned) as total_burned
FROM exercises
WHERE user_id = 35
AND exercise_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY exercise_type
ORDER BY sessions DESC;

-- GET SLEEP QUALITY AVERAGE (Last 30 days)
SELECT 
    ROUND(AVG(total_hours), 1) as avg_hours,
    ROUND(AVG(sleep_quality), 1) as avg_quality,
    COUNT(*) as nights_logged
FROM sleep_records
WHERE user_id = 35
AND sleep_date >= CURRENT_DATE - INTERVAL '30 days';

-- ========================================
-- 7. SEARCH QUERIES (For Customer Use)
-- ========================================

-- Search for "pizza"
SELECT id, food_name, local_name, calories, protein_g, carbs_g, fats_g, serving_size
FROM food_nutrition
WHERE food_name ILIKE '%pizza%'
   OR local_name ILIKE '%pizza%'
   OR search_tags ILIKE '%pizza%'
ORDER BY food_name
LIMIT 30;

-- Search for "dosa"
SELECT id, food_name, local_name, calories, protein_g, carbs_g, fats_g, serving_size
FROM food_nutrition
WHERE food_name ILIKE '%dosa%'
   OR local_name ILIKE '%dosa%'
   OR search_tags ILIKE '%dosa%'
ORDER BY food_name
LIMIT 30;

-- Search for "chicken"
SELECT id, food_name, local_name, calories, protein_g, carbs_g, fats_g, serving_size
FROM food_nutrition
WHERE food_name ILIKE '%chicken%'
   OR local_name ILIKE '%chicken%'
   OR search_tags ILIKE '%chicken%'
ORDER BY food_name
LIMIT 30;

-- Search by local name "vankaya" (eggplant/brinjal)
SELECT id, food_name, local_name, calories, protein_g, carbs_g, fats_g
FROM food_nutrition
WHERE food_name ILIKE '%vankaya%'
   OR local_name ILIKE '%vankaya%'
   OR food_name ILIKE '%brinjal%'
   OR food_name ILIKE '%eggplant%'
ORDER BY food_name;

-- ========================================
-- 8. REPORTING QUERIES (90-Day Reports)
-- ========================================

-- FULL USER REPORT (90 Days)
SELECT 
    u.email,
    u.full_name,
    COUNT(DISTINCT m.meal_date) as days_logged,
    COUNT(m.id) as total_meals,
    ROUND(AVG(m.calories)) as avg_calories_per_meal,
    ROUND(SUM(m.calories)) as total_calories_consumed,
    ROUND(AVG(m.protein_g), 1) as avg_protein_per_meal
FROM users u
LEFT JOIN meals m ON u.id = m.user_id
WHERE u.id = 35
AND m.meal_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY u.id, u.email, u.full_name;

-- MEALS BREAKDOWN BY TYPE (Today)
SELECT 
    COALESCE(meal_type, 'unspecified') as meal_type,
    COUNT(*) as count,
    SUM(calories) as total_cal,
    SUM(protein_g) as total_protein
FROM meals
WHERE user_id = 35 
AND meal_date = CURRENT_DATE
GROUP BY meal_type
ORDER BY total_cal DESC;

-- TOP 10 FOODS IN DATABASE (By Calories)
SELECT food_name, local_name, calories, protein_g, serving_size, category
FROM food_nutrition
ORDER BY calories DESC
LIMIT 10;

-- TOP 10 FOODS IN DATABASE (By Protein)
SELECT food_name, local_name, calories, protein_g, serving_size, category
FROM food_nutrition
ORDER BY protein_g DESC
LIMIT 10;

-- ALL INDIAN BREAKFAST FOODS
SELECT food_name, local_name, calories, protein_g, carbs_g, fats_g, serving_size
FROM food_nutrition
WHERE category = 'indian_breakfast'
ORDER BY food_name;

-- ALL HEALTHY FOODS
SELECT food_name, local_name, calories, protein_g, carbs_g, fats_g, serving_size
FROM food_nutrition
WHERE category = 'healthy'
ORDER BY calories ASC;

-- ALL DRY FRUITS (in grams)
SELECT food_name, local_name, calories, protein_g, fats_g, serving_size
FROM food_nutrition
WHERE category = 'dry_fruits'
ORDER BY food_name;

-- ========================================
-- 9. BULK INSERT - ADD 100+ FOODS
-- ========================================

-- Example: Adding South Indian Foods with Local Names
INSERT INTO food_nutrition (food_name, local_name, calories, protein_g, carbs_g, fats_g, serving_size, category, search_tags) VALUES
-- Rice Items
('Curd Rice 1 bowl', 'Thayir Sadam', 150, 4.0, 28.0, 2.0, '1 bowl (200g)', 'south_indian', 'rice,curd,south-indian,comfort-food'),
('Lemon Rice 1 bowl', 'Chitrannam', 220, 3.5, 42.0, 5.0, '1 bowl (200g)', 'south_indian', 'rice,lemon,south-indian'),
('Tamarind Rice 1 bowl', 'Puliyodarai', 280, 4.0, 48.0, 8.0, '1 bowl (250g)', 'south_indian', 'rice,tamarind,south-indian'),

-- Tiffin Items
('Pongal 1 bowl', 'Ven Pongal', 240, 6.0, 38.0, 7.0, '1 bowl (200g)', 'south_indian', 'pongal,rice,breakfast,south-indian'),
('Upma 1 bowl', 'Uppittu', 200, 5.0, 35.0, 5.0, '1 bowl (200g)', 'south_indian', 'upma,breakfast,south-indian'),
('Poha 1 bowl', 'Aval Upma', 180, 3.0, 35.0, 3.0, '1 bowl (200g)', 'indian_breakfast', 'poha,breakfast,healthy'),

-- Curries
('Sambar 1 bowl', 'Sambar', 120, 5.0, 18.0, 3.0, '1 bowl (250ml)', 'south_indian', 'sambar,dal,veg,south-indian'),
('Rasam 1 bowl', 'Chaaru', 60, 2.0, 10.0, 1.5, '1 bowl (250ml)', 'south_indian', 'rasam,soup,south-indian'),
('Dal Tadka 1 bowl', 'Dal Fry', 150, 8.0, 20.0, 5.0, '1 bowl (200g)', 'north_indian', 'dal,protein,veg,north-indian'),

-- Snacks
('Murukku 50g', 'Chakli', 245, 4.0, 32.0, 11.0, '50 grams', 'snacks', 'murukku,snack,crispy,south-indian'),
('Mixture 50g', 'Chivda', 250, 5.0, 30.0, 12.0, '50 grams', 'snacks', 'mixture,snack,indian'),
('Banana Chips 50g', 'Vazhakkai Chips', 270, 1.5, 28.0, 17.0, '50 grams', 'snacks', 'chips,banana,snack'),

-- Sweets
('Ladoo 1pc', 'Laddu', 120, 2.0, 18.0, 5.0, '1 piece (30g)', 'sweets', 'ladoo,sweet,indian'),
('Jalebi 100g', 'Jilebi', 300, 3.0, 65.0, 4.0, '100 grams', 'sweets', 'jalebi,sweet,indian'),
('Gulab Jamun 2pc', 'Gulab Jamun', 280, 4.0, 48.0, 9.0, '2 pieces', 'sweets', 'sweet,indian');

-- ========================================
-- 10. VERIFY DATA
-- ========================================

-- Check total rows in each table
SELECT 'users' as table_name, COUNT(*) as rows FROM users
UNION ALL
SELECT 'meals' as table_name, COUNT(*) as rows FROM meals
UNION ALL
SELECT 'exercises' as table_name, COUNT(*) as rows FROM exercises
UNION ALL
SELECT 'sleep_records' as table_name, COUNT(*) as rows FROM sleep_records
UNION ALL
SELECT 'food_nutrition' as table_name, COUNT(*) as rows FROM food_nutrition;

-- Verify recent meal was added
SELECT * FROM meals
ORDER BY id DESC
LIMIT 1;

-- Verify food search works
SELECT COUNT(*) as total_results, 
       'dosa' as search_term
FROM food_nutrition
WHERE food_name ILIKE '%dosa%' 
   OR local_name ILIKE '%dosa%';

-- ========================================
-- END OF SQL QUERIES
-- ========================================


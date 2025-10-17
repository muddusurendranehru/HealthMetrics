import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Plus, Search, Utensils, LogOut, Flame, Beef, Droplet } from "lucide-react";

type User = {
  id: number;
  email: string;
};

type DashboardSummary = {
  today: {
    meals: {
      total_calories: number;
      total_protein: number;
      total_carbs: number;
      total_fats: number;
      meal_count: number;
    };
    exercises: {
      total_minutes: number;
      total_burned: number;
      exercise_count: number;
    };
    sleep: {
      total_hours: number;
      sleep_quality: number;
      sleep_date: string;
    } | null;
  };
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
      localStorage.removeItem("user");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                90-Day Health Tracker
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user.email}</p>
            </div>
            <Button variant="outline" onClick={logout} data-testid="button-logout" className="gap-2">
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Speedometer Dashboard */}
        <SpeedometerDashboard userId={user.id} />

        {/* Data Entry and View Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Food Entry */}
          <FoodEntryCard userId={user.id} />

          {/* Today's Meals */}
          <TodaysMealsCard userId={user.id} />
        </div>
      </main>
    </div>
  );
}

// Speedometer Dashboard Component
function SpeedometerDashboard({ userId }: { userId: number }) {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: [`/api/dashboard/summary`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const calories = summary?.today.meals.total_calories || 0;
  const protein = summary?.today.meals.total_protein || 0;
  const fats = summary?.today.meals.total_fats || 0;

  // Daily goals
  const calorieGoal = 2000;
  const proteinGoal = 100;
  const fatsGoal = 65;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Calories Ring */}
      <SpeedometerRing
        value={calories}
        goal={calorieGoal}
        label="Calories"
        icon={<Flame className="h-8 w-8" />}
        colorStart="#fb923c"
        colorEnd="#ef4444"
        unit="kcal"
      />

      {/* Protein Ring */}
      <SpeedometerRing
        value={protein}
        goal={proteinGoal}
        label="Protein"
        icon={<Beef className="h-8 w-8" />}
        colorStart="#f472b6"
        colorEnd="#f43f5e"
        unit="g"
      />

      {/* Fats Ring */}
      <SpeedometerRing
        value={fats}
        goal={fatsGoal}
        label="Fats"
        icon={<Droplet className="h-8 w-8" />}
        colorStart="#60a5fa"
        colorEnd="#06b6d4"
        unit="g"
      />
    </div>
  );
}

// Speedometer Ring Component
function SpeedometerRing({ value, goal, label, icon, colorStart, colorEnd, unit }: {
  value: number;
  goal: number;
  label: string;
  icon: React.ReactNode;
  colorStart: string;
  colorEnd: string;
  unit: string;
}) {
  const percentage = Math.min((value / goal) * 100, 100);
  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <div style={{ color: colorStart }}>{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{label}</h3>
          </div>

          {/* SVG Ring */}
          <div className="relative w-48 h-48">
            <svg className="transform -rotate-90 w-48 h-48">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke={`url(#gradient-${label})`}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colorStart} />
                  <stop offset="100%" stopColor={colorEnd} />
                </linearGradient>
              </defs>
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(value)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                / {goal} {unit}
              </div>
              <div className="text-xs font-semibold mt-1" style={{ color: colorStart }}>
                {percentage.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Food Entry Card Component
function FoodEntryCard({ userId }: { userId: number }) {
  const { toast } = useToast();
  const [foodSearch, setFoodSearch] = useState("");
  const [foodResults, setFoodResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [mealType, setMealType] = useState<string>("");

  // Search foods when user types
  useEffect(() => {
    const searchFoods = async () => {
      if (foodSearch.length < 2) {
        setFoodResults([]);
        return;
      }

      try {
        const response = await apiRequest("GET", `/api/foods/search?q=${encodeURIComponent(foodSearch)}`, undefined);
        const data = await response.json();
        setFoodResults(data.foods || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    const timeoutId = setTimeout(searchFoods, 300);
    return () => clearTimeout(timeoutId);
  }, [foodSearch]);

  const addMealMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/meals", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Meal Added!",
        description: "Your meal has been logged successfully"
      });
      // Reset form
      setFoodSearch("");
      setSelectedFood(null);
      setMealType("");
      setShowResults(false);
      // Refresh dashboard
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meals/today"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add meal",
        variant: "destructive"
      });
    }
  });

  const handleAddMeal = () => {
    if (!selectedFood || !mealType) {
      toast({
        title: "Missing Information",
        description: "Please select a food and meal type",
        variant: "destructive"
      });
      return;
    }

    addMealMutation.mutate({
      mealName: selectedFood.food_name,
      mealType: mealType,
      calories: selectedFood.calories,
      proteinG: selectedFood.protein_g,
      carbsG: selectedFood.carbs_g,
      fatsG: selectedFood.fats_g
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Log Your Meal
        </CardTitle>
        <CardDescription>
          Search and add food to track your nutrition
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Meal Type Selection */}
        <div>
          <Label>Meal Type *</Label>
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger className="mt-1" data-testid="select-meal-type">
              <SelectValue placeholder="When are you eating?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
              <SelectItem value="lunch">🌞 Lunch</SelectItem>
              <SelectItem value="dinner">🌙 Dinner</SelectItem>
              <SelectItem value="snack">🍪 Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Food Search */}
        <div className="relative">
          <Label>Search Food *</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={foodSearch}
              onChange={(e) => {
                setFoodSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Try: dosa, pizza, chicken, vankaya..."
              className="pl-10"
              data-testid="input-food-search"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && foodResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-auto">
              {foodResults.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => {
                    setSelectedFood(food);
                    setFoodSearch(food.food_name);
                    setShowResults(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                  data-testid={`food-result-${food.id}`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {food.food_name}
                    {food.local_name && (
                      <span className="text-sm text-gray-500 ml-2">({food.local_name})</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {food.calories} cal | P: {food.protein_g}g | C: {food.carbs_g}g | F: {food.fats_g}g
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Food Display */}
        {selectedFood && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
            <div className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
              <span className="text-lg">✓</span>
              {selectedFood.food_name}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
              <div className="text-center">
                <div className="font-bold text-orange-600">{selectedFood.calories}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Calories</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-pink-600">{selectedFood.protein_g}g</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">{selectedFood.carbs_g}g</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">{selectedFood.fats_g}g</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Fats</div>
              </div>
            </div>
          </div>
        )}

        {/* Add Button */}
        <Button
          onClick={handleAddMeal}
          disabled={!selectedFood || !mealType || addMealMutation.isPending}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          data-testid="button-add-meal"
        >
          <Plus className="mr-2 h-4 w-4" />
          {addMealMutation.isPending ? "Adding..." : "Add Meal"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Today's Meals Card Component
function TodaysMealsCard({ userId }: { userId: number }) {
  const { data: mealsData, isLoading } = useQuery<{ meals: any[] }>({
    queryKey: [`/api/meals/today`],
  });

  const meals = mealsData?.meals || [];

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardTitle>Today's Meals</CardTitle>
        <CardDescription>
          {meals.length} {meals.length === 1 ? 'meal' : 'meals'} logged today
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading meals...</div>
        ) : meals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No meals logged today. Start tracking!
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {meals.map((meal: any) => (
              <div
                key={meal.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {meal.meal_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {meal.meal_type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">{meal.calories} cal</div>
                    <div className="text-xs text-gray-500 mt-1">
                      P: {meal.protein_g}g | F: {meal.fats_g}g
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

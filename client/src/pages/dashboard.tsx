import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Plus, Apple, Dumbbell, Moon, Weight, Droplets } from "lucide-react";

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
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

  const logout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Health Tracker Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user.email}
              </span>
              <Button variant="outline" onClick={logout} data-testid="button-logout">
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Box: Enter Data */}
            <Card className="h-fit" data-testid="card-enter-data">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Log Health Data
                </CardTitle>
                <CardDescription>
                  Enter your meals, exercises, sleep, weight, and water intake
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataEntryForm userId={user.id} />
              </CardContent>
            </Card>

            {/* Right Box: View Data */}
            <Card className="h-fit" data-testid="card-view-data">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  View your recent health tracking data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataView userId={user.id} />
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}

function DataEntryForm({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"meal" | "exercise" | "sleep" | "weight" | "water">("meal");

  // Meal form state
  const [mealData, setMealData] = useState({
    mealType: "",
    foodItem: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: ""
  });
  
  // Food search state
  const [foodSearch, setFoodSearch] = useState("");
  const [foodResults, setFoodResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Search foods when user types
  useEffect(() => {
    const searchFoods = async () => {
      if (foodSearch.length < 2) {
        setFoodResults([]);
        return;
      }
      
      try {
        const response = await fetch(`/api/foods/search?q=${encodeURIComponent(foodSearch)}`);
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
  
  // Select food from search results
  const selectFood = (food: any) => {
    setMealData({
      ...mealData,
      foodItem: food.food_name,
      calories: food.calories.toString(),
      protein: food.protein_g?.toString() || "",
      carbs: food.carbs_g?.toString() || "",
      fats: food.fats_g?.toString() || ""
    });
    setFoodSearch(food.food_name);
    setShowResults(false);
  };

  // Exercise form state
  const [exerciseData, setExerciseData] = useState({
    exerciseType: "",
    exerciseName: "",
    duration: "",
    caloriesBurned: ""
  });

  // Sleep form state
  const [sleepData, setSleepData] = useState({
    sleepDate: new Date().toISOString().split('T')[0],
    hoursSlept: "",
    sleepQuality: ""
  });

  // Weight form state
  const [weightData, setWeightData] = useState({
    weight: ""
  });

  // Water form state
  const [waterData, setWaterData] = useState({
    amount: "",
    unit: "glasses"
  });

  const addDataMutation = useMutation({
    mutationFn: async (data: any) => {
      let endpoint = "";
      let payload = { ...data, userId };

      switch (activeTab) {
        case "meal":
          endpoint = "/api/meals/add";
          payload = {
            food_name: data.foodItem,
            calories: parseInt(data.calories) || 0,
            protein_g: parseFloat(data.protein) || 0,
            carbs_g: parseFloat(data.carbs) || 0,
            fats_g: parseFloat(data.fats) || 0,
            meal_type: data.mealType
          };
          break;
        case "exercise":
          endpoint = "/api/exercises";
          if (data.duration) payload.duration = parseInt(data.duration);
          if (data.caloriesBurned) payload.caloriesBurned = parseInt(data.caloriesBurned);
          break;
        case "sleep":
          endpoint = "/api/sleep";
          if (data.hoursSlept) payload.hoursSlept = parseFloat(data.hoursSlept);
          if (data.sleepQuality) payload.sleepQuality = parseInt(data.sleepQuality);
          break;
        case "weight":
          endpoint = "/api/weight";
          payload.weight = parseFloat(data.weight);
          break;
        case "water":
          endpoint = "/api/water";
          payload.amount = parseFloat(data.amount);
          break;
      }

      const response = await apiRequest("POST", endpoint, payload);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `${activeTab} data logged successfully`
      });
      
      // Reset form
      switch (activeTab) {
        case "meal":
          setMealData({ mealType: "", foodItem: "", calories: "", protein: "", carbs: "", fats: "" });
          setFoodSearch("");
          break;
        case "exercise":
          setExerciseData({ exerciseType: "", exerciseName: "", duration: "", caloriesBurned: "" });
          break;
        case "sleep":
          setSleepData({ sleepDate: new Date().toISOString().split('T')[0], hoursSlept: "", sleepQuality: "" });
          break;
        case "weight":
          setWeightData({ weight: "" });
          break;
        case "water":
          setWaterData({ amount: "", unit: "glasses" });
          break;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log data",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let dataToSubmit;
    switch (activeTab) {
      case "meal":
        dataToSubmit = mealData;
        break;
      case "exercise":
        dataToSubmit = exerciseData;
        break;
      case "sleep":
        dataToSubmit = sleepData;
        break;
      case "weight":
        dataToSubmit = weightData;
        break;
      case "water":
        dataToSubmit = waterData;
        break;
    }

    addDataMutation.mutate(dataToSubmit);
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === "meal" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("meal")}
          data-testid="tab-meal"
        >
          <Apple className="mr-1 h-4 w-4" />
          Meal
        </Button>
        <Button
          variant={activeTab === "exercise" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("exercise")}
          data-testid="tab-exercise"
        >
          <Dumbbell className="mr-1 h-4 w-4" />
          Exercise
        </Button>
        <Button
          variant={activeTab === "sleep" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("sleep")}
          data-testid="tab-sleep"
        >
          <Moon className="mr-1 h-4 w-4" />
          Sleep
        </Button>
        <Button
          variant={activeTab === "weight" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("weight")}
          data-testid="tab-weight"
        >
          <Weight className="mr-1 h-4 w-4" />
          Weight
        </Button>
        <Button
          variant={activeTab === "water" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("water")}
          data-testid="tab-water"
        >
          <Droplets className="mr-1 h-4 w-4" />
          Water
        </Button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === "meal" && (
          <>
            <div>
              <Label htmlFor="mealType">Meal Type</Label>
              <Select 
                value={mealData.mealType} 
                onValueChange={(value) => setMealData({ ...mealData, mealType: value })}
              >
                <SelectTrigger data-testid="select-meal-type">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Label htmlFor="foodSearch">Search Food</Label>
              <Input
                id="foodSearch"
                value={foodSearch}
                onChange={(e) => {
                  setFoodSearch(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search: mango, upma, dosa..."
                data-testid="input-food-search"
                required
              />
              
              {/* Search Results Dropdown */}
              {showResults && foodResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {foodResults.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => selectFood(food)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      data-testid={`food-result-${food.id}`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{food.food_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {food.calories} cal | P: {food.protein_g}g | C: {food.carbs_g}g | F: {food.fats_g}g
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected Food Display */}
            {mealData.foodItem && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="font-medium text-green-900 dark:text-green-100">✓ {mealData.foodItem}</div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {mealData.calories} cal | Protein: {mealData.protein}g | Carbs: {mealData.carbs}g | Fat: {mealData.fats}g
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "exercise" && (
          <>
            <div>
              <Label htmlFor="exerciseType">Exercise Type</Label>
              <Input
                id="exerciseType"
                value={exerciseData.exerciseType}
                onChange={(e) => setExerciseData({ ...exerciseData, exerciseType: e.target.value })}
                placeholder="e.g., Cardio, Strength, Yoga"
                data-testid="input-exercise-type"
                required
              />
            </div>
            <div>
              <Label htmlFor="exerciseName">Exercise Name</Label>
              <Input
                id="exerciseName"
                value={exerciseData.exerciseName}
                onChange={(e) => setExerciseData({ ...exerciseData, exerciseName: e.target.value })}
                placeholder="e.g., Running, Push-ups"
                data-testid="input-exercise-name"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={exerciseData.duration}
                onChange={(e) => setExerciseData({ ...exerciseData, duration: e.target.value })}
                placeholder="How long did you exercise?"
                data-testid="input-duration"
              />
            </div>
            <div>
              <Label htmlFor="caloriesBurned">Calories Burned</Label>
              <Input
                id="caloriesBurned"
                type="number"
                value={exerciseData.caloriesBurned}
                onChange={(e) => setExerciseData({ ...exerciseData, caloriesBurned: e.target.value })}
                placeholder="Estimated calories burned"
                data-testid="input-calories-burned"
              />
            </div>
          </>
        )}

        {activeTab === "sleep" && (
          <>
            <div>
              <Label htmlFor="sleepDate">Sleep Date</Label>
              <Input
                id="sleepDate"
                type="date"
                value={sleepData.sleepDate}
                onChange={(e) => setSleepData({ ...sleepData, sleepDate: e.target.value })}
                data-testid="input-sleep-date"
                required
              />
            </div>
            <div>
              <Label htmlFor="hoursSlept">Hours Slept</Label>
              <Input
                id="hoursSlept"
                type="number"
                step="0.5"
                value={sleepData.hoursSlept}
                onChange={(e) => setSleepData({ ...sleepData, hoursSlept: e.target.value })}
                placeholder="e.g., 7.5"
                data-testid="input-hours-slept"
              />
            </div>
            <div>
              <Label htmlFor="sleepQuality">Sleep Quality (1-5)</Label>
              <Select 
                value={sleepData.sleepQuality} 
                onValueChange={(value) => setSleepData({ ...sleepData, sleepQuality: value })}
              >
                <SelectTrigger data-testid="select-sleep-quality">
                  <SelectValue placeholder="Rate your sleep quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Poor</SelectItem>
                  <SelectItem value="2">2 - Poor</SelectItem>
                  <SelectItem value="3">3 - Fair</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {activeTab === "weight" && (
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weightData.weight}
              onChange={(e) => setWeightData({ ...weightData, weight: e.target.value })}
              placeholder="Your current weight"
              data-testid="input-weight"
              required
            />
          </div>
        )}

        {activeTab === "water" && (
          <>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.1"
                value={waterData.amount}
                onChange={(e) => setWaterData({ ...waterData, amount: e.target.value })}
                placeholder="How much water?"
                data-testid="input-water-amount"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={waterData.unit} 
                onValueChange={(value) => setWaterData({ ...waterData, unit: value })}
              >
                <SelectTrigger data-testid="select-water-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="glasses">Glasses</SelectItem>
                  <SelectItem value="ml">Milliliters</SelectItem>
                  <SelectItem value="oz">Ounces</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={addDataMutation.isPending}
          data-testid="button-submit-data"
        >
          {addDataMutation.isPending ? "Logging..." : `Log ${activeTab}`}
        </Button>
      </form>
    </div>
  );
}

type RecentData = {
  meals?: any[];
  exercises?: any[];
  sleepRecords?: any[];
  weightRecords?: any[];
  waterIntake?: any[];
};

function DataView({ userId }: { userId: string }) {
  const { data: recentData, isLoading } = useQuery<RecentData>({
    queryKey: ["/api/recent", userId],
    enabled: !!userId
  });

  if (isLoading) {
    return <div data-testid="loading-recent-data">Loading recent data...</div>;
  }

  if (!recentData || Object.keys(recentData).length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400" data-testid="no-data">
        No data logged yet. Start tracking your health!
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="recent-data">
      {recentData.meals && recentData.meals.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Recent Meals</h4>
          {recentData.meals.slice(0, 3).map((meal: any, index: number) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {meal.mealType}: {meal.foodItem} ({meal.calories} cal)
            </div>
          ))}
        </div>
      )}

      {recentData.exercises && recentData.exercises.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Recent Exercises</h4>
          {recentData.exercises.slice(0, 3).map((exercise: any, index: number) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {exercise.exerciseName} - {exercise.duration} min
            </div>
          ))}
        </div>
      )}

      {recentData.sleepRecords && recentData.sleepRecords.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Recent Sleep</h4>
          {recentData.sleepRecords.slice(0, 3).map((sleep: any, index: number) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {sleep.sleepDate}: {sleep.hoursSlept}h (Quality: {sleep.sleepQuality}/5)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Type } from "@google/genai";

export enum Screen {
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PLAN = 'PLAN',
  COACH = 'COACH',
  REMINDERS = 'REMINDERS',
  PROFILE = 'PROFILE',
  STATS = 'STATS',
}

// --- Domain Models ---

export interface MacroNutrients {
  calories: number;
  protein: number; // g
  carbs: number; // g
  fats: number; // g
  fiber?: number; // g
  sugar?: number; // g
  sodium?: number; // mg
}

export type ReminderType = 'Medicine' | 'Screening' | 'Custom' | 'Water';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM 24h format
  completed: boolean;

  // Medicine specific
  dosage?: string;
  frequency?: 'Daily' | 'Weekly' | 'Once';

  // Screening/Custom specific
  location?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  avatarUrl?: string;
  biometrics: {
    age: number;
    weight: number; // kg
    height: number; // cm
    gender: 'Male' | 'Female' | 'Other';
    activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Athlete';
  };
  goals: {
    primary: 'Weight Loss' | 'Maintenance' | 'Muscle Gain';
    targetWeight?: number;
    dailyCalories: number;
    dailyWater?: number; // Target in ml
    macroRatio: { p: number; c: number; f: number }; // Percentage 0-100
  };
  preferences: {
    allergies: string[];
    dietaryType: 'Omnivore' | 'Vegetarian' | 'Vegan' | 'Keto' | 'Paleo';
    excludedIngredients: string[];
  };
  reminders: Reminder[];
}

export interface FoodItem extends MacroNutrients {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  imageUrl?: string; // High res URL
  barcode?: string;
  verified: boolean; // True if from USDA DB, False if AI generated
}

export interface FoodLogEntry {
  id: string;
  timestamp: number;
  date: string; // ISO YYYY-MM-DD
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  items: FoodItem[];
  totalMacros: MacroNutrients;
  imageUrl?: string; // User uploaded photo
  aiAnalysisRaw?: string;
}

export interface MealPlanDay {
  date: string;
  dayOfWeek: string;
  meals: {
    type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    suggestedTime: string;
    recipe: {
      title: string;
      description: string;
      ingredients: string[];
      macros: MacroNutrients;
      prepTimeMinutes: number;
      imageUrl?: string;
    };
    status: 'Pending' | 'Consumed' | 'Skipped';
  }[];
}

export interface MealPlan {
  day: string;
  meals: {
    type: string;
    calories: number;
    macros: { protein: number; carbs: number; fats: number };
    name: string;
    ingredients: string[];
    instructions: string[];
    imageUrl?: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  attachments?: { type: 'image' | 'food_log'; payload: any }[];
  isTyping?: boolean;
}

export interface DailyProgress {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  steps: number;
  waterMl: number;
  macros: MacroNutrients;
}

export interface MedicalRecord {
  id: string;
  fileName: string;
  dateUploaded: string;
  summary: string;
  tags: string[];
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

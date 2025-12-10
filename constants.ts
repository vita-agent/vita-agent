
import { UserProfile, MealPlanDay, Reminder } from './types';

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// --- SMART IMAGE SYSTEM ---
// Curated high-quality images from Unsplash & Pexels for common food categories
export const FOOD_IMAGES: Record<string, string> = {
  'default': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80', // Healthy bowl
  'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  'chicken': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
  'steak': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80',
  'beef': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80',
  'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=800&q=80',
  'sushi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  'avocado': 'https://images.unsplash.com/photo-1523049673856-3dbac6e27a37?auto=format&fit=crop&w=800&q=80',
  'egg': 'https://images.unsplash.com/photo-1525351484163-7529414395d8?auto=format&fit=crop&w=800&q=80',
  'breakfast': 'https://images.unsplash.com/photo-1533089862017-62d45a826f79?auto=format&fit=crop&w=800&q=80',
  'oatmeal': 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80',
  'fruit': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
  'smoothie': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80',
  'pasta': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80',
  'pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
  'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'rice': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
  'soup': 'https://images.unsplash.com/photo-1547592166-23acbe3a624b?auto=format&fit=crop&w=800&q=80',
  'coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
  'water': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80',
  'tea': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
  'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  'dessert': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
  'snack': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
};

export const getSmartImage = (term: string): string => {
  if (!term) return FOOD_IMAGES['default'];
  const lower = term.toLowerCase();
  // Find the first key that is contained in the search term
  const key = Object.keys(FOOD_IMAGES).find(k => lower.includes(k));
  return key ? FOOD_IMAGES[key] : FOOD_IMAGES['default'];
};

// --- MOCK DATA ---

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'r1',
    type: 'Medicine',
    title: 'Vitamin D Supplement',
    date: today,
    time: '08:00',
    completed: true,
    dosage: '1 Tablet',
    frequency: 'Daily'
  },
  {
    id: 'r2',
    type: 'Medicine',
    title: 'Omega-3 Fish Oil',
    date: today,
    time: '13:00',
    completed: false,
    dosage: '2 Capsules',
    frequency: 'Daily'
  },
  {
    id: 'r3',
    type: 'Screening',
    title: 'Annual Blood Panel',
    date: tomorrow,
    time: '09:30',
    completed: false,
    location: 'City Health Clinic',
    notes: 'Fast 12 hours before appointment.'
  },
  {
    id: 'r4',
    type: 'Custom',
    title: 'Physiotherapy Session',
    date: '2025-11-15',
    time: '16:00',
    completed: false,
    location: 'SportFit Center',
    notes: 'Bring MRI scan results.'
  }
];

export const MOCK_PROFILE: UserProfile = {
  id: 'u_12345',
  name: 'Alex Sterling',
  // High quality portrait from Pexels/Unsplash
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  biometrics: {
    age: 28,
    weight: 78,
    height: 180,
    gender: 'Male',
    activityLevel: 'Active',
  },
  goals: {
    primary: 'Muscle Gain',
    targetWeight: 82,
    dailyCalories: 2600,
    dailyWater: 3000,
    macroRatio: { p: 30, c: 45, f: 25 },
  },
  preferences: {
    allergies: ['Shellfish'],
    dietaryType: 'Omnivore',
    excludedIngredients: ['Cilantro'],
  },
  reminders: MOCK_REMINDERS
};

export const SAMPLE_MEAL_PLAN: MealPlanDay[] = [
  {
    date: new Date().toISOString().split('T')[0],
    dayOfWeek: 'Today',
    meals: [
      {
        type: 'Breakfast',
        suggestedTime: '08:00 AM',
        status: 'Pending',
        recipe: {
          title: 'Avocado Toast & Poached Eggs',
          description: 'Whole grain toast topped with smashed avocado and a perfectly poached egg.',
          ingredients: ['2 slices Whole Grain Bread', '1 Avocado', '2 Large Eggs', 'Red Pepper Flakes'],
          macros: { calories: 450, protein: 18, carbs: 35, fats: 28 },
          prepTimeMinutes: 10,
          imageUrl: FOOD_IMAGES['egg']
        }
      },
      {
        type: 'Lunch',
        suggestedTime: '01:00 PM',
        status: 'Pending',
        recipe: {
          title: 'Grilled Chicken Quinoa Bowl',
          description: 'Lean chicken breast served over quinoa with roasted vegetables.',
          ingredients: ['150g Chicken Breast', '1 cup Quinoa', 'Broccoli', 'Bell Peppers'],
          macros: { calories: 620, protein: 45, carbs: 55, fats: 15 },
          prepTimeMinutes: 25,
          imageUrl: FOOD_IMAGES['chicken']
        }
      },
      {
        type: 'Dinner',
        suggestedTime: '07:30 PM',
        status: 'Pending',
        recipe: {
          title: 'Baked Salmon & Asparagus',
          description: 'Omega-3 rich salmon fillet baked with lemon and garlic.',
          ingredients: ['200g Salmon Fillet', 'Asparagus Bundle', 'Lemon', 'Garlic'],
          macros: { calories: 580, protein: 40, carbs: 12, fats: 35 },
          prepTimeMinutes: 20,
          imageUrl: FOOD_IMAGES['salmon']
        }
      }
    ]
  }
];

export const PREBUILT_QUICK_ADDS = [
  { name: 'Water (250ml)', icon: '💧', cals: 0 },
  { name: 'Coffee (Black)', icon: '☕', cals: 5 },
  { name: 'Banana', icon: '🍌', cals: 105 },
  { name: 'Protein Shake', icon: '🥤', cals: 160 },
];

export const FIRST_AID_DATA = [
  {
    id: '1',
    title: 'CPR (Adult)',
    category: 'Emergency',
    content: `1. Check response.
2. Call emergency services.
3. Check for breathing.
4. Start chest compressions:
   - Place heel of hand on center of chest.
   - Interlock fingers.
   - Compress 2 inches deep.
   - Rate: 100-120/min.
5. Give rescue breaths (optional if untrained).`
  },
  {
    id: '2',
    title: 'Burn Treatment',
    category: 'Basic Aid',
    content: `1. Cool the burn under cool running water for 20 minutes.
2. Remove constricting items (rings, watches) before swelling starts.
3. Do not pop blisters.
4. Cover loosely with sterile gauze.`
  },
  {
    id: '3',
    title: 'Choking (Adult)',
    category: 'Emergency',
    content: `1. Encourage coughing.
2. Give 5 back blows between shoulder blades.
3. Give 5 abdominal thrusts (Heimlich maneuver):
   - Stand behind.
   - Wrap arms around waist.
   - Make a fist above navel.
   - Thrust inward and upward.
4. Repeat cycle.`
  }
];

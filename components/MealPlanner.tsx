
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { MealPlan, UserProfile } from '../types';
import { Loader2, ChefHat, Utensils, ChevronDown, ChevronUp, Clock, Flame, Calendar, CalendarCheck } from 'lucide-react';
import { getSmartImage } from '../constants';
import RecipeModal from './RecipeModal';

const gemini = new GeminiService();

export default function MealPlanner({ profile }: { profile: UserProfile }) {
    const [plans, setPlans] = useState<MealPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<MealPlan['meals'][0] | null>(null);
    const [isBusyDay, setIsBusyDay] = useState(false);

    const handleSyncCalendar = () => {
        if (plans.length === 0) return;
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Vita//Meal Plan//EN\n";

        plans.forEach((day, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().replace(/[-:]/g, '').split('T')[0];

            day.meals.forEach(meal => {
                let time = '120000'; // Default lunch
                if (meal.type === 'Breakfast') time = '080000';
                if (meal.type === 'Dinner') time = '190000';
                if (meal.type === 'Snack') time = '150000';

                icsContent += "BEGIN:VEVENT\n";
                icsContent += `DTSTART:${dateStr}T${time}\n`;
                icsContent += `DURATION:PT30M\n`;
                icsContent += `SUMMARY:Vita Meal: ${meal.name}\n`;
                icsContent += `DESCRIPTION:${meal.type} - ${meal.calories}kcal. Ingredients: ${meal.ingredients.join(', ')}\n`;
                icsContent += "END:VEVENT\n";
            });
        });
        icsContent += "END:VCALENDAR";

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'vita_meal_plan.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generatePlan = async () => {
        setIsLoading(true);
        try {
            let prompt = `Age: ${profile.biometrics.age}, Weight: ${profile.biometrics.weight}kg, Goal: ${profile.goals.primary}, Allergies: ${profile.preferences.allergies.join(', ')}`;
            if (isBusyDay) {
                prompt += ". The user has a very busy schedule. Suggest ONLY quick and easy meals that take less than 15 minutes to prepare.";
            }
            const result = await gemini.generateMealPlan(prompt);
            const enhanced = result.map(day => ({
                ...day,
                meals: day.meals.map(meal => ({ ...meal, imageUrl: getSmartImage(meal.name) }))
            }));
            setPlans(enhanced);
        } catch (err) {
            alert('Generation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-32">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Meal Plan</h2>
                        <p className="text-slate-400 font-medium">Curated for {profile.goals.primary}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Utensils className="w-7 h-7 text-white" />
                    </div>
                </div>
                <button
                    onClick={generatePlan}
                    disabled={isLoading}
                    className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChefHat className="w-5 h-5" />}
                    Generate New Weekly Plan
                </button>

                <div className="mt-6 flex items-center justify-between gap-4">
                    <button
                        onClick={() => setIsBusyDay(!isBusyDay)}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isBusyDay ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                    >
                        <Clock className="w-4 h-4" />
                        {isBusyDay ? 'Busy Mode: ON' : 'Busy Mode: OFF'}
                    </button>
                    <button
                        onClick={handleSyncCalendar}
                        disabled={plans.length === 0}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        <CalendarCheck className="w-4 h-4" />
                        Sync to Calendar
                    </button>
                </div>
            </div>

            {plans.length === 0 && (
                <div className="text-center py-20 text-slate-400 animate-fade-in">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                        <ChefHat className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="font-medium text-lg text-slate-600">No plans generated yet.</p>
                    <p className="text-sm">Tap the button above to create your personalized menu.</p>
                </div>
            )}

            {plans.map((day, i) => (
                <div key={i} className="space-y-4 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex items-center gap-3 ml-2">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{day.day}</h3>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    {day.meals.map((meal, j) => (
                        <div key={j} onClick={() => setSelectedMeal(meal)} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer group">
                            <div className="p-4 flex flex-col sm:flex-row gap-5">
                                <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden shadow-sm relative shrink-0">
                                    <img src={meal.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={meal.name} />
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">{meal.type}</div>
                                </div>
                                <div className="flex-1 py-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-900 text-xl leading-tight mb-2 group-hover:text-emerald-600 transition-colors">{meal.name}</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {meal.ingredients.slice(0, 3).map((ing, k) => (
                                            <span key={k} className="px-2 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg truncate max-w-[100px]">{ing}</span>
                                        ))}
                                        {meal.ingredients.length > 3 && <span className="px-2 py-1 bg-slate-50 text-slate-400 text-xs font-bold rounded-lg">+{meal.ingredients.length - 3}</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-auto">
                                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg"><Flame className="w-3 h-3" /> {meal.calories} kcal</span>
                                        {meal.macros && (
                                            <>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">P: {meal.macros.protein}g</span>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">C: {meal.macros.carbs}g</span>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">F: {meal.macros.fats}g</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {selectedMeal && <RecipeModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
        </div>
    );
}

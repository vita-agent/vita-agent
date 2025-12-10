import React, { useState } from 'react';
import { X, Clock, Flame, ChefHat, Check, Play, Maximize2, Minimize2 } from 'lucide-react';
import { MealPlan } from '../types';

interface RecipeModalProps {
    meal: MealPlan['meals'][0];
    onClose: () => void;
}

export default function RecipeModal({ meal, onClose }: RecipeModalProps) {
    const [cookMode, setCookMode] = useState(false);
    const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

    const toggleIngredient = (ing: string) => {
        const next = new Set(checkedIngredients);
        if (next.has(ing)) next.delete(ing);
        else next.add(ing);
        setCheckedIngredients(next);
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-slide-up overflow-hidden">
            {/* Hero Image / Header */}
            <div className={`relative ${cookMode ? 'h-0' : 'h-72'} transition-all duration-500 shrink-0`}>
                <img src={meal.imageUrl} className="w-full h-full object-cover" alt={meal.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors">
                    <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                        <ChefHat className="w-3.5 h-3.5" /> {meal.type}
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight shadow-sm">{meal.name}</h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white relative rounded-t-[2rem] -mt-6">
                <div className="p-8 pb-32">

                    {/* Stats Bar */}
                    {!cookMode && (
                        <div className="flex items-center justify-between mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase mb-1 justify-center"><Flame className="w-3 h-3" /> Calories</div>
                                <div className="text-xl font-black text-slate-900">{meal.calories}</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="text-center">
                                <div className="text-slate-400 text-xs font-bold uppercase mb-1">Protein</div>
                                <div className="text-xl font-black text-slate-900">{meal.macros.protein}g</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="text-center">
                                <div className="text-slate-400 text-xs font-bold uppercase mb-1">Carbs</div>
                                <div className="text-xl font-black text-slate-900">{meal.macros.carbs}g</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="text-center">
                                <div className="text-slate-400 text-xs font-bold uppercase mb-1">Fats</div>
                                <div className="text-xl font-black text-slate-900">{meal.macros.fats}g</div>
                            </div>
                        </div>
                    )}

                    {/* Cook Mode Toggle */}
                    <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10">
                        <h3 className="text-xl font-bold text-slate-900">Ingredients</h3>
                        <button
                            onClick={() => setCookMode(!cookMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${cookMode ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {cookMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            {cookMode ? 'Exit Cook Mode' : 'Cook Mode'}
                        </button>
                    </div>

                    {/* Ingredients List */}
                    <div className="space-y-3 mb-10">
                        {meal.ingredients.map((ing, i) => (
                            <button
                                key={i}
                                onClick={() => toggleIngredient(ing)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${checkedIngredients.has(ing) ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${checkedIngredients.has(ing) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                                    {checkedIngredients.has(ing) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                </div>
                                <span className={`font-medium ${checkedIngredients.has(ing) ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>{ing}</span>
                            </button>
                        ))}
                    </div>

                    {/* Instructions */}
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Instructions</h3>
                    <div className="space-y-6 relative">
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                        {meal.instructions.map((step, i) => (
                            <div key={i} className="flex gap-6 relative">
                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0 z-10 shadow-lg shadow-slate-900/20">
                                    {i + 1}
                                </div>
                                <div className={`pt-1 ${cookMode ? 'text-xl leading-relaxed' : 'text-base text-slate-600'}`}>
                                    {step}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Action Button (Start Cooking / Timer - Future) */}
            {!cookMode && (
                <div className="absolute bottom-8 left-0 right-0 px-8 pointer-events-none">
                    <button onClick={() => setCookMode(true)} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/30 pointer-events-auto flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all">
                        <Play className="w-5 h-5 fill-current" /> Start Cooking
                    </button>
                </div>
            )}
        </div>
    );
}

import React from 'react';
import { Flame, Droplets, Footprints, ChevronRight, Plus, BarChart2 } from 'lucide-react';
import { UserProfile, DailyProgress, Screen } from '../types';
import { health } from '../services/health';

interface DashboardProps {
    profile: UserProfile;
    progress: DailyProgress;
    onNavigate: (s: Screen) => void;
    onAddWater: (amount: number) => void;
}

export default function Dashboard({ profile, progress, onNavigate, onAddWater }: DashboardProps) {
    const caloriesRemaining = profile.goals.dailyCalories - progress.caloriesConsumed;
    const progressPercent = Math.min(100, (progress.caloriesConsumed / profile.goals.dailyCalories) * 100);

    const [healthData, setHealthData] = React.useState({ steps: progress.steps, caloriesBurned: progress.caloriesBurned });

    React.useEffect(() => {
        health.getDailyProgress().then(data => {
            if (data) {
                setHealthData(prev => ({ ...prev, steps: data.steps, caloriesBurned: data.caloriesBurned }));
            }
        });
    }, []);


    return (
        <div className="space-y-6 animate-slide-up">
            {/* Greeting */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hello, {profile.name.split(' ')[0]}</h1>
                    <p className="text-slate-500 font-medium">Let's hit your goals today.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button onClick={() => onNavigate(Screen.STATS)} className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm">
                        <BarChart2 className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt="Avatar" />
                    </div>
                </div>
            </div>

            {/* Main Calorie Card */}
            <div className="card-premium p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Calories</p>
                        <h2 className="text-4xl font-black text-slate-900 mt-1">{caloriesRemaining}</h2>
                        <p className="text-sm font-medium text-slate-500">remaining</p>
                    </div>
                    <div className="w-16 h-16 relative">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                            <circle cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="6" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progressPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-emerald-500 fill-emerald-500" />
                        </div>
                    </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-emerald-50 rounded-2xl p-3">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Protein</p>
                        <p className="text-lg font-bold text-emerald-900">{progress.macros.protein}g</p>
                        <div className="w-full h-1 bg-emerald-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-3">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Carbs</p>
                        <p className="text-lg font-bold text-blue-900">{progress.macros.carbs}g</p>
                        <div className="w-full h-1 bg-blue-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-3">
                        <p className="text-[10px] font-bold text-amber-600 uppercase">Fats</p>
                        <p className="text-lg font-bold text-amber-900">{progress.macros.fats}g</p>
                        <div className="w-full h-1 bg-amber-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Water & Steps Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="card-premium p-5 flex flex-col justify-between group cursor-pointer" onClick={() => onAddWater(250)}>
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Droplets className="w-5 h-5 fill-blue-600" />
                        </div>
                        <button className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors">
                            <Plus className="w-3 h-3" strokeWidth={3} />
                        </button>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-black text-slate-900">{progress.waterMl}<span className="text-sm text-slate-400 font-bold ml-1">ml</span></h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Water</p>
                    </div>
                </div>

                <div className="card-premium p-5 flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <Footprints className="w-5 h-5 fill-orange-600" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-black text-slate-900">{healthData.steps}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Steps</p>
                    </div>
                </div>
            </div>

            {/* Meal Plan Preview */}
            <div className="card-premium p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 text-lg">Next Meal</h3>
                    <button onClick={() => onNavigate(Screen.PLAN)} className="text-emerald-600 text-xs font-bold uppercase tracking-wide flex items-center gap-1 hover:underline">
                        View All <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex gap-4 items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80" className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="Salad" />
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Lunch • 1:00 PM</p>
                        <h4 className="font-bold text-slate-900 leading-tight">Quinoa & Avocado Salad</h4>
                        <p className="text-xs font-medium text-slate-500 mt-1">450 kcal • 25g Protein</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

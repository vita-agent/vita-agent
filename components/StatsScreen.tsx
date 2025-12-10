import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { ArrowUpRight, TrendingUp, Calendar, Activity } from 'lucide-react';
import { UserProfile, DailyProgress } from '../types';

interface StatsScreenProps {
    profile: UserProfile;
    currentProgress: DailyProgress;
}

// Mock Data for Charts
const weightData = [
    { date: 'Mon', weight: 78.5 },
    { date: 'Tue', weight: 78.2 },
    { date: 'Wed', weight: 78.0 },
    { date: 'Thu', weight: 77.8 },
    { date: 'Fri', weight: 77.5 },
    { date: 'Sat', weight: 77.4 },
    { date: 'Sun', weight: 77.2 },
];

const calorieData = [
    { day: 'M', calories: 2100 },
    { day: 'T', calories: 1950 },
    { day: 'W', calories: 2050 },
    { day: 'T', calories: 1800 },
    { day: 'F', calories: 2200 },
    { day: 'S', calories: 1900 },
    { day: 'S', calories: 2000 },
];

export default function StatsScreen({ profile, currentProgress }: StatsScreenProps) {
    const macroData = [
        { name: 'Protein', value: currentProgress.macros.protein, color: '#10b981' },
        { name: 'Carbs', value: currentProgress.macros.carbs, color: '#3b82f6' },
        { name: 'Fats', value: currentProgress.macros.fats, color: '#f59e0b' },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-32">
            <div className="flex justify-between items-center pt-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Insights</h2>
                    <p className="text-slate-500 font-medium text-sm">Your progress this week.</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                </div>
            </div>

            {/* AI Insight Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                        <Activity className="w-4 h-4" /> Weekly Analysis
                    </div>
                    <p className="text-lg font-medium leading-relaxed opacity-90">
                        "You're consistently hitting your calorie goals! Your protein intake is up <span className="text-emerald-400 font-bold">12%</span> from last week. Keep focusing on hydration to maximize recovery."
                    </p>
                </div>
            </div>

            {/* Weight Trend Chart */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 text-lg">Weight Trend</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> -1.3kg
                    </span>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weightData}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Calorie Consistency */}
                <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-sm mb-4">Calorie Consistency</h3>
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={calorieData}>
                                <Bar dataKey="calories" radius={[4, 4, 4, 4]}>
                                    {calorieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.calories > 2100 ? '#f87171' : '#cbd5e1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Macro Distribution */}
                <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-900 text-sm mb-2 w-full text-left">Today's Macros</h3>
                    <div className="h-32 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={macroData}
                                    innerRadius={35}
                                    outerRadius={50}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {macroData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-slate-400">Ratio</span>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full justify-center mt-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

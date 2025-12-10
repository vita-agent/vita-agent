import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { MOCK_PROFILE } from '../constants';

interface OnboardingProps {
    onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else onComplete(profile);
    };

    return (
        <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="mb-12">
                    <div className="flex gap-2 mb-4">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        ))}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        {step === 0 && "Let's get to know you."}
                        {step === 1 && "What's your goal?"}
                        {step === 2 && "Any dietary preferences?"}
                        {step === 3 && "You're all set!"}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {step === 0 && "We need some basics to calculate your needs."}
                        {step === 1 && "We'll tailor your meal plans to this."}
                        {step === 2 && "We'll filter recipes based on this."}
                        {step === 3 && "Your personalized plan is ready."}
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[300px] flex flex-col">
                    {step === 0 && (
                        <div className="space-y-4 animate-fade-in">
                            <input type="text" placeholder="Name" className="input-field" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                            <div className="flex gap-4">
                                <input type="number" placeholder="Age" className="input-field" value={profile.age} onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) })} />
                                <select className="input-field" value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value as any })}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <input type="number" placeholder="Height (cm)" className="input-field" value={profile.height} onChange={e => setProfile({ ...profile, height: parseInt(e.target.value) })} />
                                <input type="number" placeholder="Weight (kg)" className="input-field" value={profile.weight} onChange={e => setProfile({ ...profile, weight: parseInt(e.target.value) })} />
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-3 animate-slide-up">
                            {['Lose Weight', 'Maintain', 'Gain Muscle'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => setProfile({ ...profile, goals: [g] })}
                                    className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${profile.goals.includes(g) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-3 animate-slide-up">
                            {['None', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setProfile({ ...profile, dietaryRestrictions: [d === 'None' ? '' : d] })}
                                    className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${profile.dietaryRestrictions.includes(d === 'None' ? '' : d) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-scale-in">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                                <Check className="w-12 h-12 text-emerald-600" strokeWidth={3} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Ready to start?</h3>
                        </div>
                    )}

                    <div className="mt-auto pt-8">
                        <button onClick={handleNext} className="btn-primary w-full">
                            {step === 3 ? "Let's Go" : "Continue"} <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

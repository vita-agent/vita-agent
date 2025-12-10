import React from 'react';
import { Check, Star, Shield, Zap, X } from 'lucide-react';

interface SubscriptionModalProps {
    onClose: () => void;
    onSubscribe: () => void;
}

export default function SubscriptionModal({ onClose, onSubscribe }: SubscriptionModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-scale-in">
                {/* Hero Header */}
                <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 to-transparent"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl"></div>

                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white/60 hover:bg-white/20 transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Star className="w-8 h-8 text-white fill-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Unlock Vita+</h2>
                    <p className="text-slate-400 font-medium">Supercharge your health journey.</p>
                </div>

                {/* Features List */}
                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <FeatureRow text="Unlimited AI Coaching" />
                        <FeatureRow text="Advanced Health Analytics" />
                        <FeatureRow text="Personalized Meal Plans" />
                        <FeatureRow text="Priority Support" />
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center relative group cursor-pointer hover:border-emerald-500 transition-colors" onClick={onSubscribe}>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                            Most Popular
                        </div>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-wide mb-1">Annual Plan</p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-black text-slate-900">$4.99</span>
                            <span className="text-slate-400 font-medium">/ month</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Billed as $59.88 yearly</p>
                    </div>

                    <button
                        onClick={onSubscribe}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all hover:bg-slate-800 flex items-center justify-center gap-2"
                    >
                        <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        Start 7-Day Free Trial
                    </button>

                    <p className="text-center text-xs text-slate-400 font-medium">
                        Cancel anytime. Secure payment via App Store.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FeatureRow({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
            </div>
            <span className="text-slate-700 font-bold text-sm">{text}</span>
        </div>
    );
}

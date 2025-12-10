import React from 'react';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SafetyDisclaimerProps {
    onAccept: () => void;
}

export default function SafetyDisclaimer({ onAccept }: SafetyDisclaimerProps) {
    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col p-8 animate-fade-in">
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-8 animate-pulse-slow">
                    <Shield className="w-12 h-12 text-amber-500" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Safety First</h1>
                <p className="text-slate-500 font-medium text-lg mb-8 leading-relaxed">
                    Before we begin, please review these important safety guidelines. Your health is our top priority.
                </p>

                <div className="bg-slate-50 rounded-3xl p-6 text-left space-y-4 border border-slate-100 w-full">
                    <DisclaimerItem
                        icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                        title="Not Medical Advice"
                        text="Vita provides information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment."
                    />
                    <DisclaimerItem
                        icon={<Shield className="w-5 h-5 text-emerald-500" />}
                        title="Consult a Professional"
                        text="Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."
                    />
                </div>
            </div>

            <div className="mt-8 max-w-lg mx-auto w-full">
                <button
                    onClick={onAccept}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all hover:bg-slate-800 flex items-center justify-center gap-3"
                >
                    <CheckCircle2 className="w-6 h-6" />
                    I Understand & Accept
                </button>
            </div>
        </div>
    );
}

function DisclaimerItem({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
    return (
        <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">{icon}</div>
            <div>
                <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
            </div>
        </div>
    );
}


import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, User, Droplets } from 'lucide-react';

export default function ProfileEditor({ profile, onSave }: { profile: UserProfile, onSave: (p: UserProfile) => void }) {
  const [formData, setFormData] = useState<UserProfile>(profile);

  return (
    <div className="animate-fade-in pb-24">
      <div className="flex items-center gap-4 mb-8">
         <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
             <img src={formData.avatarUrl} className="w-full h-full object-cover" />
         </div>
         <div>
             <h2 className="text-2xl font-bold text-slate-900">{formData.name}</h2>
             <p className="text-slate-500 text-sm">Edit Preferences</p>
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">Biometrics</h3>
          <div className="grid grid-cols-2 gap-4">
             <div>
                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Weight (kg)</label>
                 <input type="number" value={formData.biometrics.weight} onChange={e => setFormData({...formData, biometrics: {...formData.biometrics, weight: parseFloat(e.target.value)}})} className="w-full bg-slate-50 p-4 rounded-xl mt-1 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20" />
             </div>
             <div>
                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Height (cm)</label>
                 <input type="number" value={formData.biometrics.height} onChange={e => setFormData({...formData, biometrics: {...formData.biometrics, height: parseFloat(e.target.value)}})} className="w-full bg-slate-50 p-4 rounded-xl mt-1 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20" />
             </div>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-2 pt-2">Goals</h3>
          <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Primary Goal</label>
              <select value={formData.goals.primary} onChange={e => setFormData({...formData, goals: {...formData.goals, primary: e.target.value as any}})} className="w-full bg-slate-50 p-4 rounded-xl mt-1 font-bold text-slate-900 outline-none cursor-pointer">
                  <option>Weight Loss</option><option>Maintenance</option><option>Muscle Gain</option>
              </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Calorie Target</label>
                <input type="number" value={formData.goals.dailyCalories} onChange={e => setFormData({...formData, goals: {...formData.goals, dailyCalories: parseInt(e.target.value)}})} className="w-full bg-slate-50 p-4 rounded-xl mt-1 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Droplets className="w-3 h-3" /> Water Goal (ml)</label>
                <input type="number" value={formData.goals.dailyWater} onChange={e => setFormData({...formData, goals: {...formData.goals, dailyWater: parseInt(e.target.value)}})} className="w-full bg-slate-50 p-4 rounded-xl mt-1 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-600" />
            </div>
          </div>

          <button onClick={() => onSave(formData)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-4">
              <Save className="w-5 h-5" /> Save Profile
          </button>
      </div>
    </div>
  );
}

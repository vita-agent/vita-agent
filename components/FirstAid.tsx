
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HeartPulse } from 'lucide-react';
import { FIRST_AID_DATA } from '../constants';

export default function FirstAid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const filteredTips = FIRST_AID_DATA.filter(tip => tip.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in pb-24">
       <div className="bg-red-500 rounded-3xl p-6 text-white shadow-xl shadow-red-500/20">
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold">First Aid</h2>
                <p className="text-red-100 text-sm">Offline Emergency Library</p>
             </div>
             <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><HeartPulse className="w-6 h-6 text-white" /></div>
          </div>
          <div className="mt-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search (e.g. CPR, Burns)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-red-200 focus:outline-none focus:bg-white/20 transition-colors"
              />
          </div>
       </div>

       <div className="space-y-3">
          {filteredTips.map(tip => (
             <div key={tip.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <button onClick={() => setExpandedId(expandedId === tip.id ? null : tip.id)} className="w-full flex justify-between items-center p-5 text-left">
                    <span className="font-bold text-slate-800">{tip.title}</span>
                    {expandedId === tip.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </button>
                {expandedId === tip.id && (
                    <div className="px-5 pb-5 pt-0 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {tip.content}
                    </div>
                )}
             </div>
          ))}
       </div>
    </div>
  );
}

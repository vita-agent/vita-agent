
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, Loader2, X, Volume2, Sparkles, Activity } from 'lucide-react';
import { GeminiService, LiveClient } from '../services/geminiService';
import { ChatMessage } from '../types';

const gemini = new GeminiService();
const liveClient = new LiveClient();

import { UserProfile, DailyProgress } from '../types';

interface ChatAssistantProps {
  profile?: UserProfile | null;
  progress?: DailyProgress | null;
}

export default function ChatAssistant({ profile, progress }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', content: `Hello ${profile?.name.split(' ')[0] || ''}! I'm ready to help you reach your goal of ${profile?.goals.primary.toLowerCase() || 'better health'}. What's on your mind?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveStatus, setLiveStatus] = useState('Disconnected');
  const [volume, setVolume] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLiveMode && liveStatus === 'Active' && volume === 0) {
      const interval = setInterval(() => setVolume(Math.random() * 0.3), 150);
      return () => clearInterval(interval);
    }
  }, [isLiveMode, liveStatus, volume]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    return () => { liveClient.disconnect(); }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));

      let systemPrompt = "You are Vita, an elite nutrition coach. Your tone is empathetic, professional, and data-driven. Keep responses concise for mobile reading. Use emojis sparingly but effectively.";
      if (profile) {
        systemPrompt += `\n\nUser Profile:\nName: ${profile.name}\nGoal: ${profile.goals.primary}\nDiet: ${profile.preferences.dietaryType}\nAllergies: ${profile.preferences.allergies.join(', ')}`;
      }
      if (progress) {
        systemPrompt += `\n\nToday's Progress:\nCalories: ${progress.caloriesConsumed} / ${profile?.goals.dailyCalories}\nWater: ${progress.waterMl}ml`;
      }

      const responseText = await gemini.chat(input, history, systemPrompt);
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', content: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLiveMode = async () => {
    if (isLiveMode) {
      await liveClient.disconnect();
      setIsLiveMode(false);
      setLiveStatus('Disconnected');
      setVolume(0);
    } else {
      setIsLiveMode(true);
      try {
        await liveClient.connect(
          (text) => console.log("Live:", text),
          (status) => setLiveStatus(status),
          (vol) => setVolume(vol)
        );
      } catch (e) {
        // UI already handles error display via liveStatus
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">

      {/* 3D VOICE OVERLAY */}
      {isLiveMode && (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 animate-fade-in">
          {/* Background ambience */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 to-slate-950 pointer-events-none"></div>

          <div className="absolute top-6 right-6 z-10">
            <button onClick={toggleLiveMode} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all active:scale-90">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="orb-container w-72 h-72 relative flex items-center justify-center mb-16">
            {/* Waveform Visualization (Simulated) */}
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-40">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-2 bg-emerald-500 rounded-full transition-all duration-100 ease-linear"
                  style={{
                    height: `${20 + volume * 200 * Math.random()}px`,
                    opacity: Math.max(0.2, volume * 2)
                  }}
                ></div>
              ))}
            </div>

            {/* Core Orb with dynamic pulse */}
            <div className="orb-core w-32 h-32 rounded-full absolute z-10 transition-all duration-75 ease-out blur-[2px]"
              style={{
                transform: `scale(${1 + volume * 0.8})`,
                boxShadow: `0 0 ${40 + volume * 80}px rgba(16, 185, 129, ${0.6 + volume})`
              }}></div>

            {/* Rotating Rings */}
            <div className="orb-ring w-48 h-48 animate-spin-slow opacity-60" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}></div>
            <div className="orb-ring w-60 h-60 animate-spin-slow opacity-30" style={{ animationDirection: 'reverse', borderLeftColor: 'transparent', animationDuration: '8s' }}></div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight font-sans">Vita Live</h2>
          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
            <div className={`w-2 h-2 rounded-full ${liveStatus === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
            <p className={`${liveStatus === 'Active' ? 'text-emerald-400' : 'text-red-400'} text-xs font-bold uppercase tracking-widest`}>{liveStatus}</p>
          </div>

          <div className="mt-16 flex gap-12">
            <div className={`text-sm flex flex-col items-center gap-3 transition-all duration-500 ${volume > 0.1 ? 'text-slate-600 scale-90' : 'text-emerald-400 scale-110'}`}>
              <div className="p-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"><Mic className="w-6 h-6" /></div>
              <span className="uppercase tracking-wider font-bold text-[10px]">Listening</span>
            </div>
          </div>
        </div>
      )}

      {/* Standard Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Vita</h3>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <button onClick={toggleLiveMode} className="bg-slate-900 text-white pl-3 pr-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-transform hover:bg-slate-800">
          <Mic className="w-3.5 h-3.5" /> Voice Mode
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 scroll-smooth pb-32">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user' ? 'bg-white border border-slate-100' : 'bg-emerald-600 text-white'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                ? 'bg-white text-slate-800 rounded-tr-none border border-slate-200/60'
                : 'bg-emerald-600 text-white rounded-tl-none shadow-emerald-500/20'
                }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 pb-safe absolute bottom-0 left-0 right-0">
        <div className="flex gap-3 relative bg-slate-50 p-1 rounded-[1.5rem] border border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:ring-0 outline-none placeholder:text-slate-400 text-slate-900 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-500 text-white p-3 rounded-2xl shadow-md shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 disabled:shadow-none transition-all active:scale-90"
          >
            <Send className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

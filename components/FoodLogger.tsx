
import React, { useState, useRef } from 'react';
import { Camera as LucideCamera, Search, X, Check, ChevronRight, Scan } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { GeminiService } from '../services/geminiService';
import { FoodItem } from '../types';
import { getSmartImage } from '../constants';

interface FoodLoggerProps {
  onClose: () => void;
  onLog: (items: FoodItem[]) => void;
}

const gemini = new GeminiService();

export default function FoodLogger({ onClose, onLog }: FoodLoggerProps) {
  const [step, setStep] = useState<'input' | 'analysis' | 'confirm' | 'success'>('input');
  const [textInput, setTextInput] = useState('');
  const [scannedItems, setScannedItems] = useState<FoodItem[]>([]);


  const handleAnalyze = async (input: string | File) => {
    setStep('analysis');
    try {
      let result: FoodItem[] = [];
      if (typeof input === 'string') {
        result = await gemini.analyzeFood(input);
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(input);
        await new Promise(resolve => reader.onload = resolve);
        const base64 = (reader.result as string).split(',')[1];
        result = await gemini.analyzeFood({ base64, mimeType: input.type });
      }
      processResult(result);
    } catch (e) {
      setStep('input');
      alert("Analysis failed. Please try again.");
    }
  };

  const processResult = (result: FoodItem[]) => {
    const enrichedResult = result.map(item => ({
      ...item,
      imageUrl: getSmartImage(item.name)
    }));
    setScannedItems(enrichedResult);
    setStep('confirm');
  };

  const handleCameraCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (image.base64String) {
        setStep('analysis');
        try {
          const result = await gemini.analyzeFood({
            base64: image.base64String,
            mimeType: `image/${image.format}`
          });
          processResult(result);
        } catch (e) {
          setStep('input');
          alert("Analysis failed. Please try again.");
        }
      }
    } catch (e) {
      console.log('Camera cancelled or failed', e);
    }
  };

  const finalizeLog = () => {
    setStep('success');
    onLog(scannedItems);
    setTimeout(onClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-fade-in" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-white w-full h-[92vh] rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col animate-slide-up z-50">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Log Food</h2>
            <p className="text-slate-500 text-sm font-medium">Capture nutrition instantly.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-12 no-scrollbar">
          {step === 'input' && (
            <div className="space-y-8 animate-fade-in">
              {/* Text Input */}
              <div className="relative group mt-4">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-14 pr-14 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-lg"
                  placeholder="e.g. 2 Eggs & Toast"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(textInput)}
                  autoFocus
                />
                {textInput && (
                  <button onClick={() => handleAnalyze(textInput)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-transform active:scale-90">
                    <ChevronRight className="w-5 h-5" strokeWidth={3} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 text-slate-300 text-xs font-bold uppercase tracking-widest before:h-px before:flex-1 before:bg-slate-100 after:h-px after:flex-1 after:bg-slate-100">
                OR SCAN
              </div>

              {/* Camera Button */}
              <button
                onClick={handleCameraCapture}
                className="w-full aspect-[4/3] bg-slate-900 rounded-[2.5rem] relative overflow-hidden group flex flex-col items-center justify-center text-white shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all hover:shadow-slate-900/40"
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>

                {/* Scanner Effect */}
                <div className="absolute w-full h-1 bg-emerald-400/80 top-0 left-0 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>

                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-colors duration-500">
                    <LucideCamera className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold tracking-tight">Camera Scan</h3>
                    <p className="text-slate-300 text-sm mt-1 font-medium">AI Object Detection</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 'analysis' && (
            <div className="h-full flex flex-col items-center justify-center text-center pb-20 animate-fade-in">
              <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                <Scan className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Analyzing...</h3>
              <p className="text-slate-500 max-w-xs text-lg">Identifying ingredients and calculating macros.</p>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6 animate-slide-up">
              {scannedItems.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-4 flex gap-5 shadow-sm items-center">
                  <img src={item.imageUrl} className="w-24 h-24 rounded-2xl object-cover bg-slate-100 shadow-sm" alt={item.name} />
                  <div className="flex-1 py-1">
                    <h4 className="font-bold text-slate-900 text-xl leading-tight">{item.name}</h4>
                    <p className="text-slate-500 text-sm font-medium mt-1">{item.calories} kcal • {item.servingSize}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg uppercase">P: {item.protein}g</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg uppercase">C: {item.carbs}g</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg uppercase">F: {item.fats}g</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="fixed bottom-8 left-0 right-0 px-8">
                <button
                  onClick={finalizeLog}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-xl shadow-xl shadow-slate-900/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
                >
                  <Check className="w-7 h-7" strokeWidth={3} /> Add to Diary
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center pb-20 animate-fade-in">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/40 animate-bounce">
                <Check className="w-12 h-12 text-white" strokeWidth={4} />
              </div>
              <h3 className="text-3xl font-black text-slate-900">Success!</h3>
              <p className="text-slate-500 mt-2 font-medium">Your nutrition has been updated.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

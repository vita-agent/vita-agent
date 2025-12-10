
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Shield, File, X, Loader2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { MedicalRecord } from '../types';

const gemini = new GeminiService();

export default function HealthRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset states
    setError(null);
    setIsAnalyzing(true);
    
    // File validation
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        setError("Please upload a JPG, PNG, or PDF file.");
        setIsAnalyzing(false);
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const summary = await gemini.analyzeMedicalReport(base64, file.type);
        
        const newRecord: MedicalRecord = {
            id: Date.now().toString(),
            fileName: file.name,
            dateUploaded: new Date().toISOString().split('T')[0],
            summary,
            tags: ['Report', 'Analyzed']
        };
        
        setRecords(prev => [newRecord, ...prev]);
      } catch (err) { 
          console.error(err);
          setError("Analysis failed. Please try again."); 
      } finally { 
          setIsAnalyzing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
        setError("Error reading file.");
        setIsAnalyzing(false);
    };
  };

  const removeRecord = (id: string) => {
      setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-32">
        {/* Header Section */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
             <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                     <div>
                        <h2 className="text-3xl font-black tracking-tight">Medical Records</h2>
                        <p className="text-slate-400 font-medium">AI Analysis & Storage</p>
                     </div>
                     <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <Shield className="w-6 h-6 text-emerald-400" />
                     </div>
                 </div>
                 
                 <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">
                    Securely upload lab reports or prescriptions. Our AI extracts key vitals and summarizes doctor notes instantly.
                 </p>

                 <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isAnalyzing} 
                    className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-80"
                 >
                     {isAnalyzing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                            <span className="text-emerald-700">Analyzing...</span>
                        </>
                     ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            Upload Document
                        </>
                     )}
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg,image/png,application/pdf" 
                    onChange={handleFileUpload} 
                 />
                 
                 {error && (
                     <div className="mt-4 flex items-center gap-2 text-red-300 text-sm font-bold bg-red-900/30 p-3 rounded-xl border border-red-500/30">
                         <AlertCircle className="w-4 h-4" /> {error}
                     </div>
                 )}
             </div>
             
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-12 -mt-12 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px] -ml-12 -mb-12 pointer-events-none"></div>
        </div>

        {/* Records List */}
        <div className="space-y-4">
            {records.length === 0 && !isAnalyzing && (
                <div className="text-center py-12 text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                        <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium text-lg text-slate-600">No records yet</p>
                    <p className="text-sm">Upload a blood test or prescription to get started.</p>
                </div>
            )}

            {records.map(r => (
                <div key={r.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow animate-slide-up">
                    <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                                {r.fileName.endsWith('.pdf') ? <File className="w-6 h-6 text-blue-600" /> : <FileText className="w-6 h-6 text-blue-600" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{r.fileName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{r.dateUploaded}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Analyzed
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => removeRecord(r.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="bg-slate-50/80 rounded-2xl p-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Shield className="w-3 h-3" /> AI Summary
                        </h5>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            {r.summary}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Chrome } from 'lucide-react';
import { UserProfile } from '../types';
import { MOCK_PROFILE } from '../constants';

interface AuthScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin({ ...MOCK_PROFILE, name: email.split('@')[0] || 'User' });
    }, 1500);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden flex items-center justify-center bg-slate-50">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-400/20 blur-[100px] animate-float"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="glass p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
              <span className="text-3xl font-black text-white">V</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vita</h1>
            <p className="text-slate-500 font-medium mt-2">Your elite nutrition coach.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="input-field pl-12"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="input-field pl-12"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400 font-medium">Or continue with</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-2 font-bold text-slate-700">
                <Chrome className="w-5 h-5 text-slate-900" /> Google
              </button>
              <button className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-2 font-bold text-slate-700">
                <User className="w-5 h-5 text-slate-900" /> Guest
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

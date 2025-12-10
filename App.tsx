import React, { useState, useEffect } from 'react';
import { LayoutGrid, Utensils, MessageCircle, CalendarDays, Plus, CheckCircle2, AlertCircle, Info, Droplets, Camera, Bell, User as UserIcon, Settings } from 'lucide-react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { Screen, UserProfile, DailyProgress, FoodItem, ToastNotification } from './types';
import { storage } from './services/storage';

// Screens
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import FoodLogger from './components/FoodLogger';
import ChatAssistant from './components/ChatAssistant';
import MealPlanner from './components/MealPlanner';
import Reminders from './components/Reminders';
import StatsScreen from './components/StatsScreen';
import ProfileEditor from './components/ProfileEditor';
import SubscriptionModal from './components/SubscriptionModal';
import SafetyDisclaimer from './components/SafetyDisclaimer';

export default function App() {
  const [activeTab, setActiveTab] = useState<Screen>(Screen.AUTH);
  const [showLogger, setShowLogger] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);

  // Phase 4 States
  const [isPremium, setIsPremium] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [safetyAccepted, setSafetyAccepted] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setStyle({ style: Style.Dark });
        await SplashScreen.hide();
      }

      const savedProfile = await storage.getUserProfile();
      const savedProgress = await storage.getDailyProgress();
      const isSafetyAccepted = localStorage.getItem('vitality_safety_accepted') === 'true';
      const isPremiumUser = localStorage.getItem('vitality_premium') === 'true';

      if (savedProfile) {
        setProfile(savedProfile);
        setDailyProgress(savedProgress || {
          date: new Date().toISOString().split('T')[0],
          caloriesConsumed: 0,
          waterMl: 0,
          steps: 0,
          caloriesBurned: 0,
          meals: [],
          macros: { protein: 0, carbs: 0, fats: 0 }
        });
        setActiveTab(Screen.DASHBOARD);
      }

      setSafetyAccepted(isSafetyAccepted);
      setIsPremium(isPremiumUser);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (profile) storage.saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (dailyProgress) storage.saveDailyProgress(dailyProgress);
  }, [dailyProgress]);

  const handleSafetyAccept = () => {
    localStorage.setItem('vitality_safety_accepted', 'true');
    setSafetyAccepted(true);
  };

  const handleSubscribe = () => {
    // Mock Payment Processing
    setTimeout(() => {
      localStorage.setItem('vitality_premium', 'true');
      setIsPremium(true);
      setShowSubscription(false);
      addToast('Welcome to Vita+!', 'success');
    }, 1500);
  };

  const checkPremiumFeature = (action: () => void) => {
    if (isPremium) {
      action();
    } else {
      setShowSubscription(true);
    }
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  if (loading) return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!safetyAccepted) {
    return <SafetyDisclaimer onAccept={handleSafetyAccept} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 relative overflow-hidden selection:bg-emerald-500/30">

      {/* Modals */}
      {showSubscription && <SubscriptionModal onClose={() => setShowSubscription(false)} onSubscribe={handleSubscribe} />}

      {/* Toast Container */}
      <div className="fixed top-safe left-0 right-0 z-[110] p-4 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`mx-auto bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-slide-up pointer-events-auto ${toast.type === 'error' ? 'bg-red-500' : ''}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Info className="w-5 h-5" />}
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        ))}
      </div>

      {activeTab === Screen.AUTH && <AuthScreen onLogin={(p) => {
        setProfile(p);
        setActiveTab(Screen.DASHBOARD);
        storage.saveUserProfile(p);
      }} />}

      {
        activeTab === Screen.ONBOARDING && <Onboarding onComplete={(p) => {
          setProfile(p);
          setActiveTab(Screen.DASHBOARD);
          storage.saveUserProfile(p);
          addToast('Profile Setup Complete!', 'success');
        }} />
      }

      {/* Main App Content */}
      {profile && activeTab !== Screen.AUTH && activeTab !== Screen.ONBOARDING && (
        <div className="max-w-md mx-auto min-h-screen relative">
          {/* Header */}
          <div className="pt-safe-top px-6 pb-4 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100/50">
            <div className="flex items-center gap-3" onClick={() => setActiveTab(Screen.PROFILE)}>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt="Profile" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{profile.name}</h3>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">{isPremium ? 'Vita+' : 'Free Plan'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogger(true)}
              className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg shadow-slate-900/20 active:scale-90 transition-transform"
            >
              <Plus className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>

          <div className="p-6">
            {activeTab === Screen.DASHBOARD && dailyProgress && (
              <Dashboard
                profile={profile}
                progress={dailyProgress}
                onNavigate={(s) => {
                  if (s === Screen.STATS) {
                    checkPremiumFeature(() => setActiveTab(s));
                  } else {
                    setActiveTab(s);
                  }
                }}
                onAddWater={(amount) => {
                  const newProgress = { ...dailyProgress, waterMl: dailyProgress.waterMl + amount };
                  setDailyProgress(newProgress);
                  storage.saveDailyProgress(newProgress);
                }}
              />
            )}

            {activeTab === Screen.COACH && <ChatAssistant profile={profile} progress={dailyProgress} />}
            {activeTab === Screen.PLAN && profile && <MealPlanner profile={profile} />}
            {activeTab === Screen.STATS && profile && dailyProgress && <StatsScreen profile={profile} currentProgress={dailyProgress} />}
            {activeTab === Screen.REMINDERS && profile && <Reminders profile={profile} onUpdateProfile={setProfile} />}
            {activeTab === Screen.PROFILE && <ProfileEditor profile={profile} onSave={(p) => { setProfile(p); storage.saveUserProfile(p); addToast('Profile Saved', 'success'); }} />}
          </div>

          {/* Bottom Nav */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 pb-safe z-50">
            <div className="flex justify-around items-center p-2 max-w-md mx-auto">
              <NavButton icon={<LayoutGrid />} label="Home" active={activeTab === Screen.DASHBOARD} onClick={() => setActiveTab(Screen.DASHBOARD)} />
              <NavButton icon={<CalendarDays />} label="Plan" active={activeTab === Screen.PLAN} onClick={() => setActiveTab(Screen.PLAN)} />
              <NavButton icon={<MessageCircle />} label="Coach" active={activeTab === Screen.COACH} onClick={() => checkPremiumFeature(() => setActiveTab(Screen.COACH))} />
              <NavButton icon={<Bell />} label="Alerts" active={activeTab === Screen.REMINDERS} onClick={() => setActiveTab(Screen.REMINDERS)} />
            </div>
          </div>
        </div>
      )}

      {showLogger && (
        <FoodLogger
          onClose={() => setShowLogger(false)}
          onLog={(items) => {
            if (!dailyProgress) return;
            const newProgress = { ...dailyProgress };
            items.forEach(item => {
              newProgress.caloriesConsumed += item.calories;
              newProgress.macros.protein += item.protein;
              newProgress.macros.carbs += item.carbs;
              newProgress.macros.fats += item.fats;
              newProgress.meals.push({
                id: Date.now().toString(),
                name: item.name,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fats: item.fats,
                timestamp: Date.now()
              });
            });
            setDailyProgress(newProgress);
            storage.saveDailyProgress(newProgress);
            setShowLogger(false);
            addToast('Food Logged Successfully', 'success');
          }}
        />
      )}

    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${active ? 'text-emerald-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
      {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${active ? 'fill-current' : ''}`, strokeWidth: active ? 2.5 : 2 })}
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </button>
  );
}

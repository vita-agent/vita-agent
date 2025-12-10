
import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, List, Plus, Bell, Check, Pill, Clock, ChevronLeft, ChevronRight, X, Trash2, Droplets, Stethoscope, Download } from 'lucide-react';
import { Reminder, ReminderType, UserProfile } from '../types';
import { notifications } from '../services/notifications';

interface RemindersProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

export default function Reminders({ profile, onUpdateProfile }: RemindersProps) {
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const reminders = profile.reminders || [];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({ type: 'Medicine', date: selectedDate, time: '09:00', frequency: 'Daily' });

  const isReminderActive = (r: Reminder, targetDateStr: string) => {
    if (!r.frequency || r.frequency === 'Once') return r.date === targetDateStr;
    if (targetDateStr < r.date) return false;
    if (r.frequency === 'Daily') return true;
    if (r.frequency === 'Weekly') return new Date(targetDateStr).getUTCDay() === new Date(r.date).getUTCDay();
    return false;
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    return [...Array(firstDay).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];
  }, [currentDate]);

  const handleSyncCalendar = () => {
    if (reminders.length === 0) {
      alert("No reminders to sync.");
      return;
    }

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Vita//Health Coach//EN\n";

    reminders.forEach(r => {
      if (!r.date || !r.time) return;

      const cleanDate = r.date.replace(/-/g, '');
      const cleanTime = r.time.replace(/:/g, '');
      const dtStart = `${cleanDate}T${cleanTime}00`;

      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:${r.id}@vita.ai\n`;
      icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      icsContent += `DTSTART:${dtStart}\n`;
      icsContent += `DURATION:PT30M\n`;
      icsContent += `SUMMARY:Vita: ${r.title}\n`;
      icsContent += `DESCRIPTION:${r.type} - ${r.notes || ''} ${r.dosage ? '(' + r.dosage + ')' : ''}\n`;

      if (r.frequency && r.frequency !== 'Once') {
        if (r.frequency === 'Daily') icsContent += `RRULE:FREQ=DAILY\n`;
        if (r.frequency === 'Weekly') icsContent += `RRULE:FREQ=WEEKLY\n`;
      }

      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'vita_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ... inside Reminders component

  const handleAdd = async () => {
    if (!newReminder.title) return;
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      type: newReminder.type as ReminderType,
      date: newReminder.date || selectedDate,
      time: newReminder.time || '09:00',
      completed: false,
      dosage: newReminder.dosage,
      frequency: newReminder.frequency,
      location: newReminder.location,
      notes: newReminder.notes
    };

    // Schedule Native Notification
    await notifications.requestPermissions();
    await notifications.scheduleReminder(reminder);

    onUpdateProfile({ ...profile, reminders: [...reminders, reminder] });
    setShowAddModal(false);
  };

  const getTypeStyles = (type: ReminderType) => {
    switch (type) {
      case 'Medicine': return { icon: <Pill className="w-5 h-5" />, bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' };
      case 'Screening': return { icon: <Stethoscope className="w-5 h-5" />, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' };
      case 'Water': return { icon: <Droplets className="w-5 h-5" />, bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' };
      default: return { icon: <Bell className="w-5 h-5" />, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-100' };
    }
  };

  const visibleReminders = useMemo(() => {
    if (view === 'list') return [...reminders].sort((a, b) => a.time.localeCompare(b.time));
    return reminders.filter(r => isReminderActive(r, selectedDate)).sort((a, b) => a.time.localeCompare(b.time));
  }, [reminders, view, selectedDate]);

  return (
    <div className="space-y-6 animate-fade-in pb-32">
      <div className="flex justify-between items-center pt-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Schedule</h2>
          <p className="text-slate-500 font-medium text-sm">Manage your health tasks.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSyncCalendar} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-emerald-500 hover:text-white shadow-sm transition-all" title="Sync to Calendar">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={() => setShowAddModal(true)} className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"><Plus className="w-5 h-5" /></button>
          <div className="bg-slate-100 p-1 rounded-xl flex h-10 items-center">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}><List className="w-5 h-5" /></button>
            <button onClick={() => setView('calendar')} className={`p-1.5 rounded-lg transition-all ${view === 'calendar' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}><CalendarIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {view === 'calendar' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-slate-50 rounded-full"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
            <h3 className="font-bold text-lg text-slate-900">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-slate-50 rounded-full"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const hasReminder = reminders.some(r => isReminderActive(r, dateStr));
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div key={day} onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold cursor-pointer transition-all border ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/30' : 'bg-white border-slate-50 hover:border-emerald-200'} ${isToday && !isSelected ? 'text-emerald-600 border-emerald-200' : ''}`}
                >
                  {day}
                  {hasReminder && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`}></div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visibleReminders.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p>No reminders for this day.</p>
          </div>
        )}
        {visibleReminders.map(reminder => {
          const styles = getTypeStyles(reminder.type);
          return (
            <div key={reminder.id} className={`bg-white p-5 rounded-[1.5rem] border shadow-sm flex items-center gap-4 group transition-all ${reminder.completed ? 'opacity-60 border-slate-100' : 'border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}>
              <button
                onClick={() => onUpdateProfile({ ...profile, reminders: reminders.map(r => r.id === reminder.id ? { ...r, completed: !r.completed } : r) })}
                className={`w-7 h-7 rounded-full border-[2.5px] flex items-center justify-center transition-all ${reminder.completed ? 'bg-emerald-500 border-emerald-500 scale-105' : 'border-slate-200 hover:border-emerald-400'}`}
              >
                {reminder.completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </button>
              <div className={`p-3.5 rounded-2xl ${styles.bg} ${styles.text}`}>
                {styles.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-slate-900 text-lg truncate ${reminder.completed ? 'line-through text-slate-400' : ''}`}>{reminder.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {reminder.time}</span>
                  {reminder.frequency && <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">{reminder.frequency}</span>}
                </div>
              </div>
              <button onClick={() => onUpdateProfile({ ...profile, reminders: reminders.filter(r => r.id !== reminder.id) })} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2"><Trash2 className="w-5 h-5" /></button>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-slide-up relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>

            <h3 className="text-2xl font-black text-slate-900 mb-6">Add Event</h3>

            <div className="space-y-5">
              <div className="grid grid-cols-4 gap-2">
                {(['Medicine', 'Screening', 'Water', 'Custom'] as const).map(t => (
                  <button key={t} onClick={() => setNewReminder({ ...newReminder, type: t, title: '' })} className={`py-3 rounded-2xl text-[10px] font-bold transition-all uppercase tracking-wide ${newReminder.type === t ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-50 text-slate-500'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <input type="text" placeholder={newReminder.type === 'Water' ? "e.g. Drink Water" : "Title (e.g. Vitamin D)"} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-slate-900/10" value={newReminder.title || ''} onChange={e => setNewReminder({ ...newReminder, title: e.target.value })} autoFocus />
                {newReminder.type === 'Water' && (
                  <div className="flex gap-2">
                    <button onClick={() => setNewReminder({ ...newReminder, title: 'Drink Glass (250ml)' })} className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-bold border border-cyan-100">Glass</button>
                    <button onClick={() => setNewReminder({ ...newReminder, title: 'Refill Bottle (500ml)' })} className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-bold border border-cyan-100">Bottle</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Date</label>
                  <input type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium outline-none" value={newReminder.date} onChange={e => setNewReminder({ ...newReminder, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Time</label>
                  <input type="time" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium outline-none" value={newReminder.time} onChange={e => setNewReminder({ ...newReminder, time: e.target.value })} />
                </div>
              </div>

              {(newReminder.type === 'Medicine' || newReminder.type === 'Water') && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Recurrence</label>
                  <select value={newReminder.frequency} onChange={e => setNewReminder({ ...newReminder, frequency: e.target.value as any })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium outline-none appearance-none">
                    <option value="Once">Once</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              )}

              <button onClick={handleAdd} className="w-full py-4 bg-emerald-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/30 mt-4 hover:bg-emerald-600 active:scale-[0.98] transition-all">Save to Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

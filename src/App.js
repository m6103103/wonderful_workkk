import './index.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, MapPin, ChevronLeft, ChevronRight, X, Check, Settings, Moon, Sun, Eraser, Share2, Trash2, BarChart3 } from 'lucide-react';

const THEME_PALETTE = [
  { id: 'theme-1', color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]', lightColor: 'text-white', lightBorder: 'border-yellow-500', lightBg: 'bg-yellow-500' },
  { id: 'theme-2', color: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-400/10', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]', lightColor: 'text-white', lightBorder: 'border-cyan-500', lightBg: 'bg-cyan-500' },
  { id: 'theme-3', color: 'text-fuchsia-500', border: 'border-fuchsia-500', bg: 'bg-fuchsia-500/10', glow: 'shadow-[0_0_15px_rgba(217,70,239,0.3)]', lightColor: 'text-white', lightBorder: 'border-fuchsia-500', lightBg: 'bg-fuchsia-500' }
];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState({});
  const [step, setStep] = useState(4);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTheme, setActiveTheme] = useState(THEME_PALETTE[0]);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const monthStats = useMemo(() => {
    const stats = {};
    Object.keys(schedule).forEach(key => {
      const date = new Date(key);
      if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
        const item = schedule[key];
        stats[item.type] = (stats[item.type] || 0) + 1;
      }
    });
    return stats;
  }, [schedule, currentDate]);

  const renderMainApp = () => {
    const t = isDarkMode ? {
      bg: 'bg-slate-950',
      text: 'text-slate-100',
      textSub: 'text-slate-400',
      card: 'bg-slate-900/50',
      border: 'border-slate-800'
    } : {
      bg: 'bg-white',
      text: 'text-slate-900',
      textSub: 'text-slate-500',
      card: 'bg-slate-50',
      border: 'border-slate-200'
    };

    const days = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const blanks = Array(firstDay).fill(null);
    const monthDays = Array.from({ length: days }, (_, i) => i + 1);

    return (
      <div className={`flex flex-col h-full ${t.bg} ${t.text}`}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter italic">MY SHIFT</h1>
            <p className={t.textSub}>{currentDate.getFullYear()} / {currentDate.getMonth() + 1}月</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className={`p-2 rounded-full ${t.card}`}><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className={`p-2 rounded-full ${t.card}`}><ChevronRight size={20}/></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold opacity-50">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.concat(monthDays).map((day, i) => {
              if (!day) return <div key={`blank-${i}`} className="aspect-square"></div>;
              const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
              const shift = schedule[dateKey];
              
              return (
                <div 
                  key={day}
                  onClick={() => {
                    const types = ['早', '中', '晚', '休'];
                    const currentIdx = shift ? types.indexOf(shift.type) : -1;
                    const nextType = types[currentIdx + 1];
                    const newSched = { ...schedule };
                    if (nextType) {
                      newSched[dateKey] = { type: nextType };
                    } else {
                      delete newSched[dateKey];
                    }
                    setSchedule(newSched);
                  }}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                    shift ? `${activeTheme.bg} ${activeTheme.border} ${activeTheme.glow}` : t.border
                  }`}
                >
                  <span className="text-[10px] opacity-50">{day}</span>
                  {shift && <span className={`font-bold ${activeTheme.color}`}>{shift.type}</span>}
                </div>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className={`mt-6 p-4 rounded-3xl ${t.card} border ${t.border}`}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><BarChart3 size={16}/> 本月統計</h3>
            <div className="flex justify-around text-center">
              {['早', '中', '晚', '休'].map(type => (
                <div key={type}>
                  <p className="text-[10px] opacity-50">{type}班</p>
                  <p className="font-bold">{monthStats[type] || 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="p-4 border-t border-slate-800/30 flex items-center justify-between">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${t.card}`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className={`w-12 h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`}></div>
          <button onClick={() => setStep(3)} className={t.textSub}><Settings size={18} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-slate-50'} flex items-center justify-center p-4`}>
      <div className="w-full max-w-[420px] h-[780px] shadow-2xl overflow-hidden md:rounded-[3rem] border border-slate-800/50">
        {renderMainApp()}
      </div>
    </div>
  );
}
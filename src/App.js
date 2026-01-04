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
  const [step, setStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTheme, setActiveTheme] = useState(THEME_PALETTE[0]);

  // 工具函式
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const monthStats = useMemo(() => {
    const stats = {};
    Object.keys(schedule).forEach(key => {
      const d = new Date(key);
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        const item = schedule[key];
        stats[item.type] = (stats[item.type] || 0) + 1;
      }
    });
    return stats;
  }, [schedule, currentDate]);

  const renderOnboarding = () => {
    const t = isDarkMode ? { bg: 'bg-slate-900', text: 'text-white', sub: 'text-slate-400' } : { bg: 'bg-white', text: 'text-slate-900', sub: 'text-slate-500' };
    
    if (step === 1) return (
      <div className={`h-full flex flex-col items-center justify-center p-8 ${t.bg} ${t.text}`}>
        <div className={`p-4 rounded-3xl mb-8 ${activeTheme.bg} ${activeTheme.border} border-2 ${activeTheme.glow}`}>
          <Clock size={48} className={activeTheme.color} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter mb-4">MY SHIFT</h1>
        <p className={`text-center mb-12 font-medium opacity-60`}>最簡單、最漂亮的排班小助手</p>
        <button onClick={() => setStep(2)} className={`w-full py-5 rounded-2xl font-black text-black transition-all active:scale-95 bg-yellow-400`}>立即開始</button>
      </div>
    );

    if (step === 2) return (
      <div className={`h-full flex flex-col p-8 ${t.bg} ${t.text}`}>
        <h2 className="text-3xl font-black italic mb-2">SELECT THEME</h2>
        <p className="opacity-50 mb-12 font-bold">選擇一個屬於你的顏色</p>
        <div className="grid gap-6">
          {THEME_PALETTE.map(theme => (
            <button key={theme.id} onClick={() => setActiveTheme(theme)} className={`p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${activeTheme.id === theme.id ? theme.border + ' ' + theme.bg : 'border-transparent bg-slate-800/20'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${theme.lightBg}`}></div>
                <span className="font-black italic uppercase">{theme.id}</span>
              </div>
              {activeTheme.id === theme.id && <Check size={20} className={theme.color} />}
            </button>
          ))}
        </div>
        <button onClick={() => setStep(4)} className="mt-auto py-5 rounded-2xl font-black text-black bg-yellow-400">完成設定</button>
      </div>
    );
  };

  const renderMainApp = () => {
    const t = isDarkMode ? 
      { bg: 'bg-slate-950', text: 'text-slate-100', textSub: 'text-slate-400', card: 'bg-slate-900/50', border: 'border-slate-800' } : 
      { bg: 'bg-white', text: 'text-slate-900', textSub: 'text-slate-500', card: 'bg-slate-50', border: 'border-slate-200' };

    const days = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const blanks = Array(firstDay).fill(null);
    const monthDays = Array.from({ length: days }, (_, i) => i + 1);

    return (
      <div className={`flex flex-col h-full ${t.bg} ${t.text} transition-colors duration-700`}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter italic">MY SHIFT</h1>
            <p className={t.textSub + " font-bold"}>{currentDate.getFullYear()} / {currentDate.getMonth() + 1}月</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className={`p-2 rounded-full ${t.card}`}><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className={`p-2 rounded-full ${t.card}`}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-black opacity-30">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.concat(monthDays).map((day, i) => {
              if (day === null) return <div key={`b-${i}`} className="aspect-square"></div>;
              const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
              const shift = schedule[dateKey];
              return (
                <div key={day} onClick={() => {
                  const types = ['早', '中', '晚', '休'];
                  const cur = shift ? types.indexOf(shift.type) : -1;
                  const next = types[cur + 1];
                  const newSched = { ...schedule };
                  if (next) newSched[dateKey] = { type: next }; else delete newSched[dateKey];
                  setSchedule(newSched);
                }} className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${shift ? activeTheme.bg + ' ' + activeTheme.border + ' ' + activeTheme.glow : t.border}`}>
                  <span className="text-[10px] font-bold opacity-30">{day}</span>
                  {shift && <span className={`font-black ${activeTheme.color}`}>{shift.type}</span>}
                </div>
              );
            })}
          </div>

          <div className={`mt-6 p-5 rounded-[2.5rem] ${t.card} border-2 ${t.border} mb-6`}>
            <div className="flex items-center gap-2 mb-4 font-black italic opacity-50 text-xs"><BarChart3 size={14}/> STATISTICS</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {['早', '中', '晚', '休'].map(type => (
                <div key={type} className="p-2">
                  <p className="text-[10px] font-black opacity-40 mb-1">{type}</p>
                  <p className="text-xl font-black italic">{monthStats[type] || 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800/30 flex items-center justify-between opacity-60">
          <div className="flex gap-4">
            <button className={`${t.textSub} flex items-center gap-1 text-[10px] font-black italic`}><Share2 size={12}/> SHARE</button>
            <button onClick={() => { if(window.confirm('確定清空？')) setSchedule({}); }} className="text-red-500/70 flex items-center gap-1 text-[10px] font-black italic"><Trash2 size={12}/> CLEAR</button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${t.card}`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-slate-50'} flex items-center justify-center p-4 transition-colors duration-700`}>
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
      <div className="w-full max-w-[420px] h-[780px] shadow-2xl overflow-hidden md:rounded-[3.5rem] border-4 border-slate-800/20 relative">
        {step < 4 ? renderOnboarding() : renderMainApp()}
      </div>
    </div>
  );
}
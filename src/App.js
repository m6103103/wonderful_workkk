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
    const t = isDarkMode ? { bg: 'bg-slate-950', text: 'text-white' } : { bg: 'bg-white', text: 'text-slate-900' };
    
    if (step === 1) return (
      <div className={`h-full flex flex-col items-center justify-center p-8 ${t.bg} ${t.text}`}>
        <div className={`p-6 rounded-[2.5rem] mb-8 ${activeTheme.bg} ${activeTheme.border} border-2 ${activeTheme.glow}`}>
          <Clock size={60} className={activeTheme.color} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter mb-4">MY SHIFT</h1>
        <p className="opacity-40 font-bold mb-12">打造您的專屬美感班表</p>
        <button onClick={() => setStep(2)} className="w-full py-5 rounded-2xl bg-yellow-400 text-black font-black active:scale-95 transition-all">立即開始</button>
      </div>
    );

    if (step === 2) return (
      <div className={`h-full flex flex-col p-8 ${t.bg} ${t.text}`}>
        <h2 className="text-3xl font-black italic mb-2 uppercase">Select Style</h2>
        <p className="opacity-40 mb-10 font-bold">選擇一個視覺主題</p>
        <div className="grid gap-4 flex-1">
          {THEME_PALETTE.map(theme => (
            <button key={theme.id} onClick={() => setActiveTheme(theme)} className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all ${activeTheme.id === theme.id ? theme.border + ' ' + theme.bg : 'border-transparent bg-slate-800/20'}`}>
              <span className={`font-black italic ${activeTheme.id === theme.id ? theme.color : 'opacity-40'}`}>{theme.id.replace('-',' ')}</span>
              <div className={`w-6 h-6 rounded-full ${theme.lightBg} ${activeTheme.id === theme.id ? 'ring-4 ring-white/20' : ''}`}></div>
            </button>
          ))}
        </div>
        <button onClick={() => setStep(4)} className="py-5 rounded-2xl bg-yellow-400 text-black font-black mt-6">進入班表</button>
      </div>
    );
  };

  const renderMainApp = () => {
    const t = isDarkMode ? 
      { bg: 'bg-slate-950', text: 'text-slate-100', textSub: 'text-slate-400', card: 'bg-slate-900/60', border: 'border-slate-800/50' } : 
      { bg: 'bg-slate-50', text: 'text-slate-900', textSub: 'text-slate-500', card: 'bg-white', border: 'border-slate-200' };

    const days = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const blanks = Array(firstDay).fill(null);
    const monthDays = Array.from({ length: days }, (_, i) => i + 1);

    return (
      <div className={`flex flex-col h-full ${t.bg} ${t.text} transition-colors duration-500`}>
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter">MY SHIFT</h1>
            <div className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${activeTheme.lightBg}`}></span>
               <p className={`${t.textSub} font-black text-sm uppercase`}>{currentDate.getFullYear()} / {currentDate.getMonth() + 1}月</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className={`p-3 rounded-full ${t.card} border ${t.border}`}><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className={`p-3 rounded-full ${t.card} border ${t.border}`}><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 overflow-y-auto px-6 no-scrollbar">
          <div className="grid grid-cols-7 gap-2 mb-4 text-center text-[10px] font-black opacity-30 tracking-widest uppercase">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
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
                }} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${shift ? activeTheme.bg + ' ' + activeTheme.border + ' ' + activeTheme.glow : t.border + ' ' + t.card}`}>
                  <span className="text-[10px] font-bold opacity-30 mb-0.5">{day}</span>
                  {shift && <span className={`font-black text-base ${activeTheme.color}`}>{shift.type}</span>}
                </div>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className={`mt-8 p-6 rounded-[2.5rem] ${t.card} border-2 ${t.border} mb-8`}>
            <div className="flex items-center gap-2 mb-6 font-black italic opacity-40 text-xs tracking-widest"><BarChart3 size={14}/> STATISTICS</div>
            <div className="grid grid-cols-4 gap-4 text-center">
              {['早', '中', '晚', '休'].map(type => (
                <div key={type} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${monthStats[type] ? activeTheme.bg : 'bg-slate-800/20'}`}>
                    <span className={`text-[10px] font-black ${monthStats[type] ? activeTheme.color : 'opacity-20'}`}>{type}</span>
                  </div>
                  <p className="text-xl font-black italic leading-none">{monthStats[type] || 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 border-t border-slate-800/20 flex items-center justify-between">
          <div className="flex gap-5">
            <button className={`${t.textSub} flex items-center gap-1.5 text-[10px] font-black italic`}><Share2 size={14}/> SHARE</button>
            <button onClick={() => { if(window.confirm('確定要清空嗎？')) setSchedule({}); }} className="text-red-500/60 flex items-center gap-1.5 text-[10px] font-black italic"><Trash2 size={14}/> CLEAR</button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-full ${t.card} border ${t.border}`}>
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-slate-100'} flex items-center justify-center font-sans transition-colors duration-700`}>
      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
      <div className="w-full max-w-[430px] h-[850px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden md:rounded-[4rem] border-[8px] border-slate-900/10 relative">
        {step < 4 ? renderOnboarding() : renderMainApp()}
      </div>
    </div>
  );
}
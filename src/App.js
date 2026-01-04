import html2canvas from 'html2canvas';
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, MapPin, ChevronLeft, ChevronRight, X, Check, Settings, Moon, Sun, Eraser, Share2, Trash2, BarChart3 } from 'lucide-react';

const THEME_PALETTE = [
  { id: 'theme-1', color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]', lightColor: 'text-white', lightBorder: 'border-yellow-500', lightBg: 'bg-yellow-500' },
  { id: 'theme-2', color: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-400/10', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]', lightColor: 'text-white', lightBorder: 'border-cyan-500', lightBg: 'bg-cyan-500' },
  { id: 'theme-3', color: 'text-fuchsia-500', border: 'border-fuchsia-500', bg: 'bg-fuchsia-500/10', glow: 'shadow-[0_0_15px_rgba(217,70,239,0.3)]', lightColor: 'text-white', lightBorder: 'border-fuchsia-500', lightBg: 'bg-fuchsia-500' },
  { id: 'theme-4', color: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-400/10', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]', lightColor: 'text-white', lightBorder: 'border-emerald-500', lightBg: 'bg-emerald-500' },
  { id: 'theme-5', color: 'text-rose-400', border: 'border-rose-400', bg: 'bg-rose-400/10', glow: 'shadow-[0_0_15px_rgba(251,113,133,0.3)]', lightColor: 'text-white', lightBorder: 'border-rose-500', lightBg: 'bg-rose-500' },
  { id: 'theme-6', color: 'text-violet-400', border: 'border-violet-400', bg: 'bg-violet-400/10', glow: 'shadow-[0_0_15px_rgba(167,139,250,0.3)]', lightColor: 'text-white', lightBorder: 'border-violet-500', lightBg: 'bg-violet-500' },
];

const OFF_SHIFT = {
  id: 'off',
  name: '休息',
  time: '放空充電中',
  color: 'text-slate-400',
  glow: 'shadow-none',
  border: 'border-slate-600',
  bg: 'bg-slate-800/50',
  lightColor: 'text-white',
  lightBorder: 'border-slate-300',
  lightBg: 'bg-slate-300'
};

const DAYS_IN_WEEK = ['日', '一', '二', '三', '四', '五', '六'];

export default function App() {
  const [step, setStep] = useState(0); 
  const [scheduleName, setScheduleName] = useState('');
  const [shifts, setShifts] = useState([
    { id: 'early', name: '日班', time: '07:00 - 15:00', themeIdx: 0 },
    { id: 'mid', name: '小夜', time: '15:00 - 23:00', themeIdx: 1 },
    { id: 'night', name: '大夜', time: '23:00 - 07:00', themeIdx: 2 },
  ]);
  const handleExportImage = async () => {
    const element = document.getElementById('capture-area');
    // 透過 ID 抓取到的元素中尋找 z-30 (工具列)
    const toolbar = element?.querySelector('.z-30'); 
    
    if (!element) return;
    
    try {
      // 1. 隱藏工具列 (使用 !important 確保覆蓋樣式)
      if (toolbar) toolbar.style.setProperty('display', 'none', 'important');

      // 2. 執行截圖
      const canvas = await html2canvas(element, {
        useCORS: true,
        backgroundColor: isDarkMode ? '#020617' : '#ffffff',
        scale: 3,
        logging: false,
      });

      // 3. 轉換圖片並下載
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `${scheduleName || '我的班表'}_${currentDate.getMonth() + 1}月.png`;
      link.click();
    } catch (err) {
      console.error('圖片生成出錯:', err);
      alert('圖片生成失敗，請確認已執行過 npm install html2canvas');
    } finally {
      // 4. 【關鍵修正】不論成功或失敗，強制恢復顯示工具列
      if (toolbar) toolbar.style.setProperty('display', 'flex', 'important');
    }
  };
  const [areas, setAreas] = useState(['區域 A', '區域 AF', '區域 B']);
  const [newAreaInput, setNewAreaInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState({});
  const [activeToolId, setActiveToolId] = useState('early'); 
  const [activeArea, setActiveArea] = useState('區域 A');
  const [showStats, setShowStats] = useState(false);

  // 初始化載入 LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('shift-scheduler-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setScheduleName(parsed.name || '');
      setShifts(parsed.shifts || []);
      setAreas(parsed.areas || []);
      setSchedule(parsed.schedule || {});
      setStep(4); // 直接進入主畫面
    }
  }, []);

  // 儲存至 LocalStorage
  useEffect(() => {
    if (step >= 4) {
      localStorage.setItem('shift-scheduler-data', JSON.stringify({
        name: scheduleName, shifts, areas, schedule
      }));
    }
  }, [scheduleName, shifts, areas, schedule, step]);

  // 當區域清單變動時同步 activeArea
  useEffect(() => {
    if (areas.length > 0 && !areas.includes(activeArea)) {
      setActiveArea(areas[0]);
    } else if (areas.length === 0) {
      setActiveArea('');
    }
  }, [areas, activeArea]);

  const formatDateKey = (date) => date.toISOString().split('T')[0];
  
  const getDaysInMonth = (date) => ({
    days: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    firstDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  });

  // 統計當月各項數據
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

  const t = isDarkMode ? {
    bg: 'bg-slate-950', text: 'text-slate-100', textSub: 'text-slate-400', textMuted: 'text-slate-500',
    cardBg: 'bg-slate-900/80', cardBorder: 'border-slate-700', inputBg: 'bg-slate-800',
    accent: 'text-cyan-400', gridColor: 'rgba(255,255,255,0.03)', bottomBar: 'bg-slate-950/90 border-slate-800',
  } : {
    bg: 'bg-white', text: 'text-slate-900', textSub: 'text-slate-500', textMuted: 'text-slate-400',
    cardBg: 'bg-slate-50', cardBorder: 'border-slate-200', inputBg: 'bg-slate-100',
    accent: 'text-cyan-600', gridColor: 'rgba(0,0,0,0.03)', bottomBar: 'bg-white/95 border-slate-200',
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = formatDateKey(clickedDate);
    const isAlreadySelected = selectedDate.getTime() === clickedDate.getTime();
    
    setSelectedDate(clickedDate);

    if (!isAlreadySelected && schedule[dateKey]) return;

    if (activeToolId === 'clear') {
      const newSchedule = { ...schedule };
      delete newSchedule[dateKey];
      setSchedule(newSchedule);
    } else {
      setSchedule(prev => ({
        ...prev,
        [dateKey]: activeToolId === 'off' ? { type: 'off', area: '' } : { type: activeToolId, area: activeArea }
      }));
    }
  };

  const getShiftConfig = (typeId) => {
    if (!typeId) return null;
    if (typeId === 'off') return { ...OFF_SHIFT, displayColor: isDarkMode ? OFF_SHIFT.color : 'text-slate-700', displayBg: isDarkMode ? OFF_SHIFT.bg : 'bg-slate-200', displayBorder: isDarkMode ? OFF_SHIFT.border : 'border-slate-300' };
    const shift = shifts.find(s => s.id === typeId);
    if (!shift) return null;
    const theme = THEME_PALETTE[shift.themeIdx % THEME_PALETTE.length];
    return { ...shift, ...theme, displayColor: isDarkMode ? theme.color : 'text-white', displayBg: isDarkMode ? theme.bg : theme.lightBg, displayBorder: isDarkMode ? theme.border : 'border-transparent' };
  };

  const renderOnboarding = () => (
    <div className={`flex flex-col h-full p-6 transition-colors duration-500 ${t.bg}`}>
      <div className="flex gap-2 mb-8 mt-4">
        {[0, 1, 2, 3].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-cyan-400' : isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>)}
      </div>
      {step === 0 && (
        <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
          <h1 className={`text-3xl font-bold ${t.text} mb-2`}>開始您的<br/><span className="text-cyan-500">冒險計畫</span></h1>
          <input type="text" value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} placeholder="給班表取一個喜歡的名字" className={`bg-transparent border-b-2 ${t.cardBorder} text-2xl py-2 focus:border-cyan-400 focus:outline-none ${t.text}`}/>
        </div>
      )}
      {step === 1 && (
        <div className="flex-1 flex flex-col animate-in fade-in duration-500 overflow-hidden">
          <h2 className={`text-2xl font-bold ${t.text} mb-6`}>班表時段</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {shifts.map((shift, idx) => (
              <div key={shift.id} className={`p-4 rounded-xl border ${t.cardBg} ${t.cardBorder}`}>
                <div className="flex items-center gap-3 mb-2">
                   <div className={`w-3 h-3 rounded-full ${THEME_PALETTE[idx % THEME_PALETTE.length].bg} border ${THEME_PALETTE[idx % THEME_PALETTE.length].border}`}></div>
                   <input value={shift.name} onChange={(e) => {const ns=[...shifts]; ns[idx].name=e.target.value; setShifts(ns);}} className={`bg-transparent font-bold ${t.text} focus:outline-none w-full`}/>
                </div>
                <div className={`flex items-center gap-2 ${t.textSub} text-sm ${t.inputBg} p-2 rounded-lg`}><Clock size={14} /><input value={shift.time} onChange={(e) => {const ns=[...shifts]; ns[idx].time=e.target.value; setShifts(ns);}} className="bg-transparent focus:outline-none w-full font-mono"/></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="flex-1 flex flex-col animate-in fade-in duration-500">
          <h2 className={`text-2xl font-bold ${t.text} mb-6`}>值班區域</h2>
          <div className="flex gap-2 mb-6">
            <input type="text" value={newAreaInput} onChange={(e) => setNewAreaInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setAreas([...areas, newAreaInput]), setNewAreaInput(''))} placeholder="新增區域..." className={`flex-1 ${t.inputBg} border ${t.cardBorder} rounded-lg px-4 py-3 ${t.text}`}/>
          </div>
          <div className="flex flex-wrap gap-2">{areas.map(a => <div key={a} className={`${t.inputBg} rounded-full px-4 py-2 flex items-center gap-2 ${t.text}`}>{a}<button onClick={() => setAreas(areas.filter(i=>i!==a))}><X size={14}/></button></div>)}</div>
        </div>
      )}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
          <h2 className={`text-2xl font-bold ${t.text} mb-4 text-center`}>準備就緒！</h2>
          <div className="flex justify-center mb-8"><div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center text-white"><Check size={40} /></div></div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-full py-4 rounded-xl border ${t.cardBorder} ${t.text} flex items-center justify-center gap-3 mb-4`}>{isDarkMode ? <Moon size={20}/> : <Sun size={20}/>} {isDarkMode ? '切換為淺色模式' : '切換為深色模式'}</button>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className={`w-full py-4 rounded-xl border border-red-500/30 text-red-500 flex items-center justify-center gap-3`}><Trash2 size={18}/> 重置所有設定</button>
        </div>
      )}
      <div className="mt-auto flex justify-between py-4">
        {step > 0 && <button onClick={() => setStep(step-1)} className={t.textSub}>返回</button>}
        <button onClick={() => step < 3 ? setStep(step+1) : setStep(4)} className="ml-auto bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20">{step === 3 ? '完成' : '下一步'}</button>
      </div>
    </div>
  );

  const renderMainApp = () => {
    const { days, firstDay } = getDaysInMonth(currentDate);
    const sKey = formatDateKey(selectedDate);
    const sData = schedule[sKey];
    const sConfig = getShiftConfig(sData?.type);
    const todayStr = formatDateKey(new Date());

    return (
      <div id="capture-area" className={`flex flex-col h-full ${t.bg} relative transition-colors`}>
        {/* 背景網格 */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `linear-gradient(${t.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${t.gridColor} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

        {/* 上方資訊卡片 */}
        <div className="relative z-10 p-4 shrink-0">
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-3xl p-6 shadow-xl`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className={`${t.accent} text-[10px] font-mono tracking-widest uppercase mb-1 truncate`}>{scheduleName || '我的專屬計畫'}</h2>
                <div className={`text-2xl font-bold ${t.text}`}>{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 <span className={`text-sm font-normal ${t.textSub}`}>週{DAYS_IN_WEEK[selectedDate.getDay()]}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowStats(!showStats)} className={`${showStats ? 'text-cyan-400' : t.textMuted} hover:${t.text}`}><BarChart3 size={18} /></button>
                <button onClick={handleExportImage} className={`${t.textMuted} hover:${t.text}`}><Share2 size={18} /></button>
              </div>
            </div>

            {showStats ? (
              <div className="mt-6 grid grid-cols-4 gap-2 animate-in slide-in-from-top-2 duration-300">
                {[...shifts, OFF_SHIFT].map(s => (
                  <div key={s.id} className="text-center">
                    <span className={`text-[10px] ${t.textSub} block truncate`}>{s.name}</span>
                    <span className={`text-lg font-black ${t.text}`}>{monthStats[s.id] || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <span className={`text-[10px] ${t.textSub} uppercase tracking-wider block`}>工作時段</span>
                  <span className={`text-lg font-mono ${t.text}`}>{sConfig ? sConfig.time : '-- : --'}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] ${t.textSub} uppercase tracking-wider block`}>值班區域</span>
                  <span className={`text-lg font-bold ${sData?.area ? t.text : t.textSub}`}>{sData?.area || '--'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 日曆區域 */}
        <div className="flex-1 relative z-10 px-3 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between px-4 py-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className={`p-2 rounded-full ${t.accent}`}><ChevronLeft size={24}/></button>
            <h3 className={`text-xl font-black font-mono ${t.text}`}>{currentDate.getFullYear()}.{String(currentDate.getMonth() + 1).padStart(2, '0')}</h3>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className={`p-2 rounded-full ${t.accent}`}><ChevronRight size={24}/></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {DAYS_IN_WEEK.map((d, i) => (
              <div key={d} className={`text-[10px] ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-cyan-500' : t.textSub} font-black`}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 pb-40">
             {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
             {Array(days).fill(null).map((_, i) => {
               const day = i + 1;
               const dDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
               const dKey = formatDateKey(dDate);
               const itemData = schedule[dKey];
               const itemConfig = getShiftConfig(itemData?.type);
               const isSelected = selectedDate.getTime() === dDate.getTime();
               const isToday = dKey === todayStr;
               const dayOfWeek = dDate.getDay();

               return (
                 <button 
                   key={day} 
                   onClick={() => handleDateClick(day)} 
                   className={`
                     relative aspect-[1/1.2] rounded-2xl border transition-all duration-300 p-1 flex flex-col justify-between overflow-hidden
                     ${isSelected ? 'ring-2 ring-cyan-500 scale-105 z-20 shadow-xl' : 'border-transparent'}
                     ${itemConfig ? (isDarkMode ? itemConfig.displayBorder : 'border-transparent') : (isDarkMode ? 'bg-slate-900/40' : 'bg-slate-100')}
                     ${isToday && !itemConfig ? 'border-dashed border-cyan-500/50' : ''}
                   `}
                 >
                   {itemConfig && <div className={`absolute inset-0 ${itemConfig.displayBg} ${isDarkMode ? 'opacity-20' : 'opacity-100'}`}></div>}
                   
                   <div className="flex justify-between items-start z-10">
                     <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-cyan-500' : (itemConfig && !isDarkMode ? 'text-white' : (dayOfWeek === 0 ? 'text-rose-500' : dayOfWeek === 6 ? 'text-cyan-500' : t.textSub))}`}>
                       {day}
                     </span>
                     {isToday && <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>}
                   </div>

                   {itemConfig && (
                     <div className="flex-1 flex flex-col items-center justify-center gap-1 z-10">
                       <span className={`text-[12px] font-black leading-none ${!isDarkMode ? 'text-white' : itemConfig.displayColor}`}>
                         {itemConfig.name.substring(0, 2)}
                       </span>
                       {itemData.area && (
                         <div className={`px-1 rounded-[4px] ${!isDarkMode ? 'bg-black/10' : 'bg-white/10'} max-w-[90%]`}>
                           <p className={`text-[7px] truncate font-bold ${!isDarkMode ? 'text-white' : t.text}`}>{itemData.area}</p>
                         </div>
                       )}
                     </div>
                   )}
                 </button>
               )
             })}
          </div>
        </div>

        {/* 底部排班工具列 */}
        <div className={`absolute bottom-0 left-0 w-full ${t.bottomBar} backdrop-blur-2xl border-t pt-4 pb-10 px-4 z-30 rounded-t-[2.5rem] shadow-2xl`}>
           <div className="flex items-center gap-3 mb-4 overflow-x-auto no-scrollbar">
             <button onClick={() => setActiveToolId('clear')} className={`p-3 rounded-2xl transition-all border shrink-0 ${activeToolId === 'clear' ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : `${t.inputBg} ${t.textSub} border-transparent`}`}><Eraser size={20}/></button>
             
             <div className="flex items-center gap-1 bg-cyan-500/10 rounded-2xl p-1 border border-cyan-500/20 shrink-0">
               <MapPin size={14} className="text-cyan-500 ml-2" />
               <select value={activeArea} onChange={(e) => setActiveArea(e.target.value)} className={`bg-transparent text-sm font-black ${t.text} p-2 focus:outline-none w-24`}>
                 {areas.map(a => <option key={a} value={a}>{a}</option>)}
               </select>
             </div>

             <div className="flex gap-2">
               {shifts.map(s => {
                 const cfg = getShiftConfig(s.id);
                 const active = activeToolId === s.id;
                 return (
                   <button key={s.id} onClick={() => setActiveToolId(s.id)} className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${active ? (isDarkMode ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-[0_0_15px_rgba(34,211,238,0.2)]` : `${cfg.lightBg} text-white border-transparent`) : `${t.inputBg} ${t.textSub} border-transparent`}`}>{s.name}</button>
                 )
               })}
               <button onClick={() => setActiveToolId('off')} className={`px-4 py-2.5 rounded-2xl text-xs font-black border transition-all ${activeToolId === 'off' ? (isDarkMode ? 'bg-slate-700 text-white border-slate-500' : 'bg-slate-600 text-white border-transparent') : `${t.inputBg} ${t.textSub} border-transparent`}`}>休息</button>
             </div>
           </div>

           <div className="flex justify-between items-center opacity-60">
             <div className="flex gap-4">
                <button onClick={handleExportImage} className={`text-[10px] font-bold ${t.textSub} flex items-center gap-1`}><Share2 size={12}/> 分享</button>
                <button onClick={() => { if(window.confirm('確定要清空本月班表嗎？')) { const ns = {...schedule}; Object.keys(ns).forEach(k => { if(new Date(k).getMonth() === currentDate.getMonth()) delete ns[k]; }); setSchedule(ns); }}} className={`text-[10px] font-bold text-red-400 flex items-center gap-1`}><Trash2 size={12}/> 清空</button>
             </div>
             <div className={`w-12 h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full`}></div>
             <button onClick={() => setStep(3)} className={t.textSub}><Settings size={16}/></button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-slate-50'} flex items-center justify-center font-sans transition-colors duration-700`}>
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; height: 0px; } .no-scrollbar::-webkit-scrollbar { display: none; }` }} />
      <div className={`w-full max-w-[420px] h-[100dvh] md:h-[850px] ${t.bg} md:rounded-[3.5rem] shadow-2xl overflow-hidden relative border-[10px] ${isDarkMode ? 'border-slate-900 ring-1 ring-white/10' : 'border-white ring-1 ring-black/5'} flex flex-col`}>
        {step < 4 ? renderOnboarding() : renderMainApp()}
      </div>
    </div>
  );
}
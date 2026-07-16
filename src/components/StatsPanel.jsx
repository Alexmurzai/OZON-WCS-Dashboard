import React from 'react';
import { CHART_COLORS } from '../constants';

export const Chart = ({ data, label }) => {
  const max = Math.max(...data, 10);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / max) * 100}`).join(' ');
  return (
    <div className="w-full flex flex-col mt-4">
      <div className="w-full h-24 relative rounded-lg border border-white/5 bg-black/20">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0, 191, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(0, 191, 255, 0.0)" />
            </linearGradient>
          </defs>
          <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="4 2" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <polyline fill="url(#chartGradient)" stroke="#00BFFF" strokeWidth="2" points={`0,100 ${points} 100,100`} vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="absolute top-0 right-1 text-[9px] text-gray-500 bg-black/40 px-1 rounded-bl">{max} max</div>
        <div className="absolute top-1/2 right-1 -translate-y-1/2 text-[9px] text-gray-600">{Math.round(max/2)}</div>
      </div>
      <div className="flex justify-between items-center mt-1 px-1">
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className="text-[10px] font-bold text-cyan-400">{data[data.length-1]} /min</span>
      </div>
    </div>
  );
};

export const ProgressRing = ({ value, label, colorClass, size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={radius} fill="transparent" className={`${colorClass} transition-all duration-1000 ease-out`} stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-sm font-bold text-white">{value}%</span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
};

export const DonutChart = ({ dataObj, title }) => {
  const keys = Object.keys(dataObj);
  const total = keys.reduce((acc, key) => acc + dataObj[key], 0) || 1;
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const segments = keys.map((key, i) => {
    const value = dataObj[key];
    const percent = value / total;
    if (percent === 0) return null;
    
    if (percent === 1) {
      return <circle key={key} cx="0" cy="0" r="1" fill="transparent" stroke={CHART_COLORS[key]} strokeWidth="0.4" />;
    }

    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    
    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`
    ].join(' ');

    return <path key={key} d={pathData} fill="transparent" stroke={CHART_COLORS[key]} strokeWidth="0.4" />;
  });

  return (
    <div className="flex flex-col items-center bg-black/20 p-4 rounded-xl border border-white/5">
      <div className="text-xs text-gray-400 mb-4">{title}</div>
      <div className="relative w-32 h-32">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
          {segments}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold text-white">{total===1 && keys.every(k=>dataObj[k]===0) ? 0 : total}</span>
          <span className="text-[8px] text-gray-500 uppercase">Total</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {keys.map(key => (
          <div key={key} className="flex items-center gap-1 text-[10px] text-gray-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[key] }}></span>
            {key}: <span className="font-bold text-white">{dataObj[key]}</span> <span className="opacity-50">({Math.round((dataObj[key]/total)*100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LegendWidget = ({ t }) => (
  <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 mt-6">
    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{t.legendTitle}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-400">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2"><span className="text-cyan-400 font-bold w-10 shrink-0">МГТ</span><span>{t.legendMgt}</span></div>
        <div className="flex items-start gap-2"><span className="text-indigo-400 font-bold w-10 shrink-0">КГТ+</span><span>{t.legendKgt}</span></div>
        <div className="flex items-start gap-2"><span className="text-fuchsia-400 font-bold w-10 shrink-0">СГТ</span><span>{t.legendSgt}</span></div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2"><span className="text-green-400 font-bold w-12 shrink-0">Зона B</span><span>{t.legendZoneB}</span></div>
        <div className="flex items-start gap-2"><span className="text-orange-400 font-bold w-12 shrink-0">Зона C</span><span>{t.legendZoneC}</span></div>
        <div className="flex items-start gap-2"><span className="text-blue-400 font-bold w-12 shrink-0">Зона D</span><span>{t.legendZoneD}</span></div>
      </div>
    </div>
  </div>
);

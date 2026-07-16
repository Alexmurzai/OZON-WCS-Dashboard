import React, { useState } from 'react';
import { Layers, Globe, PieChart, Activity, Settings, AlertOctagon, BarChart2, Box } from 'lucide-react';
import { translations, CATEGORY_COLORS } from './constants';
import { useConveyorSimulation } from './hooks/useConveyorSimulation';
import ConveyorLayout from './components/ConveyorLayout';
import ControlPanel from './components/ControlPanel';
import NodeDetailView from './components/NodeDetailView';
import { Chart, ProgressRing, DonutChart, LegendWidget } from './components/StatsPanel';

export default function App() {
  const [lang, setLang] = useState('ru'); 
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('global');
  
  const [isEStop, setIsEStop] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [isGameMode, setIsGameMode] = useState(false);

  const { parcels, metrics, clearJam, calibrate } = useConveyorSimulation(speed, true, isEStop, isGameMode);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Compact Header */}
      <header className="glass-panel border-b border-white/10 px-4 py-2 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,191,255,0.4)]">
            <Layers className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              OZON <span className="font-light">WCS Dashboard</span>
            </h1>
          </div>
        </div>

        {/* Tabs inline in header */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-1.5
              ${activeTab === 'global' ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-cyan-500/50 text-white' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <PieChart size={12} /> {t.globalOverview}
          </button>
          <button
            onClick={() => setActiveTab('node1')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-1.5
              ${activeTab === 'node1' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            {t.nodeNamePrefix} 1
          </button>
          <button
            onClick={() => setActiveTab('node2')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-1.5
              ${activeTab === 'node2' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            {t.nodeNamePrefix} 2
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex bg-black/40 p-0.5 rounded border border-white/10 items-center">
            <Globe size={12} className="mx-1.5 text-gray-500" />
            <button onClick={() => setLang('ru')} className={`px-1.5 py-0.5 rounded text-[10px] ${lang === 'ru' ? 'bg-white/15 text-white' : 'text-gray-500'}`}>RU</button>
            <button onClick={() => setLang('en')} className={`px-1.5 py-0.5 rounded text-[10px] ${lang === 'en' ? 'bg-white/15 text-white' : 'text-gray-500'}`}>EN</button>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isEStop ? 'bg-red-500 shadow-[0_0_10px_#FF1744] animate-pulse' : 'bg-green-500 shadow-[0_0_10px_#00E676]'}`}></div>
            <span className="text-[11px]">{isEStop ? t.estopActive : t.systemOp}</span>
          </div>
        </div>
      </header>

      {activeTab === 'global' && (
        <main className="flex-1 flex gap-3 p-3 min-h-0 overflow-hidden">
          
          {/* LEFT: Conveyor Visualization (dominant) */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            <div className="flex-1 min-h-0">
              <ConveyorLayout parcels={parcels} isRunning={!isEStop} />
            </div>
            
            {isEStop && (
              <div className="absolute inset-0 z-50 pointer-events-none rounded-2xl border-4 border-red-500 animate-pulse-red bg-red-500/10 flex items-center justify-center">
                <div className="bg-red-900/90 border border-red-500 text-white px-6 py-3 rounded-xl shadow-[0_0_40px_red] backdrop-blur flex items-center gap-3 animate-bounce pointer-events-auto">
                  <AlertOctagon size={32} className="text-red-400" />
                  <div><h2 className="text-lg font-bold uppercase tracking-wider">{t.estopActive}</h2><p className="text-xs opacity-80">{t.estopDesc}</p></div>
                  <button onClick={() => setIsEStop(false)} className="ml-4 bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-all">{t.reset}</button>
                </div>
              </div>
            )}

            {/* Legend (compact, inline below conveyor) */}
            <div className="shrink-0 mt-2 glass-panel px-4 py-2 rounded-xl">
              <div className="grid grid-cols-6 gap-2 text-[10px] text-gray-400">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> МГТ: {t.legendMgt}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> КГТ+: {t.legendKgt}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-fuchsia-400"></span> СГТ: {t.legendSgt}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> {t.legendZoneB}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> {t.legendZoneC}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> {t.legendZoneD}</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Controls + Stats sidebar */}
          <div className="w-[340px] shrink-0 flex flex-col gap-3 min-h-0 overflow-y-auto scrollbar-hide">
            
            {/* Control Panel (compact) */}
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 text-gray-200">
                  <Settings size={14} className="text-cyan-400" /> {t.wcsControl}
                </h3>
                {/* Mode toggle */}
                <div className="flex bg-black/40 p-0.5 rounded border border-white/10 text-[10px]">
                  <button onClick={() => setIsGameMode(false)} className={`px-2 py-0.5 rounded transition-all ${!isGameMode ? 'bg-white/10 text-white' : 'text-gray-500'}`}>{t.idealMode}</button>
                  <button onClick={() => setIsGameMode(true)} className={`px-2 py-0.5 rounded transition-all ${isGameMode ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500'}`}>{t.gameMode}</button>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEStop(!isEStop)} 
                className={`w-full py-4 rounded-lg font-black text-lg tracking-widest uppercase transition-all ${isEStop ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-95 border-2 border-red-400' : 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white border border-red-400 shadow-[0_5px_15px_rgba(0,0,0,0.5)] active:scale-95'}`}
              >
                {t.estopBtn}
              </button>
              
              <div>
                <label className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>{t.beltSpeed}</span>
                  <span className="font-mono text-cyan-400">{speed.toFixed(1)} m/s</span>
                </label>
                <input type="range" min="0.5" max="3.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full accent-cyan-500 cursor-pointer h-1" disabled={isEStop} />
              </div>
              
              <div className="flex gap-2">
                <button onClick={clearJam} disabled={!isGameMode || !isEStop} className="flex-1 glass-button py-1.5 rounded-lg text-[11px] text-orange-400 font-medium flex items-center justify-center gap-1 disabled:opacity-30" title={!isEStop ? 'Остановите конвейер для сброса' : ''}>
                  {t.clearJam}
                </button>
                <button onClick={calibrate} disabled={!isGameMode} className="flex-1 glass-button py-1.5 rounded-lg text-[11px] text-cyan-400 font-medium flex items-center justify-center gap-1 disabled:opacity-30">
                  {t.calibrate}
                </button>
              </div>
            </div>

            {/* KPI Cards (compact grid) */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {/* OEE */}
              <div className="glass-panel p-3 rounded-xl">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">{t.oee}</div>
                <div className="text-2xl font-bold text-white mt-1">{metrics.oee}%</div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2"><div className="bg-cyan-400 h-full transition-all" style={{width:`${metrics.oee}%`}}></div></div>
              </div>
              
              {/* Throughput */}
              <div className="glass-panel p-3 rounded-xl">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1">{t.throughput} <BarChart2 size={10}/></div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.throughput} <span className="text-[10px] text-gray-500 font-normal">/min</span></div>
              </div>
              
              {/* Availability + Performance */}
              <div className="glass-panel p-3 rounded-xl flex items-center justify-around">
                <ProgressRing value={metrics.availability} label={t.availability} colorClass="text-indigo-400" size={55} strokeWidth={4} />
              </div>
              <div className="glass-panel p-3 rounded-xl flex items-center justify-around">
                <ProgressRing value={metrics.performance} label={t.performance} colorClass="text-fuchsia-400" size={55} strokeWidth={4} />
              </div>

              {/* Jam Rate */}
              <div className="glass-panel p-3 rounded-xl">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">{t.jamRate}</div>
                <div className="text-2xl font-bold text-orange-400 mt-1">{metrics.jamRate}%</div>
              </div>
              
              {/* No-Read Rate */}
              <div className="glass-panel p-3 rounded-xl">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">{t.noReadRate}</div>
                <div className="text-2xl font-bold text-gray-300 mt-1">{metrics.noReadRate}%</div>
              </div>
            </div>

            {/* Throughput Chart */}
            <div className="glass-panel p-3 rounded-xl shrink-0">
              <Chart data={metrics.historyData} label={t.throughputChart} />
            </div>

            {/* Donut Charts side by side */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <DonutChart dataObj={metrics.catCounts} title={t.catDistribution} />
              <DonutChart dataObj={metrics.zoneCounts} title={t.zoneDistribution} />
            </div>

            {/* Total Processed */}
            <div className="glass-panel p-3 rounded-xl text-center shrink-0">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest">{t.totalProcessed}</div>
              <div className="text-2xl font-bold text-white">{metrics.totalProcessed}</div>
            </div>
          </div>
        </main>
      )}

      {/* --- NODE SPECIFIC VIEWS --- */}
      {(activeTab === 'node1' || activeTab === 'node2') && (
        <main className="flex-1 p-3 overflow-auto">
          <NodeDetailView 
            nodeId={activeTab === 'node1' ? 1 : 2}
            parcels={parcels}
            metrics={metrics}
            t={t}
            isEStop={isEStop}
          />
        </main>
      )}
    </div>
  );
}

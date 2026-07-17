import React from 'react';
import ConveyorLayout from './ConveyorLayout';
import { DonutChart, ProgressRing } from './StatsPanel';
import ParcelHistoryTable from './ParcelHistoryTable';
import { CHART_COLORS } from '../constants';

export default function NodeDetailView({ nodeId, parcels, historyParcels = [], metrics, t, isEStop, lang = 'en' }) {
  // Node 1: centered at x=600, y=200
  // Node 2: centered at x=200, y=200
  const viewBox = nodeId === 1 ? "400 -20 400 360" : "0 -20 400 360";
  
  const node1Paths = ['pathA', 'pathR1', 'pathD'];
  const node2Paths = ['pathMix', 'pathR2', 'pathB', 'pathC'];
  const relevantPaths = nodeId === 1 ? node1Paths : node2Paths;
  const nodeParcels = parcels.filter(p => relevantPaths.includes(p.pathId));
  
  const nodeData = nodeId === 1 ? metrics.node1 : metrics.node2;
  const nodeAccumulated = nodeId === 1 ? metrics.node1Accumulated : metrics.node2Accumulated;
  const hasJam = nodeParcels.some(p => p.isJammed);
  
  // Historical parcels for this node
  const nodeHistory = historyParcels.filter(p => {
    if (nodeId === 1) return true; // Node 1 sees everything
    return p.routingZone !== 'C'; // Node 2 sees everything except Zone C
  });
  
  const zn = lang === 'ru' ? 'Зона' : 'Zone';
  const nd = lang === 'ru' ? 'Узел' : 'Node';
  
  const catColor = (cat) => {
    if (cat === 'МГТ') return '#22d3ee';
    if (cat === 'КГТ+') return '#6366f1';
    if (cat === 'СГТ') return '#d946ef';
    return '#888';
  };
  
  return (
    <div className="flex gap-3 h-full animate-in fade-in duration-500">
      
      {/* LEFT: Parcel History Table */}
      <div className="w-[300px] shrink-0">
        <ParcelHistoryTable 
          title={lang === 'ru' ? 'История грузов' : 'Parcel History'}
          parcels={nodeHistory} 
          lang={lang} 
          filename={`node${nodeId}-history.csv`} 
        />
      </div>

      {/* CENTER: Zoomed ConveyorLayout (fragment) */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="glass-panel p-2 rounded-xl flex justify-between items-center mb-2 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">{nd} {nodeId}</h2>
            <p className="text-[10px] text-gray-400">
              {nodeId === 1 
                ? `${zn} A → DWS → ${zn} C ↑ / ${lang === 'ru' ? 'Смеш.' : 'Mix'} ↓` 
                : `${lang === 'ru' ? 'Смеш. зона' : 'Mixed'} ↑ → ${zn} B ← / ${zn} D →`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${hasJam ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${hasJam ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              {hasJam ? 'JAM' : 'OK'}
            </div>
            <div className="text-right">
              <div className="text-[9px] text-gray-400">Active</div>
              <div className="text-sm font-bold text-cyan-400">{nodeData.active}</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ConveyorLayout parcels={parcels} viewBox={viewBox} isRunning={!isEStop} lang={lang} activeNode={nodeId} />
        </div>
      </div>

      {/* RIGHT: Node Stats */}
      <div className="w-[220px] shrink-0 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
        
        {/* Throughput */}
        <div className="glass-panel p-3 rounded-xl">
          <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">{t.throughput || 'Throughput'}</div>
          {nodeId === 1 ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
                <div className="text-[9px] text-orange-400 flex items-center justify-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>C</div>
                <div className="text-lg font-bold text-white">{nodeData.throughputC}</div>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
                <div className="text-[9px] text-purple-400">→Mix</div>
                <div className="text-lg font-bold text-white">{nodeData.throughputMix}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
                <div className="text-[9px] text-green-400 flex items-center justify-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> {zn} B</div>
                <div className="text-lg font-bold text-white">{nodeData.throughputB}</div>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
                <div className="text-[9px] text-blue-400 flex items-center justify-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {zn} D</div>
                <div className="text-lg font-bold text-white">{nodeData.throughputD}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Category donut */}
        <div className="glass-panel p-3 rounded-xl flex-1 flex flex-col items-center justify-center">
          <div className="text-[9px] text-gray-400 uppercase tracking-widest w-full mb-1">{t.catDistribution || 'Category Distribution'} ({nd}{nodeId})</div>
          <div className="w-24 h-24">
            <DonutChart 
              data={[
                { label: 'МГТ', value: nodeAccumulated['МГТ'] || 0, color: CHART_COLORS[0] },
                { label: 'КГТ+', value: nodeAccumulated['КГТ+'] || 0, color: CHART_COLORS[1] },
                { label: 'СГТ', value: nodeAccumulated['СГТ'] || 0, color: CHART_COLORS[2] }
              ]} 
              title="Total"
            />
          </div>
          <div className="w-full mt-2 flex flex-wrap justify-center gap-2 text-[8px]">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: CHART_COLORS[0]}}></span>МГТ: {nodeAccumulated['МГТ'] || 0}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: CHART_COLORS[1]}}></span>КГТ+: {nodeAccumulated['КГТ+'] || 0}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: CHART_COLORS[2]}}></span>СГТ: {nodeAccumulated['СГТ'] || 0}</span>
          </div>
        </div>
        
        {/* Zone donut */}
        <div className="glass-panel p-3 rounded-xl flex-1 flex flex-col items-center justify-center">
          <div className="text-[9px] text-gray-400 uppercase tracking-widest w-full mb-1">{lang === 'ru' ? 'Распределение Зон' : 'Zone Distribution'} ({nd}{nodeId})</div>
          <div className="w-24 h-24">
            <DonutChart 
              data={nodeId === 1 ? [
                { label: 'Zone C', value: nodeAccumulated['C'] || 0, color: '#fb923c' },
                { label: 'Mixed', value: nodeAccumulated['Mix'] || 0, color: '#c084fc' }
              ] : [
                { label: 'Zone B', value: nodeAccumulated['B'] || 0, color: '#4ade80' },
                { label: 'Zone D', value: nodeAccumulated['D'] || 0, color: '#60a5fa' }
              ]} 
              title="Total"
            />
          </div>
          <div className="w-full mt-2 flex flex-wrap justify-center gap-2 text-[8px]">
            {nodeId === 1 ? (
              <>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>C: {nodeAccumulated['C'] || 0}</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Mix: {nodeAccumulated['Mix'] || 0}</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>B: {nodeAccumulated['B'] || 0}</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>D: {nodeAccumulated['D'] || 0}</span>
              </>
            )}
          </div>
        </div>

        {/* Routing Rules */}
        <div className="glass-panel p-3 rounded-xl">
          <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">{t.routingRules || 'Routing Rules'}</div>
          <div className="text-[10px] text-gray-300 flex flex-col gap-1">
            {nodeId === 1 ? (
              <>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> <b>C:</b> {lang === 'ru' ? 'Негабарит' : 'Oversized'}</div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> <b>Mix:</b> {lang === 'ru' ? 'Остальные → Узел 2' : 'Rest → Node 2'}</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> <b>B:</b> {lang === 'ru' ? 'Все стандартные МГТ' : 'All standard MGT'}</div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> <b>D:</b> {lang === 'ru' ? 'Скругл. >0.7' : 'Rnd >0.7'}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

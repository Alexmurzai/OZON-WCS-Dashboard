import React from 'react';
import ConveyorLayout from './ConveyorLayout';
import { DonutChart, ProgressRing } from './StatsPanel';
import { CHART_COLORS } from '../constants';

export default function NodeDetailView({ nodeId, parcels, metrics, t, isEStop, lang = 'en' }) {
  // Node 1: Zone A (right), Node 1, Zone C (up) — crop left side
  // Node 2: Zone B (left), Node 2 horizontal, Zone D (right) — crop top
  const viewBox = nodeId === 1 ? "500 -10 320 490" : "-10 100 430 380";
  
  // Filter parcels relevant to this node
  const node1Paths = ['pathA', 'pathR1', 'pathD'];
  const node2Paths = ['pathMix', 'pathR2', 'pathB', 'pathC'];
  const relevantPaths = nodeId === 1 ? node1Paths : node2Paths;
  const nodeParcels = parcels.filter(p => relevantPaths.includes(p.pathId));
  
  // Node-specific category and zone distribution
  const nodeCatCounts = { 'МГТ': 0, 'КГТ+': 0, 'СГТ': 0 };
  // Node 1: routes to Zone C (up) or Mixed (down to Node 2)
  // Node 2: routes to Zone B (left) or Zone D (right)
  const nodeZoneCounts = nodeId === 1 ? { 'C': 0, 'Mix': 0 } : { 'B': 0, 'D': 0 };
  
  nodeParcels.forEach(p => {
    nodeCatCounts[p.category] = (nodeCatCounts[p.category] || 0) + 1;
    if (nodeId === 1) {
      if (p.pathId === 'pathD') nodeZoneCounts['C'] += 1;
      else nodeZoneCounts['Mix'] += 1;
    } else {
      if (p.pathId === 'pathC') nodeZoneCounts['D'] += 1;
      else nodeZoneCounts['B'] += 1;
    }
  });

  const nodeData = nodeId === 1 ? metrics.node1 : metrics.node2;
  const hasJam = nodeParcels.some(p => p.isJammed);
  
  const zn = lang === 'ru' ? 'Зона' : 'Zone';
  const nd = lang === 'ru' ? 'Узел' : 'Node';
  
  return (
    <div className="flex gap-3 h-full animate-in fade-in duration-500">
      
      {/* LEFT: Zoomed ConveyorLayout */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="glass-panel p-3 rounded-xl flex justify-between items-center mb-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{nd} {nodeId}</h2>
            <p className="text-[10px] text-gray-400">
              {nodeId === 1 
                ? `${zn} A → DWS → ${zn} C / ${lang === 'ru' ? 'Смешанная зона' : 'Mixed Zone'}` 
                : `${lang === 'ru' ? 'Смешанная зона' : 'Mixed Zone'} → ${zn} B / ${zn} D`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${hasJam ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${hasJam ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              {hasJam ? 'JAM' : 'OK'}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400">Active</div>
              <div className="text-lg font-bold text-cyan-400">{nodeData.active}</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ConveyorLayout parcels={parcels} viewBox={viewBox} isRunning={!isEStop} lang={lang} />
        </div>
      </div>

      {/* RIGHT: Node Stats */}
      <div className="w-[280px] shrink-0 flex flex-col gap-3 overflow-y-auto scrollbar-hide">
        
        {/* Throughput per zone */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">{lang === 'ru' ? 'Пропускная способность' : 'Throughput'}</div>
          {nodeId === 1 ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-orange-400 flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> {zn} C</div>
                <div className="text-xl font-bold text-white">{nodeData.throughputD}</div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-gray-400">→ {lang === 'ru' ? 'Смеш.' : 'Mixed'}</div>
                <div className="text-xl font-bold text-white">{nodeData.throughputMix || '—'}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-green-400 flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> {zn} B</div>
                <div className="text-xl font-bold text-white">{nodeData.throughputB}</div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-blue-400 flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {zn} D</div>
                <div className="text-xl font-bold text-white">{nodeData.throughputC}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Category distribution for this node */}
        <DonutChart dataObj={nodeCatCounts} title={`${t.catDistribution} (${nd} ${nodeId})`} />
        
        {/* Zone distribution for this node */}
        <DonutChart dataObj={nodeZoneCounts} title={`${t.zoneDistribution} (${nd} ${nodeId})`} />

        {/* Routing zones explanation */}
        <div className="glass-panel p-3 rounded-xl">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{lang === 'ru' ? 'Правила маршрутизации' : 'Routing Rules'}</div>
          <div className="text-[11px] text-gray-300 flex flex-col gap-1.5">
            {nodeId === 1 ? (
              <>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400"></span> <b>{zn} C:</b> {lang === 'ru' ? 'Негабарит (СГТ, КГТ+)' : 'Oversized (SGT, KGT+)'}</div>
                <div>⬇️ <b>{lang === 'ru' ? 'Смеш.' : 'Mixed'}:</b> {lang === 'ru' ? 'Все остальные → Узел 2' : 'All other → Node 2'}</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400"></span> <b>{zn} B:</b> {lang === 'ru' ? 'Стандартные (МГТ)' : 'Standard (MGT)'}</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> <b>{zn} D:</b> {lang === 'ru' ? 'Скругление > 0.7' : 'Rounding > 0.7'}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

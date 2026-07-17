import React from 'react';
import ConveyorLayout from './ConveyorLayout';
import { DonutChart, ProgressRing } from './StatsPanel';
import { CHART_COLORS } from '../constants';

export default function NodeDetailView({ nodeId, parcels, metrics, t, isEStop, lang = 'en' }) {
  // Node 1: centered at x=600, y=200
  // Node 2: centered at x=200, y=200
  const viewBox = nodeId === 1 ? "400 -20 400 360" : "0 -20 400 360";
  
  const node1Paths = ['pathA', 'pathR1', 'pathD'];
  const node2Paths = ['pathMix', 'pathR2', 'pathB', 'pathC'];
  const relevantPaths = nodeId === 1 ? node1Paths : node2Paths;
  const nodeParcels = parcels.filter(p => relevantPaths.includes(p.pathId));
  
  const nodeCatCounts = { 'МГТ': 0, 'КГТ+': 0, 'СГТ': 0 };
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
  
  const catColor = (cat) => {
    if (cat === 'МГТ') return '#22d3ee';
    if (cat === 'КГТ+') return '#6366f1';
    if (cat === 'СГТ') return '#d946ef';
    return '#888';
  };
  
  return (
    <div className="flex gap-3 h-full animate-in fade-in duration-500">
      
      {/* LEFT: Parcel Table */}
      <div className="w-[240px] shrink-0 glass-panel p-3 rounded-xl flex flex-col min-h-0 overflow-hidden">
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{t.passingParcels || 'Passing Parcels'}</div>
        <div className="flex-1 overflow-y-auto scrollbar-hide text-[10px]">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#12121a]">
              <tr className="text-gray-500">
                <th className="text-left py-1 px-1">ID</th>
                <th className="text-left py-1 px-1">{lang === 'ru' ? 'Кат.' : 'Cat.'}</th>
                <th className="text-right py-1 px-1">{lang === 'ru' ? 'Вес' : 'Wt'}</th>
                <th className="text-right py-1 px-1">{lang === 'ru' ? 'Габ.' : 'Dim'}</th>
                <th className="text-right py-1 px-1">{lang === 'ru' ? 'Скр.' : 'Rnd'}</th>
              </tr>
            </thead>
            <tbody>
              {nodeParcels.slice(0, 30).map(p => (
                <tr key={p.id} className="border-t border-white/5 text-gray-300 hover:bg-white/5">
                  <td className="py-0.5 px-1 font-mono text-[9px]">{p.id.split('-')[1]}</td>
                  <td className="py-0.5 px-1 font-bold" style={{color: catColor(p.category)}}>{p.category}</td>
                  <td className="py-0.5 px-1 text-right">{p.weight}</td>
                  <td className="py-0.5 px-1 text-right text-[9px]">{p.dimensions.x}×{p.dimensions.y}</td>
                  <td className="py-0.5 px-1 text-right">{p.rounding_factor}</td>
                </tr>
              ))}
              {nodeParcels.length === 0 && (
                <tr><td colSpan="5" className="py-4 text-center text-gray-600 text-xs">{lang === 'ru' ? 'Нет грузов' : 'No parcels'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
          <ConveyorLayout parcels={parcels} viewBox={viewBox} isRunning={!isEStop} lang={lang} />
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
        <DonutChart dataObj={nodeCatCounts} title={`${t.catDistribution} (${nd}${nodeId})`} />
        
        {/* Zone donut */}
        <DonutChart dataObj={nodeZoneCounts} title={`${t.zoneDistribution} (${nd}${nodeId})`} />

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

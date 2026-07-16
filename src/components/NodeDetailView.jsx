import React from 'react';
import ConveyorLayout from './ConveyorLayout';
import { DonutChart, ProgressRing } from './StatsPanel';
import { CHART_COLORS } from '../constants';

export default function NodeDetailView({ nodeId, parcels, metrics, t, isEStop }) {
  // Node 1: viewBox crops to right side (Zone A, Node 1, Zone D)
  // Node 2: viewBox crops to left+bottom (Mixed Zone, Node 2, Zone B) — no Zone C area from right
  const viewBox = nodeId === 1 ? "500 -10 320 280" : "-10 100 430 380";
  
  // Filter parcels relevant to this node
  const node1Paths = ['pathA', 'pathR1', 'pathD'];
  const node2Paths = ['pathMix', 'pathR2', 'pathB', 'pathC'];
  const relevantPaths = nodeId === 1 ? node1Paths : node2Paths;
  const nodeParcels = parcels.filter(p => relevantPaths.includes(p.pathId));
  
  // Node-specific category and zone distribution
  const nodeCatCounts = { 'МГТ': 0, 'КГТ+': 0, 'СГТ': 0 };
  const nodeZoneCounts = nodeId === 1 ? { 'D': 0, 'Mix': 0 } : { 'B': 0, 'C': 0 };
  
  nodeParcels.forEach(p => {
    nodeCatCounts[p.category] = (nodeCatCounts[p.category] || 0) + 1;
    if (nodeId === 1) {
      if (p.pathId === 'pathD') nodeZoneCounts['D'] += 1;
      else nodeZoneCounts['Mix'] += 1;
    } else {
      if (p.pathId === 'pathC') nodeZoneCounts['C'] += 1;
      else nodeZoneCounts['B'] += 1;
    }
  });

  const nodeData = nodeId === 1 ? metrics.node1 : metrics.node2;
  const hasJam = nodeParcels.some(p => p.isJammed);
  
  return (
    <div className="flex gap-3 h-full animate-in fade-in duration-500">
      
      {/* LEFT: Zoomed ConveyorLayout */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="glass-panel p-3 rounded-xl flex justify-between items-center mb-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{t.nodeNamePrefix} {nodeId}</h2>
            <p className="text-[10px] text-gray-400">{nodeId === 1 ? 'Zone A → DWS → Zone D / Mixed Zone' : 'Mixed Zone → Zone B / Zone C'}</p>
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
          <ConveyorLayout parcels={parcels} viewBox={viewBox} isRunning={!isEStop} />
        </div>
      </div>

      {/* RIGHT: Node Stats */}
      <div className="w-[280px] shrink-0 flex flex-col gap-3 overflow-y-auto scrollbar-hide">
        
        {/* Throughput per zone */}
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Throughput (Total Exited)</div>
          {nodeId === 1 ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-blue-400">Zone D</div>
                <div className="text-xl font-bold text-white">{nodeData.throughputD}</div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-gray-400">→ Mixed</div>
                <div className="text-xl font-bold text-white">{nodeData.throughputMix || '—'}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-green-400">Zone B</div>
                <div className="text-xl font-bold text-white">{nodeData.throughputB}</div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] text-orange-400">Zone C</div>
                <div className="text-xl font-bold text-white">{nodeData.throughputC}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Category distribution for this node */}
        <DonutChart dataObj={nodeCatCounts} title={`${t.catDistribution} (${t.nodeNamePrefix}${nodeId})`} />
        
        {/* Zone distribution for this node */}
        <DonutChart dataObj={nodeZoneCounts} title={`${t.zoneDistribution} (${t.nodeNamePrefix}${nodeId})`} />

        {/* Routing zones explanation */}
        <div className="glass-panel p-3 rounded-xl">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Routing Rules</div>
          <div className="text-[11px] text-gray-300 flex flex-col gap-1.5">
            {nodeId === 1 ? (
              <>
                <div>🔵 <b>Zone D:</b> Rounding &gt; 0.7 (round/fragile)</div>
                <div>⬇️ <b>Mixed:</b> All other parcels → Node 2</div>
              </>
            ) : (
              <>
                <div>🟢 <b>Zone B:</b> Standard MGT parcels</div>
                <div>🟠 <b>Zone C:</b> Oversized (SGT, KGT+)</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { CATEGORY_COLORS } from '../constants';

const getPos = (pathId, progress, offset, routingZone) => {
  let x = 0, y = 0, angle = 0;
  
  if (pathId === 'pathA') {
    x = 800 - (progress * 160);
    y = 200 + offset;
    angle = 0;
  } else if (pathId === 'pathR1') {
    x = 640 - (progress * 40);
    y = 200 + offset;
    angle = 0;
  } else if (pathId === 'pathD') {
    x = 600 + offset;
    y = 200 - (progress * 180);
    angle = 90;
  } else if (pathId === 'pathZoneD') {
    // From DWS area (700) going down 60px then right 100px
    const totalDist = 160;
    const currDist = progress * totalDist;
    if (currDist < 60) {
      x = 700 + offset;
      y = 240 + currDist;
      angle = 90;
    } else {
      x = 700 + (currDist - 60);
      y = 300 + offset;
      angle = 0;
    }
  } else if (pathId === 'pathMix') {
    const totalDist = 757;
    const currDist = progress * totalDist;
    if (currDist < 150) {
      x = 600 - offset;
      y = 200 + currDist;
      angle = 90;
    } else if (currDist < 228.5) {
      const p = (currDist - 150) / 78.5;
      x = 550 + Math.cos(p * Math.PI/2) * 50 - offset * Math.sin(p * Math.PI/2);
      y = 350 + Math.sin(p * Math.PI/2) * 50 - offset * Math.cos(p * Math.PI/2);
      angle = 90 - p*90;
    } else if (currDist < 528.5) {
      x = 550 - (currDist - 228.5);
      y = 400 + offset;
      angle = 0;
    } else if (currDist < 607) {
      const p = (currDist - 528.5) / 78.5;
      x = 250 - Math.cos(p * Math.PI/2) * 50 + offset * Math.sin(p * Math.PI/2);
      y = 350 + Math.sin((1-p) * Math.PI/2) * 50 + offset * Math.cos(p * Math.PI/2);
      angle = -p*90;
    } else {
      x = 200 + offset;
      y = 350 - (currDist - 607);
      angle = -90;
    }
  } else if (pathId === 'pathR2') {
    // All go left to Zone B
    x = 200 - (progress * 80);
    y = 200 + offset;
    angle = 0;
  } else if (pathId === 'pathB') {
    x = 120 - (progress * 120);
    y = 200 + offset;
    angle = 0;
  }

  return { x, y, angle };
};

export default function ConveyorLayout({ parcels, viewBox = "0 0 820 470", isRunning = true, lang = 'en' }) {
  const [hoveredParcel, setHoveredParcel] = useState(null);
  
  const stripeClass = isRunning ? "animate-stripes" : "";
  const fastStripeClass = isRunning ? "animate-stripes-fast" : "";

  return (
    <div className="w-full h-full min-h-[300px] relative glass-panel rounded-2xl overflow-hidden shadow-2xl bg-black/40 flex items-center justify-center">
      <svg className="w-full h-full max-h-[600px]" viewBox={viewBox}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g strokeLinejoin="miter" strokeLinecap="butt">
          {/* Layer 1: Red Outline */}
          <g stroke="#FF5252" strokeWidth="84" fill="none">
            <path d="M 800,200 L 640,200" />
            <path d="M 640,200 L 600,200" />
            <path d="M 600,160 L 600,20" />
            <path d="M 700,240 L 700,300" />
            <path d="M 700,300 L 800,300" />
            <path d="M 600,240 L 600,350 Q 600,400 550,400 L 250,400 Q 200,400 200,350 L 200,240" />
            <path d="M 200,200 L 120,200" />
            <path d="M 120,200 L 0,200" />
          </g>

          {/* Layer 2: Dark Belt Background */}
          <g stroke="#1e1e28" strokeWidth="80" fill="none">
            <path d="M 800,200 L 640,200" />
            <path d="M 640,200 L 600,200" />
            <path d="M 600,160 L 600,20" />
            <path d="M 700,240 L 700,300" />
            <path d="M 700,300 L 800,300" />
            <path d="M 600,240 L 600,350 Q 600,400 550,400 L 250,400 Q 200,400 200,350 L 200,240" />
            <path d="M 200,200 L 120,200" />
            <path d="M 120,200 L 0,200" />
          </g>
          
          {/* Layer 3: Animated Stripes */}
          <g stroke="#3a3a4c" strokeWidth="80" fill="none" strokeDasharray="3 20">
            <g className={stripeClass}>
              <path d="M 800,200 L 640,200" />
              <path d="M 600,240 L 600,350 Q 600,400 550,400 L 250,400 Q 200,400 200,350 L 200,240" />
              <path d="M 600,160 L 600,20" />
              <path d="M 120,200 L 0,200" />
              <path d="M 700,240 L 700,300" />
              <path d="M 700,300 L 800,300" />
            </g>
            <g className={fastStripeClass}>
              <path d="M 620,240 L 620,160" strokeWidth="40" />
              <path d="M 640,200 L 600,200" />
              <path d="M 200,200 L 120,200" />
            </g>
          </g>
        </g>
        
        {/* Node 1: Translucent cyan (half the reverse) */}
        <rect x="600" y="160" width="40" height="80" fill="#00E5FF" opacity="0.15" rx="4" />
        {/* Node 2 junction */}
        <rect x="160" y="160" width="80" height="80" fill="#536DFE" opacity="0.1" />

        {/* DWS Scanner - moved to x=700 */}
        <g transform="translate(700, 140)" style={{cursor: 'help'}}>
          <title>{lang === 'ru' ? 'DWS — Система измерения габаритов, взвешивания и сканирования штрихкодов' : 'DWS — Dimensioning, Weighing & Scanning system'}</title>
          <rect x="0" y="0" width="30" height="120" fill="transparent" stroke="#FF1744" strokeWidth="2" opacity="0.8" filter="url(#glow)" />
          <line x1="15" y1="0" x2="15" y2="120" stroke="#FF1744" strokeWidth="4" className="animate-pulse-red" />
          <text x="15" y="-10" fill="#FF1744" fontSize="12" textAnchor="middle" fontWeight="bold">DWS</text>
        </g>

        {/* Zone & Node Labels */}
        <g fontSize="14" fontWeight="bold" fontFamily="monospace">
          <text x="730" y="175" fill="rgba(255,255,255,0.6)">{lang==='ru'?'Зона':'Zone'} A</text>
          
          {/* Zone C (orange) — UP from Node 1 */}
          <circle cx="568" cy="6" r="5" fill="#fb923c" />
          <text x="580" y="10" fill="#fb923c">{lang==='ru'?'Зона':'Zone'} C</text>
          
          <text x="350" y="450" fill="rgba(255,255,255,0.6)">{lang==='ru'?'Смешанная зона':'Mixed Zone'}</text>
          
          {/* Zone B (green) — LEFT from Node 2 */}
          <circle cx="8" cy="176" r="5" fill="#4ade80" />
          <text x="18" y="180" fill="#4ade80">{lang==='ru'?'Зона':'Zone'} B</text>
          
          {/* Zone D (blue) — RIGHT from DWS (new path) */}
          <circle cx="748" cy="336" r="5" fill="#60a5fa" />
          <text x="758" y="340" fill="#60a5fa">{lang==='ru'?'Зона':'Zone'} D</text>
          
          <text x="560" y="215" fill="#00E5FF" fontSize="12">{lang==='ru'?'Узел':'Node'} 1</text>
          <text x="200" y="150" textAnchor="middle" fill="#536DFE" fontSize="12">{lang==='ru'?'Узел':'Node'} 2</text>
        </g>

        {/* Direction arrows */}
        <g fill="none" stroke="rgba(255,100,100,0.6)" strokeWidth="2">
          {/* pathA: right to left */}
          <path d="M 780,170 L 740,170 L 748,166 M 740,170 L 748,174" />
          {/* pathD (Zone C): up */}
          <path d="M 570,120 L 570,60 L 566,68 M 570,60 L 574,68" />
          {/* pathZoneD: down then right */}
          <path d="M 720,270 L 720,290 M 740,330 L 780,330 L 774,326 M 780,330 L 774,334" />
          {/* pathMix: down */}
          <path d="M 630,300 L 630,340 L 626,332 M 630,340 L 634,332" />
          {/* pathMix: left */}
          <path d="M 500,430 L 440,430 L 448,426 M 440,430 L 448,434" />
          {/* pathMix: up */}
          <path d="M 170,300 L 170,260 L 166,268 M 170,260 L 174,268" />
          {/* pathB: left */}
          <path d="M 100,170 L 50,170 L 58,166 M 50,170 L 58,174" />
        </g>

        {/* Parcels */}
        {parcels.map(p => {
          const { x, y, angle } = getPos(p.pathId, p.progress, p.offset, p.routingZone);
          // Grey before DWS (on pathA), colored after
          let bgColor = '#666';
          if (p.pathId !== 'pathA') {
            if (p.category === 'МГТ') bgColor = 'rgba(0,229,255,0.8)';
            if (p.category === 'КГТ+') bgColor = 'rgba(83,109,254,0.8)';
            if (p.category === 'СГТ') bgColor = 'rgba(255,0,255,0.8)';
          }

          const w = p.visualWidth * 0.4;
          const l = p.visualLength * 0.4;
          const rounding = parseFloat(p.rounding_factor);
          const rx = Math.min(w, l) / 2 * rounding;
          const totalAngle = (p.visualAngle || 0) + angle;
          
          return (
            <g key={p.id} transform={`translate(${x}, ${y}) rotate(${totalAngle})`}
               onMouseEnter={() => setHoveredParcel(p)}
               onMouseLeave={() => setHoveredParcel(null)}
               style={{cursor: 'pointer'}}>
              <rect x={-w/2} y={-l/2} width={w} height={l} rx={rx} ry={rx}
                    fill={bgColor} stroke={p.isJammed ? '#FF1744' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={p.isJammed ? 3 : 1}
                    filter={p.isJammed ? 'url(#glow)' : undefined} />
              {p.isJammed && <text x="0" y="4" textAnchor="middle" fontSize="10" fill="red">!</text>}
            </g>
          );
        })}
      </svg>

      {/* Parcel Tooltip */}
      {hoveredParcel && (
        <div className="absolute top-4 left-4 z-50 glass-panel p-4 rounded-xl text-white shadow-2xl max-w-xs border border-white/10">
          <div className="text-xs font-mono text-cyan-400 mb-2">{hoveredParcel.id}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300">
            <div>Weight: <span className="text-cyan-400 font-bold">{hoveredParcel.weight}kg</span></div>
            <div>Dims: <span className="text-white">{hoveredParcel.dimensions.x}×{hoveredParcel.dimensions.y}×{hoveredParcel.dimensions.z}</span></div>
            <div>Category: <span className="font-bold" style={{color: hoveredParcel.category === 'СГТ' ? '#d946ef' : hoveredParcel.category === 'КГТ+' ? '#6366f1' : '#22d3ee'}}>{hoveredParcel.category}</span></div>
            <div>Dest: <span className="text-green-400 font-bold">Zone {hoveredParcel.routingZone}</span></div>
            <div className="col-span-2">Rounding: <span className="text-white">{hoveredParcel.rounding_factor}</span> {parseFloat(hoveredParcel.rounding_factor) > 0.7 ? <span className="text-orange-400">(Round)</span> : ''}</div>
            {hoveredParcel.isJammed && <div className="col-span-2 text-red-500 font-bold animate-pulse mt-1">⚠️ JAMMED</div>}
          </div>
        </div>
      )}
    </div>
  );
}

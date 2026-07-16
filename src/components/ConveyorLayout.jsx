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
    if (routingZone === 'C') {
      x = 200 + (progress * 80);
      y = 200 - offset;
    } else {
      x = 200 - (progress * 80);
      y = 200 + offset;
    }
    angle = 0;
  } else if (pathId === 'pathB') {
    x = 120 - (progress * 120);
    y = 200 + offset;
    angle = 0;
  } else if (pathId === 'pathC') {
    x = 280 + (progress * 120);
    y = 200 - offset;
    angle = 0;
  }

  return { x, y, angle };
};

export default function ConveyorLayout({ parcels, viewBox = "0 0 800 500", isRunning = true }) {
  const [hoveredParcel, setHoveredParcel] = useState(null);
  
  // Animation classes for stripes based on whether the belt is running
  const stripeClass = isRunning ? "animate-stripes" : "";
  const fastStripeClass = isRunning ? "animate-stripes-fast" : "";

  return (
    <div className="w-full h-full min-h-[300px] relative glass-panel rounded-2xl overflow-hidden shadow-2xl mb-6 bg-black/40 flex items-center justify-center">
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
          {/* Layer 1: Red Outline (slightly thicker) */}
          <g stroke="#FF5252" strokeWidth="84" fill="none">
            <path d="M 800,200 L 640,200" />
            <path d="M 640,200 L 600,200" />
            <path d="M 600,160 L 600,20" />
            <path d="M 600,240 L 600,350 Q 600,400 550,400 L 250,400 Q 200,400 200,350 L 200,240" />
            <path d="M 200,200 L 120,200" />
            <path d="M 200,200 L 280,200" />
            <path d="M 120,200 L 0,200" />
            <path d="M 280,200 L 400,200" />
          </g>

          {/* Layer 2: Dark Blue/Grey Belt Background */}
          <g stroke="#1e1e28" strokeWidth="80" fill="none">
            <path d="M 800,200 L 640,200" />
            <path d="M 640,200 L 600,200" />
            <path d="M 600,160 L 600,20" />
            <path d="M 600,240 L 600,350 Q 600,400 550,400 L 250,400 Q 200,400 200,350 L 200,240" />
            <path d="M 200,200 L 120,200" />
            <path d="M 200,200 L 280,200" />
            <path d="M 120,200 L 0,200" />
            <path d="M 280,200 L 400,200" />
          </g>
          
          {/* Layer 3: Animated Transverse Stripes */}
          <g stroke="#3a3a4c" strokeWidth="80" fill="none" strokeDasharray="3 20">
            {/* Standard belts */}
            <g className={stripeClass}>
              <path d="M 800,200 L 640,200" />
              <path d="M 600,240 L 600,350 Q 600,400 550,400 L 250,400 Q 200,400 200,350 L 200,240" />
              <path d="M 600,160 L 600,20" />
              <path d="M 120,200 L 0,200" />
              <path d="M 280,200 L 400,200" />
            </g>
            
            {/* Reverse nodes (faster stripes) */}
            <g className={fastStripeClass}>
              {/* Node 1 Intersection (Horizontal stripes, vertical path) */}
              <path d="M 620,240 L 620,160" strokeWidth="40" />
              <path d="M 200,200 L 120,200" />
              <path d="M 200,200 L 280,200" />
            </g>
          </g>
        </g>
        
        {/* Node Junction Highlights (Optional tint over intersection) */}
        <rect x="560" y="160" width="80" height="80" fill="#00E5FF" opacity="0.1" />
        <rect x="160" y="160" width="80" height="80" fill="#536DFE" opacity="0.1" />

        <g transform="translate(640, 140)">
          <rect x="0" y="0" width="40" height="120" fill="transparent" stroke="#FF1744" strokeWidth="2" opacity="0.8" filter="url(#glow)" />
          <line x1="20" y1="0" x2="20" y2="120" stroke="#FF1744" strokeWidth="4" className="animate-pulse-red" />
          <text x="20" y="-10" fill="#FF1744" fontSize="12" textAnchor="middle" fontWeight="bold">DWS</text>
        </g>

        <g fill="rgba(255,255,255,0.6)" fontSize="14" fontWeight="bold" fontFamily="monospace">
          <text x="730" y="255">Zone A</text>
          <text x="645" y="40">Zone D</text>
          <text x="400" y="455">Mixed Zone</text>
          <text x="15" y="255">Zone B</text>
          <text x="345" y="255">Zone C</text>
          <text x="645" y="155" fill="#00E5FF">Node 1</text>
          <text x="200" y="145" textAnchor="middle" fill="#536DFE">Node 2</text>
        </g>

        {/* Direction arrows */}
        <g fill="none" stroke="rgba(255,100,100,0.6)" strokeWidth="2">
          {/* pathA: right to left */}
          <path d="M 780,170 L 700,170 L 710,165 M 700,170 L 710,175" />
          {/* pathD: down to up */}
          <path d="M 570,120 L 570,60 L 565,70 M 570,60 L 575,70" />
          {/* pathMix: down then left then up */}
          <path d="M 630,300 L 630,340 L 625,330 M 630,340 L 635,330" />
          <path d="M 500,430 L 400,430 L 410,425 M 400,430 L 410,435" />
          <path d="M 170,300 L 170,250 L 165,260 M 170,250 L 175,260" />
          {/* pathB: right to left */}
          <path d="M 100,170 L 40,170 L 50,165 M 40,170 L 50,175" />
          {/* pathC: left to right */}
          <path d="M 300,170 L 370,170 L 360,165 M 370,170 L 360,175" />
        </g>

        {parcels.map(p => {
          const { x, y, angle } = getPos(p.pathId, p.progress, p.offset, p.routingZone);
          let bgColor = '#444';
          if (p.category === 'МГТ') bgColor = 'rgba(0,229,255,0.8)';
          if (p.category === 'КГТ+') bgColor = 'rgba(83,109,254,0.8)';
          if (p.category === 'СГТ') bgColor = 'rgba(255,0,255,0.8)';

          const rx = parseFloat(p.rounding_factor) > 0.7 ? p.visualWidth/2 : 4;
          const finalAngle = angle + (p.visualAngle || 0);

          return (
            <g 
              key={p.id} 
              transform={`translate(${x}, ${y}) rotate(${finalAngle})`}
              onMouseEnter={() => setHoveredParcel(p)}
              onMouseLeave={() => setHoveredParcel(null)}
              className="cursor-pointer transition-transform duration-100"
            >
              <rect 
                x={-p.visualWidth/4} 
                y={-p.visualLength/4} 
                width={p.visualWidth/2} 
                height={p.visualLength/2} 
                rx={rx}
                fill={bgColor}
                stroke="#fff"
                strokeWidth={p.isJammed ? 2 : 1}
                strokeOpacity="0.5"
                filter="url(#glow)"
                className={p.isJammed ? 'animate-pulse-red' : ''}
              />
              {p.noRead && <text x="0" y="4" fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">?</text>}
            </g>
          );
        })}
      </svg>

      {hoveredParcel && (
        <div className="absolute top-4 left-4 glass-panel p-4 rounded-xl z-50 animate-in fade-in zoom-in duration-200 pointer-events-none">
          <div className="text-xl font-mono font-bold text-white mb-2">{hoveredParcel.noRead ? 'UNKNOWN' : hoveredParcel.id}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300">
            <div>Weight: <span className="text-cyan-400 font-bold">{hoveredParcel.weight}kg</span></div>
            <div>Dims: <span className="text-white">{hoveredParcel.dimensions.x}×{hoveredParcel.dimensions.y}×{hoveredParcel.dimensions.z}</span></div>
            <div>Category: <span className="font-bold" style={{color: hoveredParcel.category === 'СГТ' ? '#d946ef' : hoveredParcel.category === 'КГТ+' ? '#6366f1' : '#22d3ee'}}>{hoveredParcel.category}</span></div>
            <div>Dest: <span className="text-green-400 font-bold">Zone {hoveredParcel.routingZone}</span></div>
            <div className="col-span-2">Rounding Factor: <span className="text-white">{hoveredParcel.rounding_factor}</span> {parseFloat(hoveredParcel.rounding_factor) > 0.7 ? <span className="text-orange-400">(Round/Fragile)</span> : ''}</div>
            {hoveredParcel.isJammed && <div className="col-span-2 text-red-500 font-bold animate-pulse mt-1">⚠️ JAMMED</div>}
          </div>
        </div>
      )}
    </div>
  );
}

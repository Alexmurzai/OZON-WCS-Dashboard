import { useState, useEffect, useRef, useCallback } from 'react';
import { generateId, calculateRoutingZone, calculateCategory } from '../constants';

const PATH_LENGTHS = {
  pathA: 160,
  pathR1: 40,
  pathD: 180,
  pathMix: 757,
  pathR2: 80,
  pathB: 120,
  pathC: 120
};

export function useConveyorSimulation(speed, isEmulator, isEStop, isGameMode) {
  const [parcels, setParcels] = useState([]);
  const [metrics, setMetrics] = useState({
    throughput: 0,
    jamRate: 0,
    noReadRate: 0,
    historyData: Array(60).fill(0),
    totalProcessed: 0,
    catCounts: { 'МГТ': 0, 'КГТ+': 0, 'СГТ': 0 },
    zoneCounts: { 'B': 0, 'C': 0, 'D': 0 },
    oee: 100,
    availability: 100,
    performance: 100,
    quality: 100,
    // Node-specific metrics
    node1: { active: 0, throughputD: 0, throughputMix: 0 },
    node2: { active: 0, throughputB: 0, throughputC: 0 }
  });

  const parcelsRef = useRef([]);
  const lastTimeRef = useRef(null);
  const animRef = useRef(null);
  
  // Rolling window: store last 60 seconds of completion counts
  const completionWindow = useRef(Array(60).fill(0));
  const completedThisTick = useRef(0);
  const totalCompletedAllTime = useRef(0);
  const jamCounter = useRef(0);
  const noReadCounter = useRef(0);
  const totalCounter = useRef(0);
  const uptime = useRef(1);
  const downtime = useRef(0);
  const startTime = useRef(Date.now());
  
  // Per-zone exit counters (for node stats)
  const exitCountD = useRef(0);
  const exitCountMix = useRef(0);
  const exitCountB = useRef(0);
  const exitCountC = useRef(0);
  
  // Game mode jam throttle: max 2 jams per 5 minutes
  const lastJamTime = useRef(0);
  const jamsInWindow = useRef(0);
  const jamWindowStart = useRef(Date.now());

  // Metrics tick (every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return; 
      
      if (isEStop) downtime.current += 1;
      else uptime.current += 1;

      setMetrics(prev => {
        // Shift rolling window and push this tick's completed count
        const newWindow = [...completionWindow.current.slice(1), completedThisTick.current];
        completionWindow.current = newWindow;
        completedThisTick.current = 0;
        
        // Throughput: total completed in last 60s, expressed as per-minute
        const totalLast60 = newWindow.reduce((a,b)=>a+b, 0);
        const throughput = totalLast60; // already per minute (60 1s ticks)
        
        const newHistory = [...prev.historyData.slice(1), throughput];
        
        let noRead = 0;
        if (totalCounter.current > 0) {
          noRead = (noReadCounter.current / totalCounter.current) * 100;
        }
        
        const jamRate = totalCounter.current > 0 
          ? ((jamCounter.current / totalCounter.current) * 100).toFixed(1)
          : '0.0';
        
        const totalUp = uptime.current;
        const totalDown = downtime.current;
        const availability = totalUp > 0 ? (totalUp / (totalUp + totalDown)) * 100 : 100;
        
        const elapsedMinutes = (Date.now() - startTime.current) / 60000;
        const actualRate = elapsedMinutes > 0.05 ? totalCompletedAllTime.current / elapsedMinutes : 0;
        const theoreticalMax = speed * 30;
        const performance = theoreticalMax > 0 ? Math.min(100, (actualRate / theoreticalMax) * 100) : 100;
        
        const quality = 100 - noRead;
        const oee = (availability * performance * quality) / 10000;
        
        // Count active parcels per node
        const allParcels = parcelsRef.current;
        const node1Active = allParcels.filter(p => ['pathA', 'pathR1', 'pathD'].includes(p.pathId)).length;
        const node2Active = allParcels.filter(p => ['pathMix', 'pathR2', 'pathB', 'pathC'].includes(p.pathId)).length;
        
        return {
          ...prev,
          throughput,
          historyData: newHistory,
          noReadRate: noRead.toFixed(1),
          jamRate,
          availability: availability.toFixed(1),
          performance: performance.toFixed(1),
          quality: quality.toFixed(1),
          oee: oee.toFixed(1),
          node1: { active: node1Active, throughputD: exitCountD.current, throughputMix: exitCountMix.current },
          node2: { active: node2Active, throughputB: exitCountB.current, throughputC: exitCountC.current }
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isEStop, speed]);

  // Parcel generation
  useEffect(() => {
    if (!isEmulator || isEStop || speed <= 0) return;
    
    const pathAVelocity = speed * 16;
    const minClearanceTime = (85 / pathAVelocity) * 1000;
    
    const timer = setInterval(() => {
      if (document.hidden) return; 

      const isNoRead = Math.random() < 0.03;
      const x = Math.floor(Math.random() * 160) + 10;
      const y = Math.floor(Math.random() * 160) + 10;
      const z = Math.floor(Math.random() * 100) + 10;
      const weight = parseFloat((Math.random() * 40).toFixed(1));
      const rounding_factor = Math.random().toFixed(2);
      
      const category = calculateCategory(weight, x, y, z);
      const routingZone = calculateRoutingZone(x, y, z, rounding_factor, weight);

      const offset = 0; 
      const visualAngle = (Math.random() - 0.5) * 60;

      const newParcel = {
        id: generateId(),
        dimensions: { x, y, z },
        weight,
        rounding_factor,
        category,
        routingZone,
        timestamp: new Date().toISOString(),
        noRead: isNoRead,
        pathId: 'pathA',
        progress: 0,
        offset,
        visualAngle,
        isJammed: false,
        isBlocked: false,
        visualWidth: Math.max(20, Math.min(80, Math.max(x, y))),
        visualLength: Math.max(20, Math.min(80, Math.min(x, y)))
      };

      totalCounter.current += 1;
      if (isNoRead) noReadCounter.current += 1;
      
      setMetrics(m => ({
        ...m,
        totalProcessed: m.totalProcessed + 1,
        catCounts: { ...m.catCounts, [category]: m.catCounts[category] + 1 },
        zoneCounts: { ...m.zoneCounts, [routingZone]: m.zoneCounts[routingZone] + 1 }
      }));
      
      parcelsRef.current = [...parcelsRef.current, newParcel];
    }, minClearanceTime + Math.random() * 500);

    return () => clearInterval(timer);
  }, [isEmulator, isEStop, speed, isGameMode]);

  // Animation Loop
  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      if (!isEStop && speed > 0) {
        const now = Date.now();
        
        // Check jam window reset (5 minute window)
        if (now - jamWindowStart.current > 300000) {
          jamWindowStart.current = now;
          jamsInWindow.current = 0;
        }
        
        // Pass 1: Collision detection
        for (let i = 0; i < parcelsRef.current.length; i++) {
          const p = parcelsRef.current[i];
          if (p.isJammed || p.progress >= 1) continue;

          // Game mode random jams: max 2 per 5 minutes, min 30s apart
          if (isGameMode && jamsInWindow.current < 2 && (now - lastJamTime.current > 30000)) {
            // ~0.0001 chance per frame = roughly once per ~2.5 minutes at 60fps
            if (Math.random() < 0.0001) {
              p.isJammed = true;
              jamCounter.current += 1;
              jamsInWindow.current += 1;
              lastJamTime.current = now;
              continue;
            }
          }
          
          const pathLen = PATH_LENGTHS[p.pathId] || 100;
          
          // Find closest parcel ahead on same path
          let closestAhead = null;
          let closestDist = Infinity;
          
          for (let j = 0; j < parcelsRef.current.length; j++) {
            const other = parcelsRef.current[j];
            if (other.id === p.id) continue;
            if (other.pathId !== p.pathId) continue;
            if (other.progress <= p.progress) continue;
            
            const distInPixels = (other.progress - p.progress) * pathLen;
            if (distInPixels < closestDist) {
              closestDist = distInPixels;
              closestAhead = other;
            }
          }

          if (closestAhead) {
            const minSafeDist = (p.visualLength / 2) + (closestAhead.visualLength / 2);
            
            if (closestDist < minSafeDist) {
              // Stop exactly at touching distance
              p.isBlocked = true;
              // Snap progress so they touch exactly
              const touchProgress = closestAhead.progress - (minSafeDist / pathLen);
              if (touchProgress > 0) p.progress = Math.max(p.progress, touchProgress);
              
              if (isGameMode && closestAhead.isJammed) {
                p.isJammed = true; // cascade
              }
            } else {
              p.isBlocked = false;
            }
          } else {
            p.isBlocked = false;
          }
        }
        
        // Pass 2: Move
        parcelsRef.current = parcelsRef.current.map(p => {
          if (p.progress >= 1) return p;
          if (p.isJammed || p.isBlocked) return p;

          let currentSpeed = speed * 0.1; 
          if (p.pathId.includes('R1') || p.pathId.includes('R2')) {
            currentSpeed *= 3; 
          }

          let newProgress = p.progress + (currentSpeed * delta);
          let newPathId = p.pathId;

          if (newProgress >= 1) {
            if (p.pathId === 'pathA') {
              newPathId = 'pathR1';
              newProgress = 0;
            } else if (p.pathId === 'pathR1') {
              // Zone C (oversized) diverts UP at Node 1
              newPathId = p.routingZone === 'C' ? 'pathD' : 'pathMix';
              newProgress = 0;
            } else if (p.pathId === 'pathMix') {
              newPathId = 'pathR2';
              newProgress = 0;
            } else if (p.pathId === 'pathR2') {
              // Zone D (round/fragile) diverts RIGHT at Node 2
              newPathId = p.routingZone === 'D' ? 'pathC' : 'pathB';
              newProgress = 0;
            }
          }

          return { ...p, progress: newProgress, pathId: newPathId };
        });

        // Filter finished
        parcelsRef.current = parcelsRef.current.filter(p => {
          if (p.progress >= 1 && ['pathD', 'pathB', 'pathC'].includes(p.pathId)) {
            completedThisTick.current += 1;
            totalCompletedAllTime.current += 1;
            // Track per-zone exits (pathD is now Zone C position, pathC is now Zone D position)
            if (p.pathId === 'pathD') exitCountC.current += 1;
            if (p.pathId === 'pathB') exitCountB.current += 1;
            if (p.pathId === 'pathC') exitCountD.current += 1;
            return false;
          }
          // Also count parcels transitioning from pathR1 to pathMix as "passed Node 1"
          return true;
        });

        setParcels([...parcelsRef.current]);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isEStop, speed, isGameMode]);

  const clearJam = useCallback(() => {
    parcelsRef.current = parcelsRef.current.map(p => ({
      ...p,
      isJammed: false,
      isBlocked: false,
      offset: 0 
    }));
    setParcels([...parcelsRef.current]);
  }, []);

  const calibrate = useCallback(() => {
    parcelsRef.current = parcelsRef.current.map(p => ({
      ...p,
      offset: 0
    }));
    setParcels([...parcelsRef.current]);
  }, []);

  return { parcels, metrics, clearJam, calibrate };
}

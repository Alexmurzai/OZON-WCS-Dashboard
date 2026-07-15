import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Play, Square, AlertOctagon, Activity, 
  Settings, Layers, Plus, X, Server, 
  Wifi, WifiOff, Box, BarChart2, Zap, RotateCcw,
  Globe, Download, Table, PieChart, BarChart
} from 'lucide-react';

// --- I18N DICTIONARY ---
const translations = {
  en: {
    systemOp: 'System Operational',
    telemetry: 'Sorting Node Telemetry',
    addNode: 'Add Node',
    nodeNamePrefix: 'Node #',
    induction: 'Induction',
    globalOverview: 'Global Overview',
    noNodes: 'No active nodes. Add a node to begin monitoring.',
    estopActive: 'E-Stop Active',
    estopDesc: 'Conveyor Halted by Operator',
    reset: 'RESET',
    virtualEmu: 'Virtual Emulator',
    liveWs: 'Live WebSocket',
    wcsControl: 'WCS Control Panel',
    estopBtn: 'E-STOP',
    beltSpeed: 'Belt Speed',
    diverterMode: 'Diverter Mode',
    clearJam: 'Clear Jam',
    calibrate: 'Calibrate',
    lastScanned: 'Last Scanned Parcel',
    waitingData: 'Waiting for data...',
    weight: 'Weight',
    dims: 'Dims (L×W×H)',
    throughput: 'Throughput',
    throughputChart: 'Throughput (last 60s)',
    jamRate: 'Jam Rate',
    noReadRate: 'No-Read Rate',
    sgtAlertTitle: 'SGT (Oversized) Alert',
    sgtAlertDesc: 'Oversized package detection',
    detected: 'DETECTED',
    halted: 'HALTED',
    liveView: 'Live Monitor',
    statsView: 'Statistics & Analytics',
    exportCsv: 'Export CSV (Excel)',
    time: 'Time',
    parcelId: 'Parcel ID',
    category: 'Category',
    noData: 'No parcels scanned yet.',
    diverterTypes: {
      'Comitas Multibelt': 'Comitas Multibelt',
      'Sliding Shoe': 'Sliding Shoe',
      'Pop-up Wheel': 'Pop-up Wheel'
    },
    routingZone: 'Routing Zone',
    zoneB: 'B (Sortable)',
    zoneC: 'C (Oversized)',
    zoneD: 'D (Repackaging)',
    oee: 'OEE',
    availability: 'Availability',
    performance: 'Performance',
    quality: 'Quality',
    catDistribution: 'Category Distribution',
    zoneDistribution: 'Routing Distribution',
    totalProcessed: 'Total Processed',
    avgThroughput: 'Avg Throughput',
    sysHealth: 'System Health (OEE)',
    mgtFull: 'Small Goods (MGT)',
    kgtFull: 'Large Goods (KGT+)',
    sgtFull: 'Oversized (SGT)',
    zoneBFull: 'Zone B (Sortable)',
    zoneCFull: 'Zone C (Oversized)',
    zoneDFull: 'Zone D (Repackaging)',
    legendMgt: 'Small Goods (up to 25kg, max 120cm)',
    legendKgt: 'Large Goods (up to 25kg, 121-200cm)',
    legendSgt: 'Oversized (>25kg or >280cm sum)',
    legendZoneB: 'Sortable (Standard Box)',
    legendZoneC: 'Oversized (Too small/large)',
    legendZoneD: 'Repackaging (Round/Fragile)',
    legendTitle: 'Legend & Abbreviations'
  },
  ru: {
    systemOp: 'Система работает',
    telemetry: 'Телеметрия сортировочного узла',
    addNode: 'Добавить узел',
    nodeNamePrefix: 'Узел #',
    induction: 'Индукция',
    globalOverview: 'Общая сводка',
    noNodes: 'Нет активных узлов. Добавьте узел для начала.',
    estopActive: 'Аварийная Остановка',
    estopDesc: 'Конвейер остановлен оператором',
    reset: 'СБРОС',
    virtualEmu: 'Виртуальный Эмулятор',
    liveWs: 'Live WebSocket',
    wcsControl: 'Панель Управления WCS',
    estopBtn: 'АВАРИЙНЫЙ СТОП',
    beltSpeed: 'Скорость Ленты',
    diverterMode: 'Тип Сортировщика',
    clearJam: 'Сбросить Затор',
    calibrate: 'Калибровка',
    lastScanned: 'Последняя Посылка',
    waitingData: 'Ожидание данных...',
    weight: 'Вес',
    dims: 'Габариты (Д×Ш×В)',
    throughput: 'Пропускная Способность',
    throughputChart: 'Пропускная способность (60с)',
    jamRate: 'Частота Заторов',
    noReadRate: 'Процент Непрочитанных',
    sgtAlertTitle: 'Внимание: СГТ (Сверхгабарит)',
    sgtAlertDesc: 'Обнаружена крупногабаритная посылка',
    detected: 'ОБНАРУЖЕНО',
    halted: 'ОСТАНОВЛЕНО',
    liveView: 'Мониторинг',
    statsView: 'Статистика и Аналитика',
    exportCsv: 'Экспорт CSV (Excel)',
    time: 'Время',
    parcelId: 'Штрихкод',
    category: 'Категория',
    noData: 'Нет данных о посылках.',
    diverterTypes: {
      'Comitas Multibelt': 'Мультиременной (Comitas)',
      'Sliding Shoe': 'Башмачный (Sliding Shoe)',
      'Pop-up Wheel': 'Роликовый (Pop-up)'
    },
    routingZone: 'Зона Маршрутизации',
    zoneB: 'B (Сортировка)',
    zoneC: 'C (Негабарит)',
    zoneD: 'D (Доупаковка)',
    oee: 'OEE',
    availability: 'Доступность',
    performance: 'Эффективность',
    quality: 'Качество',
    catDistribution: 'Распределение Категорий',
    zoneDistribution: 'Распределение Зон',
    totalProcessed: 'Всего обработано',
    avgThroughput: 'Средняя пропускная',
    sysHealth: 'Здоровье системы (OEE)',
    mgtFull: 'Малогабарит (МГТ)',
    kgtFull: 'Крупногабарит (КГТ+)',
    sgtFull: 'Сверхгабарит (СГТ)',
    zoneBFull: 'Зона B (Сортировка)',
    zoneCFull: 'Зона C (Негабарит)',
    zoneDFull: 'Зона D (Доупаковка)',
    legendMgt: 'Малогабаритный товар (до 25кг, макс 120см)',
    legendKgt: 'Крупногабаритный товар (до 25кг, 121-200см)',
    legendSgt: 'Сверхгабаритный товар (>25кг или сум >280см)',
    legendZoneB: 'Сортировка (Стандартные коробки)',
    legendZoneC: 'Негабарит (Меньше мин. / больше макс.)',
    legendZoneD: 'Доупаковка (Круглое сечение)',
    legendTitle: 'Легенда и Расшифровка'
  }
};

// --- UTILS & CONSTANTS ---
const CATEGORY_COLORS = {
  'МГТ': 'bg-cyan-400/80 shadow-[0_0_15px_rgba(0,229,255,0.8)] border-cyan-200', 
  'КГТ+': 'bg-indigo-500/80 shadow-[0_0_15px_rgba(83,109,254,0.8)] border-indigo-300', 
  'СГТ': 'bg-fuchsia-500/90 shadow-[0_0_20px_rgba(255,0,255,1)] border-fuchsia-300', 
};

const CHART_COLORS = {
  'МГТ': '#22d3ee', // cyan-400
  'КГТ+': '#6366f1', // indigo-500
  'СГТ': '#d946ef',  // fuchsia-500
  'B': '#4ade80',    // green-400
  'C': '#fb923c',    // orange-400
  'D': '#60a5fa'     // blue-400
};

const DIVERTER_TYPES = ['Comitas Multibelt', 'Sliding Shoe', 'Pop-up Wheel'];

const generateId = () => `OZ-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Math.floor(Math.random()*99)}`;

const calculateCategory = (weight, x, y, z) => {
  const maxSide = Math.max(x, y, z);
  const sumSides = x + y + z;
  if (weight > 25 || maxSide > 200 || sumSides > 280) return 'СГТ';
  if (weight <= 25 && maxSide > 120 && sumSides > 200) return 'КГТ+';
  return 'МГТ';
};

const calculateRoutingZone = (x, y, z, roundingFactor) => {
  if (parseFloat(roundingFactor) >= 0.7) return 'D';
  const dims = [x, y, z].sort((a, b) => b - a); // [L, W, H] descending
  const L = dims[0], W = dims[1], H = dims[2];
  const isOversizedOrUndersized = L > 45 || W > 32 || H > 32 || L < 1 || W < 1 || H < 0.2;
  if (isOversizedOrUndersized) return 'C';
  return 'B';
};

// --- CUSTOM HOOKS ---

function useNodeDataPipeline(nodeId, speed, isEmulator, wsUrl, isEStop, onStatsUpdate) {
  const [parcels, setParcels] = useState([]); // limited for UI
  const [history, setHistory] = useState([]); // max 1000 for export
  const [wsStatus, setWsStatus] = useState('DISCONNECTED');
  const [metrics, setMetrics] = useState({
    throughput: 0,
    jamRate: 0.0,
    noReadRate: 0.0,
    sgtAlert: false,
    historyData: Array(60).fill(0),
    // OEE Metrics
    availability: 100,
    performance: 100,
    quality: 100,
    oee: 100,
    catCounts: { 'МГТ': 0, 'КГТ+': 0, 'СГТ': 0 },
    zoneCounts: { 'B': 0, 'C': 0, 'D': 0 }
  });

  const wsRef = useRef(null);
  const throughputCounter = useRef(0);
  const totalParcelsRef = useRef(0);
  const noReadCounterRef = useRef(0);
  const jamCounterRef = useRef(0);
  const uptimeRef = useRef(1);
  const downtimeRef = useRef(0);
  const catCountsRef = useRef({ 'МГТ': 0, 'КГТ+': 0, 'СГТ': 0 });
  const zoneCountsRef = useRef({ 'B': 0, 'C': 0, 'D': 0 });

  // Metrics tick (every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      // Update uptime/downtime for Availability calculation
      if (isEStop) downtimeRef.current += 1;
      else uptimeRef.current += 1;

      setMetrics(prev => {
        const newHistory = [...prev.historyData.slice(1), throughputCounter.current * 60]; 
        
        let noRead = 0;
        if (totalParcelsRef.current > 0) {
          noRead = (noReadCounterRef.current / totalParcelsRef.current) * 100;
        }
        
        const throughput = Math.round(newHistory.reduce((a,b)=>a+b, 0) / newHistory.length);
        const jamRate = (jamCounterRef.current / Math.max(1, (totalParcelsRef.current/100))).toFixed(2);
        
        // OEE Calculation
        const availability = (uptimeRef.current / (uptimeRef.current + downtimeRef.current)) * 100;
        const theoreticalMaxThroughput = speed * 40; // Approx max items per min at this speed
        const performance = Math.min(100, (throughput / Math.max(1, theoreticalMaxThroughput)) * 100);
        const quality = 100 - noRead;
        const oee = (availability * performance * quality) / 10000;

        const newMetrics = {
          ...prev,
          throughput,
          historyData: newHistory,
          noReadRate: noRead.toFixed(1),
          jamRate,
          availability: availability.toFixed(1),
          performance: performance.toFixed(1),
          quality: quality.toFixed(1),
          oee: oee.toFixed(1),
          catCounts: { ...catCountsRef.current },
          zoneCounts: { ...zoneCountsRef.current }
        };

        if (onStatsUpdate) onStatsUpdate(nodeId, newMetrics);

        throughputCounter.current = 0;
        return newMetrics;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isEStop, speed, nodeId, onStatsUpdate]);

  const handleNewParcel = useCallback((parcel) => {
    setParcels(prev => [parcel, ...prev].slice(0, 15));
    setHistory(prev => [parcel, ...prev].slice(0, 1000)); 
    
    throughputCounter.current += 1;
    totalParcelsRef.current += 1;
    if (parcel.noRead) noReadCounterRef.current += 1;
    else {
      catCountsRef.current[parcel.category]++;
      zoneCountsRef.current[parcel.routingZone]++;
    }
    
    if (parcel.category === 'СГТ') {
      setMetrics(m => ({ ...m, sgtAlert: true }));
      setTimeout(() => setMetrics(m => ({ ...m, sgtAlert: false })), 3000);
    }
  }, []);

  // Emulator Effect
  useEffect(() => {
    if (!isEmulator || isEStop || speed <= 0) return;
    
    const baseInterval = 1000 / (speed * 1.5); 
    
    const timer = setInterval(() => {
      const isNoRead = Math.random() < 0.03; 
      const isJam = Math.random() < 0.005; 
      if (isJam) jamCounterRef.current += 1;

      const x = Math.floor(Math.random() * 90) + 10;
      const y = Math.floor(Math.random() * 90) + 10;
      const z = Math.floor(Math.random() * 90) + 10;
      const weight = parseFloat((Math.random() * 40).toFixed(1));
      const rounding_factor = Math.random().toFixed(2);
      const category = calculateCategory(weight, x, y, z);
      const routingZone = calculateRoutingZone(x, y, z, rounding_factor);

      const parcel = {
        id: generateId(),
        dimensions: { x, y, z },
        weight,
        rounding_factor,
        category,
        routingZone,
        timestamp: new Date().toISOString(),
        noRead: isNoRead
      };
      
      handleNewParcel(parcel);
    }, baseInterval + Math.random() * 200); 

    return () => clearInterval(timer);
  }, [isEmulator, isEStop, speed, handleNewParcel]);

  // WebSocket Effect
  useEffect(() => {
    if (isEmulator) {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      setWsStatus('DISCONNECTED');
      return;
    }
    setWsStatus('CONNECTING');
    let ws = null;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => setWsStatus('CONNECTED');
      ws.onclose = () => setWsStatus('DISCONNECTED');
      ws.onerror = () => setWsStatus('DISCONNECTED');
      ws.onmessage = (event) => {
        if (isEStop) return;
        try { handleNewParcel(JSON.parse(event.data)); } catch (e) {}
      };
    } catch(e) { setWsStatus('DISCONNECTED'); }
    return () => { if (ws) ws.close(); };
  }, [isEmulator, wsUrl, handleNewParcel, isEStop]);

  useEffect(() => {
    if (!isEmulator && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command: isEStop ? "STOP" : "RESUME" }));
    }
  }, [isEStop, isEmulator]);

  const clearJam = useCallback(() => {
    jamCounterRef.current = Math.max(0, jamCounterRef.current - 1);
  }, []);

  return { parcels, history, wsStatus, metrics, clearJam };
}

// --- VISUALIZATION COMPONENTS ---

const Chart = ({ data, label }) => {
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

const ProgressRing = ({ value, label, colorClass, size = 80, strokeWidth = 8 }) => {
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
      <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">{label}</span>
    </div>
  );
};

const DonutChart = ({ dataObj, colors, title }) => {
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
    
    // For single full circle
    if (percent === 1) {
      return <circle key={key} cx="0" cy="0" r="1" fill="transparent" stroke={colors[key]} strokeWidth="0.4" />;
    }

    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    
    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`
    ].join(' ');

    return <path key={key} d={pathData} fill="transparent" stroke={colors[key]} strokeWidth="0.4" />;
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
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[key] }}></span>
            {key} <span className="opacity-50">({Math.round((dataObj[key]/total)*100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LegendWidget = ({ t }) => (
  <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
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

const ConveyorSimulation = ({ parcels, speed, isEStop, t }) => {
  const [beltParcels, setBeltParcels] = useState([]);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const addedIdsRef = useRef(new Set());
  const trackOffsetRef = useRef(0);

  useEffect(() => {
    if (parcels.length === 0) return;
    const latest = parcels[0];
    if (addedIdsRef.current.has(latest.id)) return;
    addedIdsRef.current.add(latest.id);
    if (addedIdsRef.current.size > 100) {
      const arr = [...addedIdsRef.current];
      addedIdsRef.current = new Set(arr.slice(-60));
    }

    const dims = [latest.dimensions.x, latest.dimensions.y].sort((a,b) => b - a);
    let visualWidth = Math.max(30, Math.min(130, dims[0] * 1.5));
    let visualHeight = Math.max(30, Math.min(90, dims[1] * 1.5));
    
    const maxTop = 100 - (visualHeight / 192) * 100;
    const minTop = 5;
    const randomTop = Math.floor(Math.random() * (maxTop - minTop)) + minTop;

    let borderRadius = '6px';
    if (parseFloat(latest.rounding_factor) >= 0.7) borderRadius = '50%';
    else if (parseFloat(latest.rounding_factor) >= 0.4) borderRadius = '20px';

    const rotation = Math.floor(Math.random() * 20) - 10;

    setBeltParcels(prev => {
      let newXPct = 105; 
      if (prev.length > 0) {
        const lastP = prev[prev.length - 1];
        const safeX = lastP.xPct + (lastP.visualWidth / 10) + 3; 
        if (safeX > newXPct) newXPct = safeX;
      }
      return [...prev, { ...latest, xPct: newXPct, visualWidth, visualHeight, randomTop, borderRadius, rotation }];
    });
  }, [parcels]);

  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (!isEStop && speed > 0) {
        const pctPerSec = speed * 20;
        trackOffsetRef.current = (trackOffsetRef.current + pctPerSec * delta * 0.4) % 40;
        setBeltParcels(prev => prev.map(p => ({ ...p, xPct: p.xPct - pctPerSec * delta })).filter(p => p.xPct > -15));
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isEStop, speed]);

  return (
    <div className="w-full h-48 relative glass-panel rounded-xl overflow-hidden my-6 border-b-4 border-b-white/10 shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(255,255,255,0.5) 38px, rgba(255,255,255,0.5) 40px)', backgroundPositionX: `-${trackOffsetRef.current}px` }} />
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {beltParcels.map(p => (
        <div key={p.id} className={`absolute flex items-center justify-center font-mono font-bold text-white/90 shadow-xl border border-white/20 overflow-hidden backdrop-blur-md ${CATEGORY_COLORS[p.category]}`}
          style={{ left: `${p.xPct}%`, top: `${p.randomTop}%`, width: `${p.visualWidth}px`, height: `${p.visualHeight}px`, borderRadius: p.borderRadius, transform: `rotate(${p.rotation}deg)`, opacity: isEStop ? 0.6 : 1, transition: 'opacity 0.3s' }}>
          <div className="flex flex-col items-center justify-center bg-black/40 w-full h-full p-1" style={{ transform: `rotate(${-p.rotation}deg)` }}>
            <span className="text-[9px] leading-tight text-white">{p.noRead ? '???' : p.id.slice(3, 8)}</span>
            {p.visualHeight > 40 && <span className="text-[7px] opacity-70 mt-0.5">{p.weight}kg</span>}
          </div>
        </div>
      ))}
      <div className="absolute left-[33%] top-0 bottom-0 w-10 pointer-events-none flex flex-col items-center">
        <div className="absolute top-0 bottom-0 w-[2px] bg-red-500/70 shadow-[0_0_8px_rgba(255,0,0,0.6),0_0_20px_rgba(255,0,0,0.3)]" />
        <div className="absolute -top-0 bg-red-900/80 border border-red-500/50 px-2 py-0.5 rounded-b text-[9px] text-red-400 font-bold tracking-[0.2em]">DWS</div>
      </div>
      {isEStop && (
        <div className="absolute inset-0 bg-red-900/10 flex items-center justify-center">
          <span className="text-red-500/50 font-black text-4xl tracking-[0.3em] uppercase">{t.halted}</span>
        </div>
      )}
    </div>
  );
};

// --- WORKSPACE COMPONENTS ---

const NodeWorkspace = ({ node, updateNode, removeNode, t, onStatsUpdate }) => {
  const { parcels, history, wsStatus, metrics, clearJam } = useNodeDataPipeline(node.id, node.speed, node.isEmulator, node.wsUrl, node.isEStop, onStatsUpdate);
  const [viewMode, setViewMode] = useState('live'); 
  const currentParcel = parcels[0] || null;

  const handleExportCSV = () => {
    const headers = ['Time', 'ID', 'Category', 'Routing Zone', 'Weight(kg)', 'DimX(cm)', 'DimY(cm)', 'DimZ(cm)'];
    const rows = history.map(p => {
      const catFull = p.category === 'МГТ' ? t.mgtFull : p.category === 'КГТ+' ? t.kgtFull : t.sgtFull;
      const zoneFull = p.routingZone === 'B' ? t.zoneBFull : p.routingZone === 'C' ? t.zoneCFull : t.zoneDFull;
      return [
        new Date(p.timestamp).toLocaleTimeString(),
        p.id, catFull, zoneFull, p.weight, p.dimensions.x, p.dimensions.y, p.dimensions.z
      ];
    });
    let csvContent = "\uFEFF" + headers.join(',') + "\n";
    rows.forEach(r => { csvContent += r.join(',') + "\n"; });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `ozon_${node.id}_stats_${Date.now()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="relative flex flex-col gap-6 animate-in fade-in duration-500">
      
      {node.isEStop && (
        <div className="absolute inset-0 z-50 pointer-events-none rounded-2xl border-4 border-red-500 animate-pulse-red bg-red-500/5 flex items-center justify-center">
          <div className="bg-red-900/90 border border-red-500 text-white px-8 py-4 rounded-xl shadow-[0_0_40px_red] backdrop-blur flex items-center gap-4 animate-bounce pointer-events-auto">
            <AlertOctagon size={40} className="text-red-400" />
            <div><h2 className="text-2xl font-bold uppercase tracking-wider">{t.estopActive}</h2><p className="text-sm opacity-80">{t.estopDesc}</p></div>
            <button onClick={() => updateNode(node.id, { isEStop: false })} className="ml-6 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold transition-all">{t.reset}</button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-black/40 p-1.5 rounded-lg border border-white/10 flex items-center gap-1">
            <button onClick={() => updateNode(node.id, { isEmulator: true })} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${node.isEmulator ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-gray-400 hover:text-white border border-transparent'}`}><Activity size={16} className="inline mr-2" /> {t.virtualEmu}</button>
            <button onClick={() => updateNode(node.id, { isEmulator: false })} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!node.isEmulator ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'text-gray-400 hover:text-white border border-transparent'}`}><Server size={16} className="inline mr-2" /> {t.liveWs}</button>
          </div>
          {!node.isEmulator && (
            <div className="flex items-center gap-2">
              <input type="text" value={node.wsUrl} onChange={(e) => updateNode(node.id, { wsUrl: e.target.value })} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm text-gray-300 w-64 focus:outline-none focus:border-indigo-500" placeholder="ws://localhost:8000/ws"/>
              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-bold ${wsStatus === 'CONNECTED' ? 'bg-green-500/20 text-green-400' : wsStatus === 'CONNECTING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{wsStatus === 'CONNECTED' ? <Wifi size={14}/> : <WifiOff size={14}/>} {wsStatus}</span>
            </div>
          )}
        </div>
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
          <button onClick={() => setViewMode('live')} className={`px-4 py-1.5 rounded-md text-sm transition-all ${viewMode === 'live' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}><Activity size={16} className="inline mr-1"/> {t.liveView}</button>
          <button onClick={() => setViewMode('stats')} className={`px-4 py-1.5 rounded-md text-sm transition-all ${viewMode === 'stats' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}><BarChart size={16} className="inline mr-1"/> {t.statsView}</button>
        </div>
        <button onClick={() => removeNode(node.id)} className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"><X size={20} /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Col: WCS Controls */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-200"><Settings className="text-cyan-400" /> {t.wcsControl}</h3>
          <button onClick={() => updateNode(node.id, { isEStop: !node.isEStop })} className={`w-full py-8 rounded-xl font-black text-2xl tracking-widest uppercase transition-all duration-300 shadow-xl ${node.isEStop ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] scale-95 border-2 border-red-400' : 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white border border-red-400 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.4)] active:scale-95'}`}>{t.estopBtn}</button>
          <div>
            <label className="flex justify-between text-sm text-gray-400 mb-2"><span>{t.beltSpeed}</span><span className="font-mono text-cyan-400">{node.speed.toFixed(1)} m/s</span></label>
            <input type="range" min="0" max="2.5" step="0.1" value={node.speed} onChange={(e) => updateNode(node.id, { speed: parseFloat(e.target.value) })} className="w-full accent-cyan-500" disabled={node.isEStop} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t.diverterMode}</label>
            <select value={node.diverterType} onChange={(e) => updateNode(node.id, { diverterType: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500">
              {DIVERTER_TYPES.map(type => <option key={type} value={type}>{t.diverterTypes[type]}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-auto">
            <button onClick={clearJam} className="flex-1 glass-button py-2 rounded-lg text-sm text-orange-400 font-medium flex items-center justify-center gap-1"><RotateCcw size={16} /> {t.clearJam}</button>
            <button className="flex-1 glass-button py-2 rounded-lg text-sm text-gray-300 font-medium">{t.calibrate}</button>
          </div>
        </div>

        {/* Center/Right Col */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {viewMode === 'live' ? (
            <>
              <ConveyorSimulation parcels={parcels} speed={node.speed} isEStop={node.isEStop} t={t} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Last Parcel Card */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><Box size={16} /> {t.lastScanned}</h3>
                  {currentParcel ? (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-3xl font-bold font-mono tracking-tight text-white mb-1">{currentParcel.id}</div>
                          <div className="text-sm text-gray-400">{new Date(currentParcel.timestamp).toLocaleTimeString()}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-4 py-1 rounded-full text-sm font-bold shadow-lg border ${CATEGORY_COLORS[currentParcel.category]} text-white`}>
                            {currentParcel.category === 'МГТ' ? t.mgtFull : currentParcel.category === 'КГТ+' ? t.kgtFull : t.sgtFull}
                          </div>
                          <div className={`px-3 py-0.5 rounded text-xs font-bold border ${currentParcel.routingZone === 'B' ? 'bg-green-500/20 text-green-400 border-green-500/50' : currentParcel.routingZone === 'C' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'}`}>
                            {currentParcel.routingZone === 'B' ? t.zoneBFull : currentParcel.routingZone === 'C' ? t.zoneCFull : t.zoneDFull}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-6">
                        <div className="bg-black/30 p-3 rounded-xl border border-white/5"><div className="text-[10px] text-gray-500 uppercase">{t.weight}</div><div className="text-lg font-medium text-gray-200">{currentParcel.weight} <span className="text-xs text-gray-500">kg</span></div></div>
                        <div className="bg-black/30 p-3 rounded-xl border border-white/5"><div className="text-[10px] text-gray-500 uppercase">{t.dims}</div><div className="text-md font-medium text-gray-200">{currentParcel.dimensions.x}×{currentParcel.dimensions.y}×{currentParcel.dimensions.z}</div></div>
                        <div className="bg-black/30 p-3 rounded-xl border border-white/5"><div className="text-[10px] text-gray-500 uppercase">{t.routingZone}</div><div className="text-xs font-medium text-gray-300 mt-1">Зона {currentParcel.routingZone}</div></div>
                      </div>
                    </div>
                  ) : <div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-sm">{t.waitingData}</div>}
                </div>

                {/* KPI Overview */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 uppercase tracking-widest">{t.oee}</span>
                    <span className="text-xl font-bold text-white">{metrics.oee}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden"><div className="bg-cyan-400 h-full transition-all" style={{width:`${metrics.oee}%`}}></div></div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <ProgressRing value={metrics.availability} label={t.availability} colorClass="text-indigo-400" size={60} strokeWidth={6} />
                    <ProgressRing value={metrics.performance} label={t.performance} colorClass="text-fuchsia-400" size={60} strokeWidth={6} />
                  </div>
                </div>

              </div>

              {/* Bottom Metrics Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
                  <div className="text-xs text-gray-400 flex justify-between">{t.throughput} <BarChart2 size={14}/></div>
                  <div className="text-3xl font-bold text-cyan-400">{metrics.throughput} <span className="text-sm text-gray-500 font-normal">/min</span></div>
                  <Chart data={metrics.historyData} label={t.throughputChart} />
                </div>
                <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
                  <div className="text-xs text-gray-400 flex justify-between">{t.jamRate} <AlertOctagon size={14} className={metrics.jamRate > 0 ? "text-orange-400" : ""}/></div>
                  <div className="text-3xl font-bold text-orange-400">{metrics.jamRate} <span className="text-sm text-gray-500 font-normal">%</span></div>
                  <div className="mt-4"><div className="text-xs text-gray-400 flex justify-between">{t.noReadRate}</div><div className="text-xl font-bold text-gray-300">{metrics.noReadRate}%</div></div>
                </div>
                <div className={`col-span-2 p-4 rounded-2xl flex items-center justify-between border transition-all duration-300 ${metrics.sgtAlert ? 'bg-fuchsia-500/20 border-fuchsia-500 shadow-[0_0_20px_rgba(255,0,255,0.4)]' : 'glass-panel border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${metrics.sgtAlert ? 'bg-fuchsia-500 text-white animate-pulse' : 'bg-white/5 text-gray-500'}`}><Zap size={20} /></div>
                    <div><div className={`font-bold ${metrics.sgtAlert ? 'text-fuchsia-400' : 'text-gray-400'}`}>{t.sgtAlertTitle}</div><div className="text-xs text-gray-500">{t.sgtAlertDesc}</div></div>
                  </div>
                  {metrics.sgtAlert && <div className="text-fuchsia-400 text-xs font-bold uppercase tracking-widest animate-pulse">{t.detected}</div>}
                </div>
              </div>
            </>
          ) : (
            // Statistics & Analytics View
            <div className="flex flex-col gap-6">
              
              {/* Analytics Top Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DonutChart dataObj={metrics.catCounts} colors={CHART_COLORS} title={t.catDistribution} />
                <DonutChart dataObj={metrics.zoneCounts} colors={CHART_COLORS} title={t.zoneDistribution} />
              </div>

              <LegendWidget t={t} />

              <div className="glass-panel p-6 rounded-2xl flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-200">{t.statsView}</h3>
                  <button onClick={handleExportCSV} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)]"><Download size={16} /> {t.exportCsv}</button>
                </div>
                <div className="flex-1 overflow-auto border border-white/5 rounded-xl bg-black/20">
                  <table className="w-full text-left text-sm text-gray-300 relative">
                    <thead className="text-xs text-gray-400 uppercase bg-black/40 sticky top-0 z-10 backdrop-blur-md">
                      <tr><th className="px-4 py-3">{t.time}</th><th className="px-4 py-3">{t.parcelId}</th><th className="px-4 py-3">{t.category}</th><th className="px-4 py-3">{t.routingZone}</th><th className="px-4 py-3">{t.weight} (kg)</th><th className="px-4 py-3">{t.dims} (cm)</th></tr>
                    </thead>
                    <tbody>
                      {history.length > 0 ? history.map((p, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-mono text-gray-500">{new Date(p.timestamp).toLocaleTimeString()}</td>
                          <td className="px-4 py-3 font-mono font-medium text-white">{p.noRead ? '???' : p.id}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${p.category === 'МГТ' ? 'bg-cyan-500/20 text-cyan-400' : p.category === 'КГТ+' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>
                            {p.category === 'МГТ' ? t.mgtFull : p.category === 'КГТ+' ? t.kgtFull : t.sgtFull}
                          </span></td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-[10px] font-bold ${p.routingZone === 'B' ? 'bg-green-500/20 text-green-400' : p.routingZone === 'C' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {p.routingZone === 'B' ? t.zoneBFull : p.routingZone === 'C' ? t.zoneCFull : t.zoneDFull}
                          </span></td>
                          <td className="px-4 py-3">{p.weight}</td>
                          <td className="px-4 py-3 text-gray-500">{p.dimensions.x}×{p.dimensions.y}×{p.dimensions.z}</td>
                        </tr>
                      )) : <tr><td colSpan="6" className="px-4 py-10 text-center text-gray-500">{t.noData}</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GlobalWorkspace = ({ globalStats, t }) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center">
          <PieChart className="text-cyan-400 mb-2" size={32} />
          <div className="text-sm text-gray-400 uppercase tracking-widest">{t.totalProcessed}</div>
          <div className="text-4xl font-bold text-white mt-1">{globalStats.totalParcels}</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center">
          <Activity className="text-indigo-400 mb-2" size={32} />
          <div className="text-sm text-gray-400 uppercase tracking-widest">{t.avgThroughput}</div>
          <div className="text-4xl font-bold text-white mt-1">{globalStats.totalThroughput} <span className="text-sm font-normal text-gray-500">/min</span></div>
        </div>
        <div className="glass-panel p-6 rounded-2xl col-span-1 lg:col-span-2 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400 uppercase tracking-widest flex items-center gap-2"><Settings size={16}/> {t.sysHealth}</span>
            <span className="text-2xl font-bold text-white">{globalStats.avgOee}%</span>
          </div>
          <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${globalStats.avgOee > 80 ? 'bg-green-400' : globalStats.avgOee > 50 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{width:`${globalStats.avgOee}%`}}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{t.availability}: {globalStats.avgAvailability}%</span>
            <span>{t.performance}: {globalStats.avgPerformance}%</span>
            <span>{t.quality}: {globalStats.avgQuality}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart dataObj={globalStats.catCounts} colors={CHART_COLORS} title={`${t.catDistribution} (Global)`} />
        <DonutChart dataObj={globalStats.zoneCounts} colors={CHART_COLORS} title={`${t.zoneDistribution} (Global)`} />
      </div>

      <LegendWidget t={t} />

    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [lang, setLang] = useState('ru'); 
  const t = translations[lang];

  const [nodes, setNodes] = useState([
    { id: 'node-1', name: `Node #1`, speed: 1.5, diverterType: DIVERTER_TYPES[0], isEmulator: true, isEStop: false, wsUrl: 'ws://localhost:8000/ws/node/1' }
  ]);
  const [activeNodeId, setActiveNodeId] = useState('global');
  
  // Store metrics bubbled up from hidden active nodes
  const [nodeMetrics, setNodeMetrics] = useState({});

  const handleStatsUpdate = useCallback((nodeId, metrics) => {
    setNodeMetrics(prev => ({ ...prev, [nodeId]: metrics }));
  }, []);

  const addNode = () => {
    const newId = `node-${Date.now()}`;
    setNodes(prev => [...prev, {
      id: newId, name: `Node #${prev.length + 1}`, speed: 1.5, diverterType: DIVERTER_TYPES[0], isEmulator: true, isEStop: false, wsUrl: `ws://localhost:8000/ws/node/${prev.length + 1}`
    }]);
    setActiveNodeId(newId);
  };

  const removeNode = (id) => {
    setNodes(prev => {
      const filtered = prev.filter(n => n.id !== id);
      if (activeNodeId === id) setActiveNodeId('global');
      return filtered;
    });
    setNodeMetrics(prev => {
      const newM = {...prev}; delete newM[id]; return newM;
    });
  };

  const updateNode = (id, updates) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  // Calculate Global Stats
  const globalStats = useMemo(() => {
    const vals = Object.values(nodeMetrics);
    if (vals.length === 0) return {
      totalParcels: 0, totalThroughput: 0, avgOee: 0, avgAvailability: 0, avgPerformance: 0, avgQuality: 0,
      catCounts: { 'МГТ': 0, 'КГТ+': 0, 'СГТ': 0 }, zoneCounts: { 'B': 0, 'C': 0, 'D': 0 }
    };

    let totalParcels = 0;
    let totalThroughput = 0;
    let sumOee = 0, sumAvail = 0, sumPerf = 0, sumQual = 0;
    let cats = { 'МГТ': 0, 'КГТ+': 0, 'СГТ': 0 };
    let zones = { 'B': 0, 'C': 0, 'D': 0 };

    vals.forEach(m => {
      totalThroughput += m.throughput;
      sumOee += parseFloat(m.oee) || 0;
      sumAvail += parseFloat(m.availability) || 0;
      sumPerf += parseFloat(m.performance) || 0;
      sumQual += parseFloat(m.quality) || 0;
      
      cats['МГТ'] += m.catCounts['МГТ']; cats['КГТ+'] += m.catCounts['КГТ+']; cats['СГТ'] += m.catCounts['СГТ'];
      zones['B'] += m.zoneCounts['B']; zones['C'] += m.zoneCounts['C']; zones['D'] += m.zoneCounts['D'];
      totalParcels += m.catCounts['МГТ'] + m.catCounts['КГТ+'] + m.catCounts['СГТ'];
    });

    const len = vals.length;
    return {
      totalParcels,
      totalThroughput,
      avgOee: (sumOee / len).toFixed(1),
      avgAvailability: (sumAvail / len).toFixed(1),
      avgPerformance: (sumPerf / len).toFixed(1),
      avgQuality: (sumQual / len).toFixed(1),
      catCounts: cats,
      zoneCounts: zones
    };
  }, [nodeMetrics]);

  return (
    <div className="min-h-screen pb-12">
      <header className="glass-panel sticky top-0 z-40 border-b border-white/10 px-6 py-4 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,191,255,0.4)]">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              OZON <span className="font-light">WCS Dashboard</span>
            </h1>
            <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase">{t.telemetry}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 items-center">
            <Globe size={14} className="mx-2 text-gray-500" />
            <button onClick={() => setLang('ru')} className={`px-2 py-1 rounded text-xs transition-all ${lang === 'ru' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-white'}`}>RU</button>
            <button onClick={() => setLang('en')} className={`px-2 py-1 rounded text-xs transition-all ${lang === 'en' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-white'}`}>EN</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#00E676]"></div>
            {t.systemOp}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveNodeId('global')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border flex items-center gap-2
              ${activeNodeId === 'global' ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(0,191,255,0.2)]' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
          >
            <PieChart size={16} /> {t.globalOverview}
          </button>
          <div className="w-px h-6 bg-white/10 mx-2"></div>

          {nodes.map(node => (
            <button
              key={node.id}
              onClick={() => setActiveNodeId(node.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border flex items-center gap-2
                ${activeNodeId === node.id ? 'bg-white/10 border-white/20 text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)]' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              {node.isEStop && <AlertOctagon size={14} className="text-red-500" />}
              {node.name.replace('Node #', t.nodeNamePrefix)} {t.induction}
            </button>
          ))}
          <button onClick={addNode} className="px-4 py-2.5 rounded-full text-sm font-medium border border-dashed border-gray-600 text-gray-400 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all flex items-center gap-1">
            <Plus size={16} /> {t.addNode}
          </button>
        </div>

        {/* Render ALL nodes to preserve emulator state, but hide inactive ones */}
        <div className={activeNodeId === 'global' ? 'block' : 'hidden'}>
          <GlobalWorkspace globalStats={globalStats} t={t} />
        </div>

        {nodes.map(node => (
          <div key={node.id} className={activeNodeId === node.id ? 'block' : 'hidden'}>
            <NodeWorkspace 
              node={node} 
              updateNode={updateNode} 
              removeNode={removeNode}
              t={t}
              onStatsUpdate={handleStatsUpdate}
            />
          </div>
        ))}

        {nodes.length === 0 && activeNodeId !== 'global' && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Layers size={48} className="mb-4 opacity-50" />
            <p>{t.noNodes}</p>
          </div>
        )}
      </main>
    </div>
  );
}

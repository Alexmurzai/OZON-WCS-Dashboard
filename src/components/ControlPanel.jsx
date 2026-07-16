import React from 'react';
import { Settings, RotateCcw, Crosshair } from 'lucide-react';
import { DIVERTER_TYPES } from '../constants';

export default function ControlPanel({ 
  isEStop, setIsEStop, 
  speed, setSpeed, 
  isGameMode, setIsGameMode, 
  clearJam, calibrate, 
  t 
}) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
        <Settings className="text-cyan-400" /> {t.wcsControl}
      </h3>
      
      <button 
        onClick={() => setIsEStop(!isEStop)} 
        className={`w-full py-8 rounded-xl font-black text-2xl tracking-widest uppercase transition-all duration-300 shadow-xl ${isEStop ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] scale-95 border-2 border-red-400' : 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white border border-red-400 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.4)] active:scale-95'}`}
      >
        {t.estopBtn}
      </button>
      
      <div>
        <label className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{t.beltSpeed}</span>
          <span className="font-mono text-cyan-400">{speed.toFixed(1)} m/s</span>
        </label>
        <input 
          type="range" min="0.5" max="3.0" step="0.1" 
          value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} 
          className="w-full accent-cyan-500 cursor-pointer" 
          disabled={isEStop} 
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">{t.modeSelector}</label>
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
          <button 
            onClick={() => setIsGameMode(false)} 
            className={`flex-1 py-2 rounded-md text-sm transition-all ${!isGameMode ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-white'}`}
          >
            {t.idealMode}
          </button>
          <button 
            onClick={() => setIsGameMode(true)} 
            className={`flex-1 py-2 rounded-md text-sm transition-all ${isGameMode ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-500 hover:text-white'}`}
          >
            {t.gameMode}
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 mt-auto">
        <button 
          onClick={clearJam} 
          disabled={!isGameMode || !isEStop}
          className="flex-1 glass-button py-2 rounded-lg text-sm text-orange-400 font-medium flex items-center justify-center gap-1 disabled:opacity-30"
          title={!isEStop ? 'Остановите конвейер (E-STOP) для сброса затора' : ''}
        >
          <RotateCcw size={16} /> {t.clearJam}
        </button>
        <button 
          onClick={calibrate}
          disabled={!isGameMode}
          className="flex-1 glass-button py-2 rounded-lg text-sm text-cyan-400 font-medium flex items-center justify-center gap-1 disabled:opacity-30"
        >
          <Crosshair size={16} /> {t.calibrate}
        </button>
      </div>
    </div>
  );
}

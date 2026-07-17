import React from 'react';
import { Download, History } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';
import { downloadCSV } from '../utils/export';

export default function ParcelHistoryTable({ title = "Parcel History", parcels = [], lang = 'en', filename = "parcel-history.csv" }) {
  // Only show the latest 200 parcels in UI to prevent lag
  const displayParcels = parcels.slice().reverse().slice(0, 200);

  const handleExport = () => {
    downloadCSV(parcels, filename);
  };

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">{title}</h2>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
            {parcels.length} {lang === 'ru' ? 'всего' : 'total'}
          </span>
        </div>
        <button 
          onClick={handleExport}
          title={lang === 'ru' ? 'Выгрузить в Excel (CSV)' : 'Export to Excel (CSV)'}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-5 text-[10px] text-gray-500 uppercase tracking-widest px-4 py-2 border-b border-white/5">
        <div>ID</div>
        <div>{lang === 'ru' ? 'Кат.' : 'Cat.'}</div>
        <div>{lang === 'ru' ? 'Вес' : 'Wt.'}</div>
        <div>{lang === 'ru' ? 'Зона' : 'Zone'}</div>
        <div>{lang === 'ru' ? 'Время' : 'Time'}</div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {displayParcels.map(p => {
          const color = CATEGORY_COLORS[p.category] || '#94a3b8';
          return (
            <div key={p.id + p.timestamp} className="grid grid-cols-5 items-center px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded cursor-default transition-colors text-xs border border-white/5">
              <div className="text-gray-300 font-mono">{p.id}</div>
              <div style={{ color }} className="font-bold">{p.category}</div>
              <div className="text-gray-400">{p.weight}</div>
              <div className="text-gray-300">{p.routingZone}</div>
              <div className="text-gray-500 text-[10px]">
                {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          );
        })}
        {parcels.length === 0 && (
          <div className="text-center text-gray-500 text-xs mt-10">
            {lang === 'ru' ? 'Нет данных' : 'No data'}
          </div>
        )}
      </div>
    </div>
  );
}

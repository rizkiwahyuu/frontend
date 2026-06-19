import React from 'react';
import { Check, Layers3 } from 'lucide-react';

const LEGEND_META = {
  komdigi: { label: 'Jaringan Fiber Komdigi', dot: 'bg-teal-700' },
  disturbances: { label: 'Monitoring Gangguan', dot: 'bg-red-500' },
};

export default function MapLegend({ layerVisibility, onToggle }) {
  return (
    <div className="absolute bottom-6 right-6 w-64 bg-white/96 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl z-[1000]">
      <div className="mb-2 flex items-center gap-2">
        <Layers3 size={15} className="text-slate-500" />
      </div>
      <div className="space-y-2">
        {Object.entries(LEGEND_META).map(([key, item]) => {
          const active = !!layerVisibility[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                active ? 'border-brand-200 bg-brand-50/70 text-slate-900' : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${item.dot}`} />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                active ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 bg-white text-transparent'
              }`}>
                <Check size={12} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';

export default function Input({ label, id, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className="w-full border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50"
        {...props}
      />
    </div>
  );
}

export function Textarea({ label, id, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className="w-full border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        {...props}
      />
    </div>
  );
}

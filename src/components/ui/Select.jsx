import React from 'react';

export default function Select({ label, id, options = [], className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        className="w-full border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

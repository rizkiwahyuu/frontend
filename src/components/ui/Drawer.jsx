import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, subtitle, children, actions }) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-card shadow-2xl flex flex-col animate-fade-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-start shrink-0 sticky top-0 bg-white rounded-t-card z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {actions && (
          <div className="p-4 border-t border-slate-100 flex gap-3 shrink-0">{actions}</div>
        )}
      </div>
    </div>,
    document.body
  );
}

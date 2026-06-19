import React from 'react';
import { PRIORITY_COLORS, STATUS_COLORS, SEVERITY_COLORS, SEVERITY_LABELS } from '../../utils/statusColor';
import { PRIORITY_LABELS, STATUS_LABELS } from '../../services/api';

export default function Badge({ status, className = '' }) {
  const color = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${color} ${className}`}>
      {label}
    </span>
  );
}

export function SeverityBadge({ level }) {
  const color = SEVERITY_COLORS[level] || 'bg-slate-100 text-slate-600';
  const label = SEVERITY_LABELS[level] || level;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${color}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] || 'bg-slate-100 text-slate-600';
  const label = PRIORITY_LABELS[priority] || priority;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${color}`}>
      {label}
    </span>
  );
}

import React from 'react';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100',
  danger: 'bg-danger text-white hover:bg-red-700',
  ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
  dark: 'bg-navy-800 text-white hover:bg-navy-900',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

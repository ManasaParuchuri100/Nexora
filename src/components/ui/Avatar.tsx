import React from 'react';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

const TONES = [
  'bg-brand-soft text-brand',
  'bg-ok-soft text-ok',
  'bg-warn-soft text-warn',
  'bg-info-soft text-info',
  'bg-hot-soft text-hot',
];

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getTone(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TONES.length;
  return TONES[index];
}

export function Avatar({ name, size = 'md', icon, className = '' }: AvatarProps) {
  const sizeClasses =
    size === 'sm'
      ? 'w-6 h-6 text-xs'
      : size === 'lg'
      ? 'w-10 h-10 text-sm'
      : 'w-8 h-8 text-xs';

  const toneClass = getTone(name || '');
  const initials = getInitials(name || '');

  return (
    <div
      aria-label={name}
      title={name}
      className={`relative inline-flex items-center justify-center rounded-lg font-bold select-none shrink-0 border border-line-subtle ${sizeClasses} ${toneClass} ${className}`}
    >
      {icon ? <span className="inline-flex shrink-0">{icon}</span> : <span>{initials}</span>}
    </div>
  );
}

import React from 'react';

/**
 * Video-call platforms supported for scheduled calls.
 * Google Meet uses its Simple Icons mark (CC0-1.0). Zoom's Simple Icons mark is a
 * wordmark that is unreadable at icon size, and Microsoft asked Simple Icons to
 * remove the Teams mark, so both use simple brand-coloured marks instead.
 */
export type MeetingPlatform = 'zoom' | 'meet' | 'teams';

export const PLATFORM_LABELS: Record<MeetingPlatform, string> = {
  zoom: 'Zoom',
  meet: 'Google Meet',
  teams: 'Microsoft Teams',
};

export const PLATFORM_COLORS: Record<MeetingPlatform, string> = {
  zoom: '#0B5CFF',
  meet: '#00897B',
  teams: '#5059C9',
};

const PATHS: Record<'meet', string> & { zoom?: string } = {
  zoom: 'M5.033 14.649H.743a.74.74 0 0 1-.686-.458.74.74 0 0 1 .16-.808L3.19 10.41H1.06A1.06 1.06 0 0 1 0 9.35h3.957c.301 0 .57.18.686.458a.74.74 0 0 1-.161.808L1.51 13.59h2.464c.585 0 1.06.475 1.06 1.06zM24 11.338c0-1.14-.927-2.066-2.066-2.066-.61 0-1.158.265-1.537.686a2.061 2.061 0 0 0-1.536-.686c-1.14 0-2.066.926-2.066 2.066v3.311a1.06 1.06 0 0 0 1.06-1.06v-2.251a1.004 1.004 0 0 1 2.013 0v2.251c0 .586.474 1.06 1.06 1.06v-3.311a1.004 1.004 0 0 1 2.012 0v2.251c0 .586.475 1.06 1.06 1.06zM16.265 12a2.728 2.728 0 1 1-5.457 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0zm-4.82 0a2.728 2.728 0 1 1-5.458 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0z',
  meet: 'M5.53 2.13 0 7.75h5.53zm.398 0v5.62h7.608v3.65l5.47-4.45c-.014-1.22.031-2.25-.025-3.46-.148-1.09-1.287-1.47-2.236-1.36zM23.1 4.32c-.802.295-1.358.995-2.047 1.49-2.506 2.05-4.982 4.12-7.468 6.19 3.025 2.59 6.04 5.18 9.065 7.76 1.218.671 1.428-.814 1.328-1.64v-13a.828.828 0 0 0-.877-.825zM.038 8.15v7.7h5.53v-7.7zm13.577 8.1H6.008v5.62c3.864-.006 7.737.011 11.58-.009 1.02-.07 1.618-1.12 1.468-2.07v-2.51l-5.47-4.68v3.65zm-13.577 0c.02 1.44-.041 2.88.033 4.31.162.948 1.158 1.43 2.047 1.31h3.464v-5.62z',
};

export function PlatformLogo({ platform, className = 'w-4 h-4' }: { platform: MeetingPlatform; className?: string }) {
  if (platform === 'zoom') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
        <rect x="6" y="8.5" width="8.5" height="7" rx="1.6" fill="#fff" />
        <path d="M15.5 11l3-2v6l-3-2z" fill="#fff" />
      </svg>
    );
  }
  if (platform === 'teams') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" />
        <path d="M7.5 8h9v2.2h-3.4V17h-2.2v-6.8H7.5z" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={PATHS.meet} />
    </svg>
  );
}

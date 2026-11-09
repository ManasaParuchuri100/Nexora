import React from 'react';
import { Badge, BadgeTone } from './Badge';

/**
 * One shared mapping from domain values to a badge tone.
 * Lifecycle stage, temperature and publishing status stay separate families.
 * The label is always shown as text, so colour is never the only signal.
 */
const TONES: Record<string, BadgeTone> = {
  // Lead temperature
  HOT: 'hot',
  WARM: 'warning',
  COLD: 'neutral',
  // Lead lifecycle
  New: 'info',
  Engaged: 'brand',
  Qualified: 'brand',
  Contacted: 'neutral',
  Proposal: 'warning',
  Negotiation: 'warning',
  'Offer sent': 'warning',
  Converted: 'success',
  Won: 'success',
  'Deal closed': 'success',
  Lost: 'danger',
  // Campaigns and content
  Draft: 'neutral',
  Planning: 'info',
  Active: 'success',
  Completed: 'neutral',
  Scheduled: 'brand',
  Queued: 'brand',
  Approved: 'success',
  'Draft Review': 'warning',
  'Awaiting approval': 'warning',
  Dispatched: 'success',
  Published: 'success',
  Failed: 'danger',
  // Connections
  Connected: 'success',
  'Re-auth Required': 'warning',
  Disconnected: 'danger',
};

export function statusTone(status: string): BadgeTone {
  return TONES[status] ?? 'neutral';
}

export function StatusBadge({ status, label, className = '' }: { status: string; label?: React.ReactNode; className?: string }) {
  return (
    <Badge tone={statusTone(status)} className={className}>
      {label ?? status}
    </Badge>
  );
}

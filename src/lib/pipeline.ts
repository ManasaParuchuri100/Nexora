import { BadgeTone } from '../components/ui/Badge';
import { LeadStatus } from '../types';

export const PIPELINE_STAGES = [
  'New',
  'Engaged',
  'Qualified',
  'Proposal',
  'Won',
  'Lost'
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];

export const STAGE_PROBABILITY: Record<PipelineStage, number> = {
  New: 10,
  Engaged: 25,
  Qualified: 50,
  Proposal: 70,
  Won: 100,
  Lost: 0,
};

/**
 * Normalizes any legacy or alternative stage/status name into one of the 6 canonical pipeline stages.
 */
export function normalizeStage(raw?: string): PipelineStage {
  if (!raw) return 'New';
  const trimmed = raw.trim();
  if (trimmed === 'New') return 'New';
  if (trimmed === 'Engaged' || trimmed === 'Contacted') return 'Engaged';
  if (trimmed === 'Qualified' || trimmed === 'Negotiation') return 'Qualified';
  if (trimmed === 'Proposal' || trimmed === 'Offer sent') return 'Proposal';
  if (trimmed === 'Won' || trimmed === 'Deal closed' || trimmed === 'Converted') return 'Won';
  if (trimmed === 'Lost') return 'Lost';
  return 'New';
}

/**
 * Gets the normalized canonical stage from a lead record.
 */
export function getLeadStage(lead?: { stage?: string; status?: string } | null): PipelineStage {
  if (!lead) return 'New';
  return normalizeStage(lead.stage || lead.status);
}

/**
 * Maps a pipeline stage to a UI BadgeTone.
 */
export function stageTone(stage: string): BadgeTone {
  const normalized = normalizeStage(stage);
  switch (normalized) {
    case 'Won':
      return 'success';
    case 'Lost':
      return 'danger';
    case 'Proposal':
      return 'brand';
    case 'Qualified':
      return 'info';
    case 'Engaged':
      return 'warning';
    case 'New':
    default:
      return 'neutral';
  }
}

/**
 * Maps a stage to its corresponding pipeline status.
 */
export function stageToStatus(stage?: string): LeadStatus {
  const normalized = normalizeStage(stage);
  switch (normalized) {
    case 'New':
      return 'New';
    case 'Engaged':
      return 'Engaged';
    case 'Qualified':
      return 'Qualified';
    case 'Proposal':
      return 'Proposal';
    case 'Won':
      return 'Won';
    case 'Lost':
      return 'Lost';
    default:
      return 'New';
  }
}

/**
 * Formats an amount in INR:
 * >= 1 crore "₹1.2Cr", >= 1 lakh "₹6.5L", >= 1000 "₹18.5k", otherwise "₹950".
 * Returns "—" for 0 or undefined.
 */
export function formatINR(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) {
    return '—';
  }
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    const formatted = cr % 1 === 0 ? cr.toString() : Number(cr.toFixed(2)).toString();
    return `₹${formatted}Cr`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    const formatted = l % 1 === 0 ? l.toString() : Number(l.toFixed(2)).toString();
    return `₹${formatted}L`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    const formatted = k % 1 === 0 ? k.toString() : Number(k.toFixed(1)).toString();
    return `₹${formatted}k`;
  }
  return `₹${Math.round(amount)}`;
}

/**
 * Asserts data integrity between leads and inbox conversations.
 * Logs console warnings for:
 * 1. Dangling leadReferenceId in conversations
 * 2. Duplicate lead IDs
 * 3. Leads whose name equals their company
 */
export function assertDataIntegrity(
  leads: Array<{ id: string; name?: string; company?: string; [key: string]: any }>,
  conversations: Array<{ id: string; leadReferenceId?: string; [key: string]: any }>
): void {
  // 1. Check duplicate lead IDs
  const leadIdSet = new Set<string>();
  const duplicates = new Set<string>();
  for (const lead of leads) {
    if (leadIdSet.has(lead.id)) {
      duplicates.add(lead.id);
    }
    leadIdSet.add(lead.id);
  }
  if (duplicates.size > 0) {
    console.warn(`[DataIntegrity] Found duplicate lead IDs:`, Array.from(duplicates));
  }

  // 2. Check dangling leadReferenceId in conversations
  const dangling = conversations.filter(
    (c) => c.leadReferenceId && !leadIdSet.has(c.leadReferenceId)
  );
  if (dangling.length > 0) {
    console.warn(
      `[DataIntegrity] Found conversations with dangling leadReferenceId:`,
      dangling.map((c) => ({ convoId: c.id, leadReferenceId: c.leadReferenceId }))
    );
  }

  // 3. Check leads whose name equals their company
  const nameEqualsCompany = leads.filter(
    (l) => l.name && l.company && l.name.trim().toLowerCase() === l.company.trim().toLowerCase()
  );
  if (nameEqualsCompany.length > 0) {
    console.warn(
      `[DataIntegrity] Found leads whose name equals their company:`,
      nameEqualsCompany.map((l) => ({ id: l.id, name: l.name, company: l.company }))
    );
  }
}

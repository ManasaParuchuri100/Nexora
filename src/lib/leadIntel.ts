import { LeadRecord, LeadTemperature, LeadStage, LeadStatus } from '../types';
import { ConversationItem } from '../data/conversations';

export interface QualificationCheckItem {
  key: string;
  label: string;
  status: 'verified' | 'unknown' | 'missing';
  detail: string;
}

export interface ScoreSignalItem {
  label: string;
  points: number;
}

/**
 * Derives the lead temperature.
 * Score >= 85 -> HOT, 65-84 -> WARM, else COLD.
 * If lead.temperatureOverride is set, it wins.
 */
export function deriveTemperature(
  score: number,
  override?: LeadTemperature
): LeadTemperature {
  if (override === 'HOT' || override === 'WARM' || override === 'COLD') {
    return override;
  }
  if (score >= 85) return 'HOT';
  if (score >= 65) return 'WARM';
  return 'COLD';
}

/**
 * Derives 5 qualification checks for a lead, incorporating conversation data if linked.
 */
export function deriveQualification(
  lead: LeadRecord,
  conversation?: ConversationItem
): QualificationCheckItem[] {
  // 1. Requirement
  const hasConvoReq = conversation?.qualification?.requirement;
  const reqDetail =
    lead.requirement ||
    (hasConvoReq ? 'Requirement captured' : undefined) ||
    lead.description ||
    'Not yet defined';
  const reqVerified = Boolean(
    lead.requirement || hasConvoReq || lead.description
  );

  // 2. Budget
  const budgetVal = lead.budget || conversation?.qualification?.budget;

  // 3. Timeline
  const timelineVal = lead.timeline || conversation?.qualification?.timeline;

  // 4. Decision Maker
  const dmVal =
    lead.decisionMaker !== undefined
      ? lead.decisionMaker
      : conversation?.qualification?.decisionMaker;

  let dmStatus: 'verified' | 'unknown' | 'missing' = 'unknown';
  let dmDetail = 'Authority not yet determined';
  if (dmVal === true) {
    dmStatus = 'verified';
    dmDetail = 'Prospect has purchasing authority';
  } else if (dmVal === false) {
    dmStatus = 'missing';
    dmDetail = 'Requires approval from another stakeholder';
  }

  // 5. Channel Verified
  const channelVal = lead.preferredChannel || lead.source || conversation?.channel;

  return [
    {
      key: 'requirement',
      label: 'Requirement defined',
      status: reqVerified ? 'verified' : 'unknown',
      detail: reqDetail
    },
    {
      key: 'budget',
      label: 'Budget confirmed',
      status: budgetVal ? 'verified' : 'unknown',
      detail: budgetVal || 'Not specified'
    },
    {
      key: 'timeline',
      label: 'Timeline agreed',
      status: timelineVal ? 'verified' : 'unknown',
      detail: timelineVal || 'Not specified'
    },
    {
      key: 'decisionMaker',
      label: 'Decision-maker identified',
      status: dmStatus,
      detail: dmDetail
    },
    {
      key: 'channel',
      label: 'Channel verified',
      status: channelVal ? 'verified' : 'unknown',
      detail: channelVal ? `Verified via ${channelVal}` : 'Inbound channel'
    }
  ];
}

/**
 * Derives score signals from conversation whyPoints or lead data.
 */
export function deriveScoreSignals(
  lead: LeadRecord,
  conversation?: ConversationItem
): ScoreSignalItem[] {
  if (conversation?.whyPoints && conversation.whyPoints.length > 0) {
    return conversation.whyPoints.map((pt) => {
      const isPositive = pt.trim().startsWith('+');
      const isNegative = pt.trim().startsWith('-');
      let rawText = pt.replace(/^[+-]\s*/, '').trim();

      // Check if points are written in parentheses or numbers
      const numMatch = rawText.match(/([+-]?\d+)\s*(pts|points)?/i);
      let points = isPositive ? 20 : isNegative ? -15 : 15;
      if (numMatch) {
        points = parseInt(numMatch[1], 10);
      }

      // Sentence case label
      const cleanLabel = rawText.charAt(0).toUpperCase() + rawText.slice(1);
      return {
        label: cleanLabel,
        points
      };
    });
  }

  // Fallback: derive signals purely from lead characteristics
  const signals: ScoreSignalItem[] = [];

  if (lead.score >= 85) {
    signals.push({ label: 'High purchase intent signals', points: 30 });
  } else if (lead.score >= 65) {
    signals.push({ label: 'Active solution evaluation', points: 20 });
  } else {
    signals.push({ label: 'Initial inquiry & discovery', points: 10 });
  }

  if (lead.budget) {
    signals.push({ label: `Confirmed budget allocation (${lead.budget})`, points: 25 });
  }

  if (lead.timeline) {
    signals.push({ label: `Defined implementation timeline (${lead.timeline})`, points: 20 });
  }

  if (lead.decisionMaker === true) {
    signals.push({ label: 'Direct purchasing authority confirmed', points: 15 });
  } else if (lead.decisionMaker === false) {
    signals.push({ label: 'Requires secondary stakeholder approval', points: -10 });
  }

  if (lead.source) {
    signals.push({ label: `Verified inbound touchpoint (${lead.source})`, points: 10 });
  }

  return signals;
}

/**
 * Maps a stage to its corresponding pipeline status.
 * Stage acts as the single source of truth.
 */
export function stageToStatus(stage?: LeadStage): LeadStatus {
  if (!stage) return 'New';

  switch (stage) {
    case 'New':
      return 'New';
    case 'Engaged':
      return 'Engaged';
    case 'Contacted':
      return 'Contacted';
    case 'Qualified':
      return 'Qualified';
    case 'Proposal':
    case 'Negotiation':
    case 'Offer sent':
      return 'Proposal';
    case 'Won':
    case 'Deal closed':
      return 'Won';
    case 'Lost':
      return 'Lost';
    default:
      return 'Contacted';
  }
}

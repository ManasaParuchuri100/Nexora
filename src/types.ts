export interface NavItem {
  label: string;
  href: string;
}

export interface FeatureItem {
  number: string;
  title: string;
  description: string;
  subtext: string;
  iconName: 'sparkles' | 'calendar' | 'layers';
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
  detail: string;
}

// Navigation structure for authenticated Nexora
export type NavCategory = 
  | 'overview'
  | 'engage'
  | 'leads'
  | 'content'
  | 'campaigns'
  | 'analytics'
  | 'settings'
  // Backwards-compatible aliases
  | 'insights'
  | 'creative-lab'
  | 'social-hub'
  | 'assistant';

export type SubCategory = 
  // Engage subcategories
  | 'inbox'
  | 'conversations'
  | 'human-handoff'
  // Leads subcategories
  | 'all-leads'
  | 'pipeline'
  | 'follow-ups'
  // Content subcategories
  | 'ai-content'
  | 'social-posts'
  | 'content-library'
  // Campaigns subcategories
  | 'campaigns-list'
  | 'create-campaign'
  | 'campaign-performance'
  // Analytics subcategories
  | 'analytics-overview'
  | 'lead-analytics'
  | 'channel-performance'
  // Settings subcategories
  | 'business-profile'
  | 'channels'
  | 'ai-automation'
  | 'team-access'
  // Legacy & general subcategories
  | 'live-leads'
  | 'stats'
  | 'trending-topics'
  | 'quick-actions'
  | 'campaigns-overview'
  | 'create'
  | 'generated-assets'
  | 'connect'
  | 'ai-guided-creation'
  | 'manual-scheduling'
  | 'lead-automation'
  | 'generated-responses'
  | 'overview'
  | 'default';

export type LeadStage = 'Contacted' | 'Negotiation' | 'Offer sent' | 'Deal closed';
export type LeadTag = 'New lead' | 'Returning' | 'Priority' | 'Follow-up';
export type LeadTemperature = 'HOT' | 'WARM' | 'COLD';
export type LeadHandlingMode = 'AI' | 'HUMAN';

export interface LeadAssignee {
  name: string;
  role: string;
  avatar?: string;
}

export interface LeadMessage {
  id: string;
  sender: 'customer' | 'ai' | 'human';
  senderName: string;
  text: string;
  time: string;
  channel?: string;
}

export interface LeadTimelineEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  type: 'message' | 'ai_action' | 'qualification' | 'assignment' | 'status_change' | 'follow_up' | 'handoff' | 'campaign';
}

export interface LeadFollowUp {
  id: string;
  title: string;
  dueTime: string;
  isCompleted: boolean;
  type: 'upcoming' | 'previous';
}

export interface CampaignAttribution {
  campaignName: string;
  adName?: string;
  firstTouch?: string;
  lastTouch?: string;
  leadsGenerated?: number;
  status?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: 'Organic Search' | 'LinkedIn' | 'Referral' | 'X (Twitter)' | 'Newsletter' | 'Product Hunt' | 'Instagram' | 'Website' | 'WhatsApp' | 'Campaign' | 'Manual';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Converted' | 'Engaged' | 'Won' | 'Lost';
  value: string;
  lastActivity: string;
  score: number;
  stage?: LeadStage;
  tag?: LeadTag;
  description?: string;
  assignee?: LeadAssignee;
  date?: string;
  attachmentsCount?: number;
  messagesCount?: number;
  isPriority?: boolean;
  phone?: string;
  title?: string;
  location?: string;
  requirement?: string;
  productInterested?: string;
  budget?: string;
  timeline?: string;
  decisionMaker?: boolean;
  preferredChannel?: string;
  companySize?: string;
  temperature?: LeadTemperature;
  intentLevel?: string;
  purchaseReadiness?: string;
  aiConfidence?: string;
  aiRecommendation?: string;
  qualificationChecks?: string[];
  conversationSummary?: string;
  messages?: LeadMessage[];
  timelineEvents?: LeadTimelineEvent[];
  followUps?: LeadFollowUp[];
  internalNotes?: string[];
  tags?: string[];
  handlingMode?: LeadHandlingMode;
  humanAttentionRequired?: boolean;
  campaignAttribution?: CampaignAttribution;
}

export interface TrendingTopic {
  id: string;
  name: string;
  category: string;
  growth: string;
  isPositive: boolean;
  volume: string;
  relevantCampaign: string;
}

export interface StatMetric {
  id: string;
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  timeframe: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  channel: string;
  status: 'Draft' | 'Planning' | 'Active' | 'Completed' | 'Scheduled';
  impressions: string;
  leads: number;
  conversion: string;
  budget: string;
  startDate: string;
  endDate: string;
  progress: number;
  owner: string;
  blueprint?: CampaignBlueprint;
}

export interface RoadmapPhase {
  id: string;
  name: 'DISCOVERY' | 'STRATEGY' | 'CONTENT CREATION' | 'PRE-LAUNCH' | 'LAUNCH' | 'OPTIMIZATION' | 'ANALYSIS';
  objective: string;
  tasks: string[];
  deliverables: string[];
  suggestedTimeline: string;
  responsible: string;
}

export interface ContentPlanItem {
  id: string;
  contentType: string;
  platform: string;
  purpose: string;
  timing: string;
  cta: string;
}

export interface RiskRecommendation {
  id: string;
  risk: string;
  recommendation: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface CampaignKPI {
  id: string;
  name: string;
  target: string;
  current: string;
  unit?: string;
}

export interface CampaignBlueprint {
  id: string;
  campaignId: string;
  campaignName: string;
  createdAt: string;
  // A. Campaign Overview
  overview: {
    objective: string;
    targetAudience: string;
    timeline: string;
    budget: string;
    primaryChannels: string[];
    successMetrics: string[];
  };
  // B. Campaign Strategy
  strategy: {
    coreObjective: string;
    positioning: string;
    audienceStrategy: string;
    keyMessage: string;
    campaignAngle: string;
    recommendedApproach: string;
  };
  // C. Campaign Roadmap
  roadmap: RoadmapPhase[];
  // D. Execution Blueprint
  execution: {
    strategy: string[];
    creative: string[];
    social: string[];
    leadGeneration: string[];
    launch: string[];
    optimization: string[];
  };
  // E. Content Plan
  contentPlan: ContentPlanItem[];
  // F. Social Media Plan
  socialPlan: {
    postingFrequency: string;
    contentThemes: string[];
    postIdeas: string[];
    bestFormats: string[];
    ctas: string[];
    engagementStrategy: string;
  };
  // G. Lead Strategy
  leadStrategy: {
    captureStrategy: string;
    qualification: string;
    followUp: string;
    responseStrategy: string;
    automationOpportunities: string[];
  };
  // H. KPIs & Success Metrics
  kpis: CampaignKPI[];
  // I. Risks & Recommendations
  risks: RiskRecommendation[];
  // J. Next Steps
  nextSteps: {
    number: string;
    title: string;
    description: string;
    actionKey: string;
  }[];
}

export type CategoryType = 
  | 'Email Copy' 
  | 'Social Post' 
  | 'Headline Set' 
  | 'Thought Leadership'
  | 'Hero Brief' 
  | 'Product Render' 
  | 'Brand Specimen' 
  | 'Ad Script' 
  | 'Product Demo' 
  | 'Brand Film';

export interface GeneratedAsset {
  id: string;
  title: string;
  type: CategoryType;
  platform: string;
  preview: string;
  createdAt: string;
  tags: string[];
  imageUrl?: string;
}

export interface SocialAccount {
  id: string;
  platform: 'X (Twitter)' | 'LinkedIn' | 'Instagram' | 'Substack' | 'Meta';
  handle: string;
  status: 'Connected' | 'Re-auth Required' | 'Disconnected';
  followers: string;
  engagement: string;
  lastSync: string;
}

export interface MediaAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size?: string;
}

export interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: string[]; // Destination platforms to upload to
  scheduledTime: string;
  status: 'Queued' | 'Scheduled' | 'Approved' | 'Draft Review' | 'Dispatched';
  tags?: string[];
  mediaCount?: number;
  mediaAttachments?: MediaAttachment[];
  author?: string;
  createdAt?: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'lead' | 'campaign' | 'system' | 'social';
}


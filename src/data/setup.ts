/**
 * Setup readiness for the workspace: the five checks from the PRD.
 * Reads what onboarding and Settings have saved in this browser. In the sample workspace the
 * sample business, channels and knowledge count as present. The first-run workspace starts empty.
 */

export interface SetupItem {
  id: 'business' | 'knowledge' | 'channels' | 'test' | 'ready';
  label: string;
  done: boolean;
  detail: string;
}

export interface SetupStatus {
  items: SetupItem[];
  done: number;
  total: number;
  activated: boolean;
}

/** The sample workspace's business details, used until the person saves their own. */
export const SAMPLE_BUSINESS = {
  businessName: 'Acme Studio',
  website: 'acme.com',
  industry: 'Interior design',
  location: 'Pune',
  whatYouSell: 'Residential and office interiors',
  workingHours: 'Mon–Sat 10:00–19:00',
};

export const SAMPLE_CHANNELS: Record<string, string> = { whatsapp: '+91 98201 44820', instagram: '@acmestudio' };
export const SAMPLE_FAQ = { id: 'sample-faq-1', question: 'What does Acme Studio do?', answer: 'Acme Studio designs residential and office interiors.' };

export const AI_TESTED_KEY = 'nexora_ai_tested_v1';
export const ACTIVATED_KEY = 'nexora_activated_v1';

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function markAiTested() {
  try { localStorage.setItem(AI_TESTED_KEY, '1'); } catch { /* storage unavailable */ }
}

export function setActivated(on: boolean) {
  try { localStorage.setItem(ACTIVATED_KEY, on ? '1' : '0'); } catch { /* storage unavailable */ }
}

export function getSetupStatus(isFirstRun: boolean): SetupStatus {
  const sample = !isFirstRun;

  const settings = read<{ businessName?: string; industry?: string; location?: string; whatYouSell?: string }>('nexora_settings_v1');
  const businessSaved = !!(settings?.businessName && settings.industry && settings.location && settings.whatYouSell);
  const business = businessSaved || sample;

  const faqs = read<unknown[]>('nexora_knowledge_v1') ?? [];
  const docs = read<unknown[]>('tecavy_org_files');
  const knowledgeCount = faqs.length + (docs ? docs.length : sample ? 1 : 0);

  const channels = read<Array<{ name: string; status: string }>>('nexora_channels_v1');
  const connected = channels ? channels.filter(c => c.status === 'Connected').length : sample ? 2 : 0;

  const tested = (() => { try { return localStorage.getItem(AI_TESTED_KEY) === '1'; } catch { return false; } })();
  const activated = (() => { try { return localStorage.getItem(ACTIVATED_KEY) === '1'; } catch { return false; } })();

  const ready = business && knowledgeCount > 0 && connected > 0 && tested;

  const items: SetupItem[] = [
    { id: 'business', label: 'Business information complete', done: business, detail: business ? (businessSaved ? `${settings!.businessName}, ${settings!.industry}` : 'Sample business details') : 'Add your business name, industry, city and what you sell.' },
    { id: 'knowledge', label: 'Knowledge verified', done: knowledgeCount > 0, detail: knowledgeCount > 0 ? `${knowledgeCount} approved item${knowledgeCount === 1 ? '' : 's'}` : 'Approve at least one answer the AI may give customers.' },
    { id: 'channels', label: 'Channel connected', done: connected > 0, detail: connected > 0 ? `${connected} channel${connected === 1 ? '' : 's'} connected` : 'Connect WhatsApp or another channel.' },
    { id: 'test', label: 'AI tested', done: tested, detail: tested ? 'You have tested the AI' : 'Ask the AI a few questions before customers do.' },
    { id: 'ready', label: 'Ready to activate', done: ready && activated, detail: activated ? 'Nexora is active' : ready ? 'Everything is set. Activate when you are ready.' : 'Finish the steps above first.' },
  ];

  return { items, done: items.filter(i => i.done).length, total: items.length, activated };
}

import { PageHeader } from '../ui';
import { readSaved, writeSaved } from './settings/store';
import { markAiTested } from '../../data/setup';
import { AutomationSection, BillingSection, ChannelsSection, NotificationsSection, TeamSection } from './settings/SettingsSections';
import React, { useState } from 'react';
import { 
  Building2, 
  Radio, 
  Cpu, 
  Users2, 
  CreditCard, 
  Bell, 
  Sparkles, 
  Bot, 
  Send, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  FileText,
  UploadCloud
} from 'lucide-react';
import { SubCategory } from '../../types';

export interface OrganizationDocument {
  id: string;
  name: string;
  size: string;
  type?: string;
  uploadedAt?: string;
  status?: string;
}

interface SettingsViewProps {
  activeSubCategory: SubCategory;
  onNavigateSub: (sub: SubCategory) => void;
  onNotify?: (title: string, desc: string) => void;
}

const SETTINGS_KEY = 'nexora_settings_v1';
interface SavedSettings {
  businessName: string; website: string; industry: string; location: string;
  whatYouSell: string; workingHours: string; outsideHoursPolicy: 'ai' | 'callback'; toneOfVoice: string;
}

export type SettingsSection = 'business' | 'ai' | 'channels' | 'automation' | 'team' | 'billing' | 'notifications';

export default function SettingsView({
  activeSubCategory,
  onNavigateSub,
  onNotify
}: SettingsViewProps) {
  // Active Section
  const initialSection: SettingsSection = 
    activeSubCategory === 'ai-knowledge' || activeSubCategory === 'ai-automation' ? 'ai' :
    activeSubCategory === 'channels' ? 'channels' :
    activeSubCategory === 'automation' ? 'automation' :
    activeSubCategory === 'team' || activeSubCategory === 'team-access' ? 'team' :
    activeSubCategory === 'billing' ? 'billing' :
    activeSubCategory === 'notifications' ? 'notifications' : 'business';

  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);

  // Business state
  const saved = React.useMemo(() => readSaved<SavedSettings>(SETTINGS_KEY), []);
  const [businessName, setBusinessName] = useState(saved.businessName ?? 'Acme Studio');
  const [website, setWebsite] = useState(saved.website ?? 'acme.com');
  const [industry, setIndustry] = useState(saved.industry ?? 'Interior design');
  const [location, setLocation] = useState(saved.location ?? 'Pune');
  const [whatYouSell, setWhatYouSell] = useState(saved.whatYouSell ?? 'Residential and office interiors…');
  const [workingHours, setWorkingHours] = useState(saved.workingHours ?? 'Mon–Sat 10:00–19:00');
  const [outsideHoursPolicy, setOutsideHoursPolicy] = useState<'ai' | 'callback'>(saved.outsideHoursPolicy ?? 'ai');

  // AI Knowledge state
  const [toneOfVoice, setToneOfVoice] = useState(saved.toneOfVoice ?? 'Friendly');
  const [testQuestion, setTestQuestion] = useState('');
  const [testAnswer, setTestAnswer] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Organization files linked to AI Knowledge (synced with onboarding Step 3)
  const [orgDocs, setOrgDocs] = useState<OrganizationDocument[]>(() => {
    try {
      const stored = localStorage.getItem('tecavy_org_files');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'doc-sample-1',
        name: 'Acme_Studio_Catalog_&_Pricing_2026.pdf',
        size: '2.4 MB',
        type: 'application/pdf',
        uploadedAt: 'Indexed',
        status: 'indexed'
      }
    ];
  });
  const orgFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadOrgDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const added: OrganizationDocument[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const sizeStr = f.size > 1024 * 1024 
        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(f.size / 1024)} KB`;
      added.push({
        id: `doc-${Date.now()}-${i}`,
        name: f.name,
        size: sizeStr,
        type: f.type || 'document',
        uploadedAt: 'Just now',
        status: 'indexed'
      });
    }
    const updated = [...orgDocs, ...added];
    setOrgDocs(updated);
    try {
      localStorage.setItem('tecavy_org_files', JSON.stringify(updated));
    } catch {}
    e.target.value = '';
    if (onNotify) onNotify('Files Uploaded', `Linked ${added.length} organization document(s) to AI knowledge.`);
  };

  const handleRemoveOrgDoc = (id: string) => {
    const updated = orgDocs.filter(d => d.id !== id);
    setOrgDocs(updated);
    try {
      localStorage.setItem('tecavy_org_files', JSON.stringify(updated));
    } catch {}
    if (onNotify) onNotify('Document Removed', 'Organization file removed from AI Knowledge.');
  };

  // Test the AI sandbox handler (Page 35 spec)
  const handleTestAi = () => {
    if (!testQuestion.trim()) return;
    markAiTested();
    setIsTesting(true);
    setTimeout(() => {
      setTestAnswer(
        `"Hello! For our residential and office interiors in ${location}, projects typically start at ₹50,000. Our turnaround timeline is usually within 30 days. Would you like to schedule a discovery walkthrough with our solutions architect?"`
      );
      setIsTesting(false);
    }, 450);
  };

  const handleSave = () => {
    writeSaved(SETTINGS_KEY, { businessName, website, industry, location, whatYouSell, workingHours, outsideHoursPolicy, toneOfVoice });
    if (onNotify) onNotify('Settings saved', 'Your business profile and AI settings were saved.');
  };

  return (
    <div className="space-y-[16px] pb-12 animate-fadeIn text-ink select-text">
      
      <PageHeader
        eyebrow="System / Settings"
        title="Settings"
        subtitle="Teach the AI, connect channels, calibrate qualification, and manage team access."
      />

      {/* 2-Column Layout: Left Nav List + Right Settings Form (Page 35 spec) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left-hand List of Sections (Page 35 spec) */}
        <div className="lg:col-span-3 border border-line bg-surface-raised rounded-[8px] p-2 space-y-1">
          {[
            { id: 'business', label: 'Business', icon: Building2 },
            { id: 'ai', label: 'AI Knowledge', icon: Sparkles },
            { id: 'channels', label: 'Channels', icon: Radio },
            { id: 'automation', label: 'Automation', icon: Cpu },
            { id: 'team', label: 'Team', icon: Users2 },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map(sec => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveSection(sec.id as SettingsSection);
                  onNavigateSub(sec.id as SubCategory);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-[8px] text-xs transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-surface-hover text-ink font-semibold border-l-2 border-line-strong'
                    : 'text-ink-2 hover:text-ink hover:bg-surface-hover'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content */}
        <div className="lg:col-span-9 border border-line bg-surface rounded-[8px] p-6 space-y-6">
          
          {/* ========================================================
              SECTION: BUSINESS (Page 35 spec)
             ======================================================== */}
          {activeSection === 'business' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                <span className="text-xs uppercase tracking-widest text-ink-2 font-semibold">
                  BUSINESS PROFILE
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBusinessName('Acme Studio');
                    setIndustry('Interior design');
                    setLocation('Pune');
                    if (onNotify) onNotify('Fields Filled', 'Drafted business fields from website.');
                  }}
                  className="text-xs text-ok hover:underline cursor-pointer"
                >
                  ✦ Fill from website
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-ink-2 block mb-1">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-surface-raised border border-line text-ink px-3 py-2 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-ink-2 block mb-1">Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-surface-raised border border-line text-ink px-3 py-2 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-ink-2 block mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-surface-raised border border-line text-ink px-3 py-2 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-ink-2 block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-surface-raised border border-line text-ink px-3 py-2 rounded focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-ink-2 block mb-1">What you sell</label>
                  <textarea
                    rows={2}
                    value={whatYouSell}
                    onChange={(e) => setWhatYouSell(e.target.value)}
                    className="w-full bg-surface-raised border border-line text-ink px-3 py-2 rounded focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-ink-2 block mb-1">Working hours</label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full bg-surface-raised border border-line text-ink px-3 py-2 rounded focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-ink-2 block mb-1">Outside hours policy</label>
                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="policy"
                        checked={outsideHoursPolicy === 'ai'}
                        onChange={() => setOutsideHoursPolicy('ai')}
                        className="accent-emerald-400"
                      />
                      <span>AI replies 24/7</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="policy"
                        checked={outsideHoursPolicy === 'callback'}
                        onChange={() => setOutsideHoursPolicy('callback')}
                        className="accent-emerald-400"
                      />
                      <span>Auto "we'll call back"</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-line-subtle">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-brand text-on-brand text-xs font-semibold rounded-[8px]"
                >
                  Save changes
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION: AI KNOWLEDGE (Page 35 spec with "Test the AI")
             ======================================================== */}
          {activeSection === 'ai' && (
            <div className="space-y-5">
              <div className="border-b border-line-subtle pb-3">
                <span className="text-xs uppercase tracking-widest text-ink-2 font-semibold">
                  AI KNOWLEDGE — WHAT THE AI KNOWS WHEN IT TALKS TO CUSTOMERS
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-surface-raised rounded border border-line">
                  <span>Products & services</span>
                  <span className="text-ok font-semibold">[+ Add] 3 items</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface-raised rounded border border-line">
                  <span>Pricing</span>
                  <span className="text-ok font-semibold">[Upload price list] or type</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface-raised rounded border border-line">
                  <span>FAQs</span>
                  <span className="text-ok font-semibold">[+ Add] 12 items</span>
                </div>

                {/* Organization Documents & Uploaded Files */}
                <div className="p-3.5 bg-surface-raised rounded border border-line space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-ink font-bold text-xs uppercase tracking-wider">
                          Organization Documents & Knowledge Files
                        </span>
                        <span className="text-[11px]  px-1.5 py-0.5 rounded bg-ok/15 text-ok border border-ok/30">
                          {orgDocs.length} linked
                        </span>
                      </div>
                      <p className="text-[12px] text-ink-2 font-light mt-0.5">
                        Brochures, rate cards, and catalogs uploaded during Step 3 onboarding or directly below.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => orgFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[12px]  bg-surface-hover hover:bg-surface-hover border border-emerald-400/40 hover:border-emerald-400 text-ok hover:text-ink rounded-[8px] transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>+ Upload Files</span>
                    </button>
                    <input
                      ref={orgFileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                      onChange={handleUploadOrgDoc}
                      className="hidden"
                    />
                  </div>

                  {orgDocs.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {orgDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-2 bg-surface-raised border border-line rounded-[8px] flex items-center justify-between text-xs transition-colors hover:border-emerald-400/40"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-ok shrink-0" />
                            <div className="min-w-0">
                              <p className="text-ink font-medium truncate text-xs">
                                {doc.name}
                              </p>
                              <div className="flex items-center space-x-2 text-[11px] text-ink-3 ">
                                <span>{doc.size}</span>
                                <span>·</span>
                                <span className="text-ok flex items-center space-x-0.5">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Active AI Knowledge</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveOrgDoc(doc.id)}
                            className="text-ink-3 hover:text-danger p-1 cursor-pointer transition-colors"
                            title="Remove document"
                            aria-label="Remove document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-ink-3 italic  py-1">
                      No organization documents uploaded yet. Click "+ Upload Files" to train the AI.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-ink-2 block mb-1">Tone of voice</label>
                  <select
                    value={toneOfVoice}
                    onChange={(e) => setToneOfVoice(e.target.value)}
                    className="w-full bg-surface-raised border border-line text-ink px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Premium">Premium</option>
                    <option value="Conversational">Conversational</option>
                  </select>
                </div>

                <div className="p-3 bg-surface-raised rounded border border-line-subtle space-y-1">
                  <p className="text-ink-2 font-semibold">AI may say:</p>
                  <p className="text-ink italic">"Prices start at ₹50,000 for bespoke studio architecture."</p>
                </div>

                <div className="p-3 bg-surface-raised rounded border border-danger/30 space-y-1">
                  <p className="text-danger font-semibold">AI must never:</p>
                  <p className="text-ink-2 italic">"Never discount beyond 10%, promise fixed delivery under 14 days, or give medical advice."</p>
                </div>

                {/* ┌ Test the AI ───────────────────────────────────┐ (Page 35 spec) */}
                <div className="p-4 rounded-[8px] bg-surface-raised border border-emerald-500/35 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-ok" />
                    <span className="text-xs uppercase font-semibold text-ok">
                      Test the AI
                    </span>
                  </div>

                  <p className="text-[12px] text-ink-2">
                    Ask a customer question… → see the AI's instant answer live based on your business knowledge.
                  </p>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. What are your pricing packages in Pune?"
                      value={testQuestion}
                      onChange={(e) => setTestQuestion(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleTestAi(); }}
                      className="flex-1 bg-surface border border-line text-xs text-ink px-3 py-2 rounded focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTestAi}
                      className="px-4 py-2 bg-ok text-on-brand font-semibold rounded text-xs cursor-pointer"
                    >
                      {isTesting ? 'Thinking...' : 'Test'}
                    </button>
                  </div>

                  {testAnswer && (
                    <div className="p-3 bg-surface border border-ok/30 rounded text-xs text-ok leading-relaxed animate-fadeIn">
                      <span className="text-[11px] text-ok block font-semibold mb-1">AI Output:</span>
                      {testAnswer}
                    </div>
                  )}
                </div>

              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-line-subtle">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-brand text-on-brand text-xs font-semibold rounded-[8px]"
                >
                  Save changes
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION: CHANNELS (Page 35 spec)
             ======================================================== */}
          {activeSection === 'channels' && <ChannelsSection onNotify={onNotify} />}
          {activeSection === 'automation' && <AutomationSection onNotify={onNotify} />}
          {activeSection === 'team' && <TeamSection onNotify={onNotify} />}
          {activeSection === 'billing' && <BillingSection onNotify={onNotify} />}
          {activeSection === 'notifications' && <NotificationsSection onNotify={onNotify} />}

        </div>

      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Megaphone, 
  Sparkles, 
  UserPlus, 
  Calendar, 
  CheckCircle2,
  ExternalLink,
  Mail,
  Building,
  TrendingUp
} from 'lucide-react';
import { Lead, Campaign } from '../../types';

interface ActionModalsProps {
  activeModal: 'campaign' | 'content' | 'lead' | 'schedule' | 'lead-details' | null;
  selectedLead: Lead | null;
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
  onAddCampaign: (campaign: Campaign) => void;
  onNotify: (title: string, desc: string) => void;
}

export default function ActionModals({
  activeModal,
  selectedLead,
  onClose,
  onAddLead,
  onAddCampaign,
  onNotify
}: ActionModalsProps) {
  // Lead form
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSource, setLeadSource] = useState<Lead['source']>('LinkedIn');
  const [leadValue, setLeadValue] = useState('$10,000');

  // Campaign form
  const [campaignName, setCampaignName] = useState('');
  const [campaignChannel, setCampaignChannel] = useState('LinkedIn + X');
  const [campaignBudget, setCampaignBudget] = useState('$2,500');

  // Content form
  const [contentPrompt, setContentPrompt] = useState('');
  const [contentType, setContentType] = useState('Social Broadcast');

  // Schedule form
  const [schedulePlatform, setSchedulePlatform] = useState('LinkedIn');
  const [scheduleTime, setScheduleTime] = useState('Tomorrow at 9:00 AM');
  const [scheduleText, setScheduleText] = useState('');

  if (!activeModal) return null;

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) return;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: leadName.trim(),
      company: leadCompany.trim() || 'Independent Atelier',
      email: leadEmail.trim() || 'inquiry@nexora.studio',
      source: leadSource,
      status: 'New',
      value: leadValue,
      lastActivity: 'Just added · Manual entry',
      score: 85
    };

    onAddLead(newLead);
    onNotify('Lead Captured', `${leadName} was added to the Live Leads pipeline.`);
    onClose();
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: campaignName.trim(),
      objective: `Drive targeted conversions across ${campaignChannel}`,
      channel: campaignChannel,
      status: 'Active',
      impressions: '1,200',
      leads: 0,
      conversion: '0.0%',
      budget: campaignBudget,
      startDate: 'Today',
      endDate: '30 Days',
      progress: 5,
      owner: 'You'
    };

    onAddCampaign(newCampaign);
    onNotify('Campaign Launched', `"${campaignName}" is now actively distributing across ${campaignChannel}.`);
    onClose();
  };

  const handleGenerateContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNotify('Asset Synthesized', `New ${contentType} drafted and saved to Creative Lab archives.`);
    onClose();
  };

  const handleSchedulePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNotify('Broadcast Scheduled', `Queued for distribution to ${schedulePlatform} at ${scheduleTime}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#071C1A] border border-[rgba(169,191,165,0.25)] p-6 sm:p-8 shadow-2xl animate-scaleUp text-[#E8E9D8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-[#A9BFA5]/60 hover:text-[#E8E9D8] transition-colors p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* 1. Modal: Add Lead */}
        {activeModal === 'lead' && (
          <form onSubmit={handleCreateLeadSubmit} className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest-plus text-[#A9BFA5] block mb-1">
                PIPELINE REGISTRATION
              </span>
              <h3 className="serif text-2xl sm:text-3xl font-light text-[#E8E9D8]">
                Add Inbound Lead
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                  Contact Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-3 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                  Atelier / Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. Forma Spatial Concepts"
                  value={leadCompany}
                  onChange={(e) => setLeadCompany(e.target.value)}
                  className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-3 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                    Acquisition Channel
                  </label>
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value as any)}
                    className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-2.5 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="Referral">Referral</option>
                    <option value="Organic Search">Organic Search</option>
                    <option value="Newsletter">Newsletter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                    Estimated Retainer Value
                  </label>
                  <input
                    type="text"
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                    className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-3 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(169,191,165,0.15)] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase tracking-widest text-[#A9BFA5] hover:text-[#E8E9D8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#E8E9D8] text-[#071C1A] px-6 py-2.5 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer"
              >
                Register Lead
              </button>
            </div>
          </form>
        )}

        {/* 2. Modal: Create Campaign */}
        {activeModal === 'campaign' && (
          <form onSubmit={handleCreateCampaignSubmit} className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest-plus text-[#A9BFA5] block mb-1">
                DISTRIBUTION SETUP
              </span>
              <h3 className="serif text-2xl sm:text-3xl font-light text-[#E8E9D8]">
                Create Campaign
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto Spatial Architectural Narrative"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-3 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                    Broadcast Channels
                  </label>
                  <input
                    type="text"
                    value={campaignChannel}
                    onChange={(e) => setCampaignChannel(e.target.value)}
                    className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-3 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                    Allocated Budget
                  </label>
                  <input
                    type="text"
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(e.target.value)}
                    className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-3 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(169,191,165,0.15)] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase tracking-widest text-[#A9BFA5] hover:text-[#E8E9D8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#E8E9D8] text-[#071C1A] px-6 py-2.5 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer"
              >
                Launch Cadence
              </button>
            </div>
          </form>
        )}

        {/* 3. Modal: Generate Content */}
        {activeModal === 'content' && (
          <form onSubmit={handleGenerateContentSubmit} className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest-plus text-[#A9BFA5] block mb-1">
                RAPID SYNTHESIS
              </span>
              <h3 className="serif text-2xl sm:text-3xl font-light text-[#E8E9D8]">
                Generate Content
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                  Format
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-2.5 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                >
                  <option value="Social Broadcast">Social Broadcast (X & LinkedIn)</option>
                  <option value="Direct Outreach Email">Direct Outreach Email</option>
                  <option value="Editorial Brief">Editorial Brief / Essay</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                  Topic or Key Thesis
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Announce our upcoming digital residency. Highlight the balance between zero latency and aesthetic calm."
                  value={contentPrompt}
                  onChange={(e) => setContentPrompt(e.target.value)}
                  className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] p-3 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] resize-none font-light"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(169,191,165,0.15)] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase tracking-widest text-[#A9BFA5] hover:text-[#E8E9D8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#E8E9D8] text-[#071C1A] px-6 py-2.5 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer"
              >
                Generate & Save
              </button>
            </div>
          </form>
        )}

        {/* 4. Modal: Schedule Post */}
        {activeModal === 'schedule' && (
          <form onSubmit={handleSchedulePostSubmit} className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest-plus text-[#A9BFA5] block mb-1">
                QUEUE DISPATCH
              </span>
              <h3 className="serif text-2xl sm:text-3xl font-light text-[#E8E9D8]">
                Schedule Post
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                    Destination Platform
                  </label>
                  <select
                    value={schedulePlatform}
                    onChange={(e) => setSchedulePlatform(e.target.value)}
                    className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-2.5 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="Substack">Substack</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                    Dispatch Slot
                  </label>
                  <input
                    type="text"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] px-3 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1.5 font-medium">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type post copy or paste from Creative Lab..."
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] p-3 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] resize-none font-light"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(169,191,165,0.15)] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase tracking-widest text-[#A9BFA5] hover:text-[#E8E9D8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#E8E9D8] text-[#071C1A] px-6 py-2.5 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer"
              >
                Schedule Release
              </button>
            </div>
          </form>
        )}

        {/* 5. Modal: Lead Details viewer */}
        {activeModal === 'lead-details' && selectedLead && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest-plus text-[#A9BFA5] block mb-1">
                  LEAD PROFILE · SCORE {selectedLead.score}/100
                </span>
                <h3 className="serif text-3xl font-light text-[#E8E9D8]">
                  {selectedLead.name}
                </h3>
                <p className="text-xs text-[#A9BFA5] mt-0.5">{selectedLead.company}</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 border border-[#A9BFA5]/30 text-[#E8E9D8]">
                {selectedLead.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-[#061816] border border-[rgba(169,191,165,0.2)] text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#A9BFA5]/60">Channel</p>
                <p className="text-[#E8E9D8] font-medium mt-0.5">{selectedLead.source}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#A9BFA5]/60">Retainer Value</p>
                <p className="text-[#E8E9D8] font-mono mt-0.5">{selectedLead.value}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-widest text-[#A9BFA5]/60">Email</p>
                <p className="text-[#E8E9D8] font-mono mt-0.5">{selectedLead.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-widest text-[#A9BFA5]/60">Telemetry / Last Activity</p>
                <p className="text-[#A9BFA5] font-light mt-0.5">{selectedLead.lastActivity}</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[rgba(169,191,165,0.15)]">
              <button
                type="button"
                onClick={() => {
                  onNotify('Response Queued', `AI draft prepared for ${selectedLead.name}.`);
                  onClose();
                }}
                className="bg-[#E8E9D8] text-[#071C1A] px-6 py-2 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer"
              >
                Send Personalized Reply
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

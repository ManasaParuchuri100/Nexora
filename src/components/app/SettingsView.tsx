import React, { useState } from 'react';
import { 
  Building2, 
  Radio, 
  Cpu, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Sun, 
  Moon, 
  Sliders, 
  Sparkles, 
  ExternalLink,
  Users2,
  Mail,
  UserCheck
} from 'lucide-react';
import { SubCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SettingsViewProps {
  activeSubCategory: SubCategory;
  onNavigateSub: (sub: SubCategory) => void;
  onNotify?: (title: string, desc: string) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Creative Director' | 'Account Executive' | 'AI Agent';
  status: 'Active' | 'Invited';
}

const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'Mateo Petty', email: 'mateo@nexora.studio', role: 'Owner', status: 'Active' },
  { id: '2', name: 'Aurelia Vance', email: 'aurelia@nexora.studio', role: 'Creative Director', status: 'Active' },
  { id: '3', name: 'Julian Montgomery', email: 'julian@nexora.studio', role: 'Account Executive', status: 'Active' },
  { id: '4', name: 'Nexora Copilot v2.4', email: 'agent@nexora.internal', role: 'AI Agent', status: 'Active' }
];

export default function SettingsView({
  activeSubCategory,
  onNavigateSub,
  onNotify
}: SettingsViewProps) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  // Business Profile states
  const [studioName, setStudioName] = useState('Nexora Atelier OS');
  const [brandVoice, setBrandVoice] = useState('Quiet · Precise · Editorial · Premium');
  const [audience, setAudience] = useState('Creative directors · Studio founders · Enterprise leaders');
  const [visualLanguage, setVisualLanguage] = useState('Minimal · Architectural · Wabi-Sabi');
  const [constraints, setConstraints] = useState('No hype · No excessive emojis · No buzzwords');

  // Channels state
  const [connectedChannels, setConnectedChannels] = useState([
    { id: 'linkedin', name: 'LinkedIn Professional', handle: 'nexora-systems', connected: true, status: 'Active Sync' },
    { id: 'x', name: 'X (Twitter) Broadcast', handle: '@nexora_hq', connected: true, status: 'Active Sync' },
    { id: 'substack', name: 'Substack Editorial', handle: 'The Quiet Horizon', connected: true, status: 'Active Sync' },
    { id: 'email', name: 'Atelier SMTP Outreach', handle: 'outreach@nexora.studio', connected: true, status: 'Verified' },
    { id: 'whatsapp', name: 'WhatsApp Business API', handle: '+1 (555) 902-4411', connected: false, status: 'Disconnected' },
    { id: 'webhook', name: 'Custom CRM Webhook', handle: 'https://api.nexora.studio/v1/inbound', connected: true, status: 'Listening' }
  ]);

  // AI & Automation state
  const [temperature, setTemperature] = useState('0.4');
  const [autoQualifyScore, setAutoQualifyScore] = useState(85);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [handoffThreshold, setHandoffThreshold] = useState('$25,000');

  // Team state
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Creative Director' | 'Account Executive'>('Account Executive');

  const handleToggleChannel = (id: string) => {
    setConnectedChannels(prev => prev.map(ch => {
      if (ch.id === id) {
        const nextState = !ch.connected;
        if (onNotify) {
          onNotify(
            nextState ? 'Channel Connected' : 'Channel Disconnected',
            `${ch.name} has been ${nextState ? 'authorized and connected' : 'disconnected'}.`
          );
        }
        return {
          ...ch,
          connected: nextState,
          status: nextState ? 'Active Sync' : 'Disconnected'
        };
      }
      return ch;
    }));
  };

  const handleSaveProfile = () => {
    if (onNotify) {
      onNotify('Profile Saved', 'Atelier brand guidelines and profile parameters updated.');
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;
    setTeam(prev => [
      ...prev,
      {
        id: `team-${Date.now()}`,
        name: newName,
        email: newEmail,
        role: newRole,
        status: 'Invited'
      }
    ]);
    if (onNotify) {
      onNotify('Invitation Dispatched', `Invitation email sent to ${newEmail}.`);
    }
    setNewName('');
    setNewEmail('');
  };

  const isBusinessProfile = activeSubCategory === 'business-profile' || !activeSubCategory || activeSubCategory === 'overview';
  const isChannels = activeSubCategory === 'channels';
  const isAIAutomation = activeSubCategory === 'ai-automation';
  const isTeamAccess = activeSubCategory === 'team-access';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Settings Module Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-[rgba(169,191,165,0.2)] gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5] font-medium block mb-1">
            STUDIO CONFIGURATION & ACCESS
          </span>
          <h1 className={`serif text-3xl sm:text-4xl font-light tracking-tight ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
            Settings
          </h1>
          <p className="mt-1 text-xs text-[#A9BFA5]/80 font-light">
            Manage business profile, syndicate channels, configure AI rules, and manage team access.
          </p>
        </div>

        {/* Subnav Pills */}
        <div className="inline-flex rounded-[2px] border border-[rgba(169,191,165,0.2)] p-0.5 bg-inherit flex-wrap">
          <button
            type="button"
            onClick={() => onNavigateSub('business-profile')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isBusinessProfile
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Business Profile</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSub('channels')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isChannels
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Channels</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSub('ai-automation')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isAIAutomation
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI & Automation</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSub('team-access')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isTeamAccess
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Team & Access</span>
          </button>
        </div>
      </section>

      {/* 1. BUSINESS PROFILE */}
      {isBusinessProfile && (
        <div className="space-y-6">
          <div className="border border-[rgba(169,191,165,0.2)] p-6 rounded-[2px] bg-[#071C1A] space-y-5">
            <div>
              <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8]">
                Studio & Brand Parameters
              </h3>
              <p className="text-xs text-[#A9BFA5]/75 font-mono mt-1">
                Global brand context injected across all AI generators and outreach letters
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A9BFA5] mb-1.5">
                  Studio / Brand Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-[2px] bg-[#061816] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A9BFA5] mb-1.5">
                  Brand Voice & Tone
                </label>
                <input
                  type="text"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-[2px] bg-[#061816] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A9BFA5] mb-1.5">
                  Primary Target Audience
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-[2px] bg-[#061816] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A9BFA5] mb-1.5">
                  Visual Direction / Aesthetic
                </label>
                <input
                  type="text"
                  value={visualLanguage}
                  onChange={(e) => setVisualLanguage(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-[2px] bg-[#061816] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A9BFA5] mb-1.5">
                  Brand Negative Constraints
                </label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-[2px] bg-[#061816] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5] focus:outline-none"
                />
              </div>
            </div>

            {/* Appearance Theme Selector */}
            <div className="pt-4 border-t border-[rgba(169,191,165,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-medium text-[#E8E9D8] block">Atelier Appearance Palette</span>
                <span className="text-[11px] text-[#A9BFA5]/70 font-mono">
                  Currently active: {theme === 'light' ? 'Botanical Ivory (Light)' : 'Botanical Noir (Dark)'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-[2px] border transition-colors flex items-center space-x-1.5 cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#E8E9D8] text-[#071C1A] border-[#E8E9D8] font-medium'
                      : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-[2px] border transition-colors flex items-center space-x-1.5 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#143630] text-white border-[#143630] font-medium'
                      : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-5 py-2 text-xs font-mono uppercase tracking-widest bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[2px] hover:bg-white transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHANNELS */}
      {isChannels && (
        <div className="space-y-6">
          <div className="border border-[rgba(169,191,165,0.2)] p-6 rounded-[2px] bg-[#071C1A]">
            <div className="mb-5">
              <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8]">
                Connected Syndication Channels
              </h3>
              <p className="text-xs text-[#A9BFA5]/75 font-mono mt-1">
                Authorize social networks, outreach mailboxes, and automated incoming webhooks
              </p>
            </div>

            <div className="divide-y divide-[rgba(169,191,165,0.15)]">
              {connectedChannels.map((channel) => (
                <div key={channel.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-[#E8E9D8]">{channel.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[1px] border ${
                        channel.connected 
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' 
                          : 'border-neutral-500/30 text-neutral-400 bg-neutral-900/40'
                      }`}>
                        {channel.status}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#A9BFA5]/70 block mt-0.5">
                      Account / Endpoint: {channel.handle}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleChannel(channel.id)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-[2px] border transition-colors cursor-pointer ${
                      channel.connected
                        ? 'border-red-500/30 text-red-300 hover:bg-red-950/30'
                        : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40'
                    }`}
                  >
                    {channel.connected ? 'Disconnect' : 'Connect Channel'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. AI & AUTOMATION */}
      {isAIAutomation && (
        <div className="space-y-6">
          <div className="border border-[rgba(169,191,165,0.2)] p-6 rounded-[2px] bg-[#071C1A] space-y-6">
            <div>
              <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8]">
                Autonomous AI & Engine Policies
              </h3>
              <p className="text-xs text-[#A9BFA5]/75 font-mono mt-1">
                Calibrate creative temperature, automatic lead qualification thresholds, and human handoff triggers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-[2px] border border-[rgba(169,191,165,0.2)] bg-[#061816]">
                <label className="text-xs font-semibold text-[#E8E9D8] block mb-1">
                  Creative Temperature (Register)
                </label>
                <p className="text-[11px] text-[#A9BFA5]/70 mb-3">
                  Low values enforce strict, concise restraint. Higher values permit expansive essays.
                </p>
                <div className="flex items-center space-x-3">
                  {['0.2 (Restrained)', '0.4 (Atelier Default)', '0.7 (Expansive)'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTemperature(val)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] border transition-colors cursor-pointer ${
                        temperature === val
                          ? 'bg-[#E8E9D8] text-[#071C1A] font-semibold'
                          : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-[2px] border border-[rgba(169,191,165,0.2)] bg-[#061816]">
                <label className="text-xs font-semibold text-[#E8E9D8] block mb-1">
                  Auto-Qualification Minimum Score
                </label>
                <p className="text-[11px] text-[#A9BFA5]/70 mb-3">
                  Prospects scoring above this score skip manual intake triage.
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={autoQualifyScore}
                    onChange={(e) => setAutoQualifyScore(Number(e.target.value))}
                    className="flex-1 accent-[#A9BFA5]"
                  />
                  <span className="text-sm font-mono font-semibold text-emerald-400">
                    {autoQualifyScore} / 100
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 p-4 rounded-[2px] border border-[rgba(169,191,165,0.2)] bg-[#061816] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#E8E9D8] block">
                    Escalate to Human Handoff when Deal Value exceeds
                  </label>
                  <p className="text-[11px] text-[#A9BFA5]/70">
                    High-conviction inquiries automatically pause AI responses and alert the studio founder
                  </p>
                </div>

                <select
                  value={handoffThreshold}
                  onChange={(e) => setHandoffThreshold(e.target.value)}
                  className="text-xs font-mono px-3 py-1.5 bg-[#071C1A] border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] rounded-[2px] focus:outline-none"
                >
                  <option value="$15,000">$15,000+</option>
                  <option value="$25,000">$25,000+ (Recommended)</option>
                  <option value="$50,000">$50,000+</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TEAM & ACCESS */}
      {isTeamAccess && (
        <div className="space-y-6">
          <div className="border border-[rgba(169,191,165,0.2)] p-6 rounded-[2px] bg-[#071C1A] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8]">
                  Team Directory & Role Permissions
                </h3>
                <p className="text-xs text-[#A9BFA5]/75 font-mono mt-1">
                  Invite collaborators and assign workspace authorization tiers
                </p>
              </div>

              <span className="text-xs font-mono text-[#A9BFA5]">
                {team.length} Team Members
              </span>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleAddMember} className="p-4 rounded-[2px] border border-[rgba(169,191,165,0.2)] bg-[#061816] flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full Name"
                className="w-full sm:w-1/3 text-xs font-mono px-3 py-1.5 rounded-[2px] bg-[#071C1A] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:outline-none"
              />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Colleague Email (e.g. name@studio.com)"
                className="w-full sm:w-1/2 text-xs font-mono px-3 py-1.5 rounded-[2px] bg-[#071C1A] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newEmail.trim() || !newName.trim()}
                className="w-full sm:w-auto px-4 py-1.5 text-xs font-mono uppercase tracking-wider bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[2px] hover:bg-white transition-colors cursor-pointer shrink-0 disabled:opacity-40"
              >
                + Invite
              </button>
            </form>

            {/* Team List Table */}
            <div className="divide-y divide-[rgba(169,191,165,0.15)]">
              {team.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-[#0D2D2A] border border-[rgba(169,191,165,0.25)] flex items-center justify-center text-[10px] text-[#E8E9D8]">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-[#E8E9D8] block">{m.name}</span>
                      <span className="text-[11px] text-[#A9BFA5]/60">{m.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="px-2 py-0.5 rounded-[2px] border border-[rgba(169,191,165,0.2)] text-[10px] text-[#A9BFA5]">
                      {m.role}
                    </span>
                    <span className={`text-[10px] ${m.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

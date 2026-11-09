import { copyText } from './settings/store';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Layers,
  ArrowRight,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { Campaign, GeneratedAsset, ScheduledPost, SubCategory } from '../../types';
import Pagination from './Pagination';
import { PageHeader, StatusBadge } from '../ui';
import ContentTabs from './ContentTabs';
import { Field, NxModal } from './followups/FollowUpKit';
import BrandContextBanner, { DEFAULT_BRAND_CONTEXT, BrandContext } from './creative/BrandContextBanner';
import CategoryNav, { CategoryType, MAIN_CATEGORIES, getMainCategoryForSub } from './creative/CategoryNav';
import QuickGenerateForm from './creative/QuickGenerateForm';
import StructuredBriefForms, { StructuredFormsState } from './creative/StructuredBriefForms';
import OutputWorkspace, { GeneratedVariation } from './creative/OutputWorkspace';

interface CreativeLabViewProps {
  activeSubCategory: SubCategory;
  assets: GeneratedAsset[];
  onNavigateSub: (sub: SubCategory) => void;
  onGenerateSuccess: (newAsset: GeneratedAsset) => void;
  campaigns?: Campaign[];
  onSchedulePost?: (post: ScheduledPost) => void;
  onUpdateAsset?: (id: string, patch: Partial<GeneratedAsset>) => void;
}

const SCHEDULE_CHANNELS = ['LinkedIn', 'X (Twitter)', 'Instagram', 'Email', 'Substack'];

function ScheduleDialog({
  title, defaultChannel, onClose, onConfirm,
}: {
  title: string;
  defaultChannel: string;
  onClose: () => void;
  onConfirm: (channel: string, when: Date) => void;
}) {
  const [channel, setChannel] = useState(SCHEDULE_CHANNELS.includes(defaultChannel) ? defaultChannel : SCHEDULE_CHANNELS[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!date) return setError('Choose a date.');
    if (!time) return setError('Choose a time.');
    const when = new Date(`${date}T${time}`);
    if (Number.isNaN(when.getTime()) || when.getTime() < Date.now()) return setError('Pick a time in the future.');
    onConfirm(channel, when);
  };

  return (
    <NxModal
      title="Schedule post"
      subtitle={title}
      onClose={onClose}
      width={460}
      footer={
        <>
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={submit}>Schedule</button>
        </>
      }
    >
      <Field label="Publish to">
        <div className="flex flex-wrap gap-[7px]">
          {SCHEDULE_CHANNELS.map(c => (
            <button key={c} type="button" aria-pressed={channel === c} className={`nx-chip ${channel === c ? 'active' : ''}`} onClick={() => setChannel(c)}>
              {c}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Date & time">
        <div className="grid grid-cols-2 gap-[10px]">
          <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={e => { setDate(e.target.value); setError(''); }} aria-label="Date" />
          <input type="time" value={time} onChange={e => { setTime(e.target.value); setError(''); }} aria-label="Time" />
        </div>
      </Field>
      {error && <p className="text-[12px] text-danger m-0 mb-2" role="alert">{error}</p>}
    </NxModal>
  );
}

export default function CreativeLabView({
  activeSubCategory,
  assets,
  onNavigateSub,
  onGenerateSuccess,
  campaigns = [],
  onSchedulePost,
  onUpdateAsset
}: CreativeLabViewProps) {

  const isAssetsView = activeSubCategory === 'generated-assets' || activeSubCategory === 'content-library';

  // 2. Generation Mode: Structured Brief (default) vs Quick Generate
  const [createMode, setCreateMode] = useState<'structured' | 'quick'>('structured');

  // 3. Global Brand Context
  const [brandContext, setBrandContext] = useState<BrandContext>(DEFAULT_BRAND_CONTEXT);

  // 1. Active Category (Email Copy, Social Post, Headline Set, Ad Script, Thought Leadership, Hero Brief)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Email Copy');

  // 10. Variations count: 1, 3, or 5 (defaults to 3 for rich multi-version studio experience)
  const [variationsCount, setVariationsCount] = useState<number>(3);

  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignId, setCampaignId] = useState('');
  const [lastAssetId, setLastAssetId] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [libQuery, setLibQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);
  const [variations, setVariations] = useState<GeneratedVariation[]>([]);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Structured Brief Forms State
  // -------------------------------------------------------------
  const [formsState, setFormsState] = useState<StructuredFormsState>({
    emailForm: {
      campaignType: 'Direct VIP Outreach',
      recipientPersona: 'Design Directors & Studio Founders',
      subjectAngle: 'Low-key Curiosity (lowercase)',
      keyProposition: 'Exclusive invitation to experience Nexora v2.0 with zero-notification CRM and hairline design interfaces.',
      cta: 'Schedule a 15-min Private Walkthrough',
      brandTone: 'Deliberate & Architectural',
      senderPersona: 'Julian Vance · Atelier Director',
      preheader: 'Why modern studios are muting notification badges for hairline precision.'
    },
    socialForm: {
      platform: 'X (Twitter)',
      format: 'Sharp Contrarian Take (Single Post)',
      coreHook: 'Most productivity software is built around urgency. We built Nexora around stillness.',
      keyTakeaways: '1. Red notification badges hijack executive dopamine.\n2. Hairline layouts recover 40% working memory.\n3. Subtract the noise. Multiply the depth.',
      visualDirection: 'Monochromatic UI specimen render on dark obsidian slate with hairline gold grid',
      hashtagStyle: 'Zero Hashtags (Strict Editorial)',
      primaryCtaUrl: 'nexora.studio/atelier'
    },
    headlineForm: {
      surface: 'Hero Section H1 (Landing Page)',
      productFocus: 'Nexora Atelier OS',
      coreTransformation: 'Replaces chaotic, badge-heavy CRM clutter with serene, hairline precision and quiet executive focus.',
      archetype: 'Diverse Mix (All Styles)',
      targetAudience: 'High-taste studio directors, agency leads, and architects',
      subheadGuidance: 'Max 12 words with font-display font-bold styling',
      buttonLockup: 'Experience Stillness'
    },
    adScriptForm: {
      videoFormat: '30s Problem-Agitate-Solve (Paid Social)',
      hookScene: 'Extreme macro tracking shot across an empty timber desk at dawn. Sunlight hits a tactile titanium keyboard.',
      coreTension: 'A laptop screen suddenly bursts with 50 blinking notification badges, red numbers, and modal popups. The user sighs.',
      solutionReveal: 'User taps one key. The screen fades into Nexora\'s hairline interface. Complete calm. Audio transitions to quiet ambient cello.',
      closingCta: 'Make space for what matters. Reserve your atelier at nexora.studio.',
      voiceoverStyle: 'Quiet, Measured & Articulate',
      audioDirection: 'Natural room tone into warm acoustic cello harmonics',
      aspectRatio: '9:16 Vertical Reel'
    },
    thoughtLeadershipForm: {
      workingTitle: 'The Architecture of Quiet Work in an Era of High Noise',
      publication: 'Nexora Studio Journal & Substack',
      coreThesis: 'Modern enterprise software has mistaken noise for engagement. The next paradigm of computing is subtractive.',
      supportingArguments: '1. The cognitive cost of attention switching in modern workspaces.\n2. Lessons from Swiss spatial typography and Bauhaus restraint.\n3. Why high-output creative agencies are systematically returning to asynchronous quietude.',
      depth: 'Deep-Dive Essay (~1,000 words)',
      pullQuote: 'When software speaks in hairlines, your mind recovers the bandwidth required for contemplation.',
      authorBio: 'Evelyn Vance · Principal Partner at Nexora Systems'
    },
    heroBriefForm: {
      deliverable: '3D Spatial Key Visual (16:9)',
      focalSubject: 'A cantilevered dark glass workspace surface displaying Nexora\'s hairline CRM graph, next to handcrafted ceramic vessel and brass drafting instruments.',
      aesthetic: 'Japanese Wabi-Sabi + Brutalist Typography',
      lightingMood: 'Soft morning sunlight (4500K) through shoji screens, deep obsidian shadows',
      composition: 'Left-heavy layout with 60% negative space on right for editorial typography',
      colorPalette: 'Deep Forest Obsidian (#071C1A), Soft Sage (#A9BFA5), Warm Parchment (#E8E9D8)',
      aspectRatio: '16:9 Landscape (3840×2160)',
      cameraDirection: '35mm lens, 15° low-angle isometric elevation',
      materials: 'Micro-brushed titanium, matte black anodized aluminum, anti-reflective glass',
      additionalConstraints: 'No saturated neon lights, keep typography safe margins'
    }
  });

  // Archive state & pagination
  const [assetPage, setAssetPage] = useState<number>(1);
  const [assetPageSize, setAssetPageSize] = useState<number>(4);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const campaign = campaigns.find(c => c.id === campaignId);

  useEffect(() => {
    setAssetPage(1);
  }, [typeFilter, statusFilter, libQuery]);

  const filteredAssets = useMemo(() => {
    const q = libQuery.trim().toLowerCase();
    return assets.filter(a =>
      (typeFilter === 'All' || getMainCategoryForSub(a.type as CategoryType) === typeFilter) &&
      (statusFilter === 'All' || (a.status ?? 'Draft') === statusFilter) &&
      (!q || `${a.title} ${a.preview} ${a.platform} ${a.campaign || ''} ${a.tags.join(' ')}`.toLowerCase().includes(q)),
    );
  }, [assets, typeFilter, statusFilter, libQuery]);

  const paginatedAssets = useMemo(() => {
    const start = (assetPage - 1) * assetPageSize;
    return filteredAssets.slice(start, start + assetPageSize);
  }, [filteredAssets, assetPage, assetPageSize]);

  // Load sample data for current category
  const handleLoadExample = () => {
    if (selectedCategory === 'Email Copy') {
      setFormsState(prev => ({
        ...prev,
        emailForm: {
          campaignType: 'Direct VIP Outreach',
          recipientPersona: 'Design Directors & Studio Founders',
          subjectAngle: 'Low-key Curiosity (lowercase)',
          keyProposition: 'Exclusive invitation to experience Nexora v2.0 with zero-notification CRM and hairline design interfaces.',
          cta: 'Schedule a 15-min Private Walkthrough',
          brandTone: 'Deliberate & Architectural',
          senderPersona: 'Julian Vance · Atelier Director',
          preheader: 'Why modern studios are muting notification badges for hairline precision.'
        }
      }));
    } else if (selectedCategory === 'Social Post') {
      setFormsState(prev => ({
        ...prev,
        socialForm: {
          platform: 'LinkedIn',
          format: 'Multi-part Breakdown (Thread / Carousel)',
          coreHook: 'We audited 50 agency CRMs. 84% of account managers felt their tools increased anxiety instead of productivity.',
          keyTakeaways: '1. Cluttered toolbars drain working memory within 12 minutes.\n2. Notifications trigger phantom urgency that impairs executive judgment.\n3. The future belongs to quiet software.',
          visualDirection: 'Side-by-side comparison graphic of bloated legacy UI vs. Nexora hairline architecture',
          hashtagStyle: 'Curated 2-3 Focus Tags',
          primaryCtaUrl: 'nexora.studio/atelier'
        }
      }));
    } else if (selectedCategory === 'Headline Set') {
      setFormsState(prev => ({
        ...prev,
        headlineForm: {
          surface: 'Hero Section H1 (Landing Page)',
          productFocus: 'Nexora Atelier OS',
          coreTransformation: 'Replaces chaotic, badge-heavy CRM clutter with serene, hairline precision and quiet executive focus.',
          archetype: 'Diverse Mix (All Styles)',
          targetAudience: 'High-taste studio directors, agency leads, and architects',
          subheadGuidance: 'Max 12 words with font-display font-bold styling',
          buttonLockup: 'Experience Stillness'
        }
      }));
    } else if (selectedCategory === 'Ad Script') {
      setFormsState(prev => ({
        ...prev,
        adScriptForm: {
          videoFormat: '30s Problem-Agitate-Solve (Paid Social)',
          hookScene: 'Extreme macro tracking shot across an empty timber desk at dawn. Sunlight hits a tactile titanium keyboard.',
          coreTension: 'A laptop screen suddenly bursts with 50 blinking notification badges, red numbers, and modal popups. The user sighs.',
          solutionReveal: 'User taps one key. The screen fades into Nexora\'s hairline interface. Complete calm. Audio transitions to quiet ambient cello.',
          closingCta: 'Make space for what matters. Reserve your atelier at nexora.studio.',
          voiceoverStyle: 'Quiet, Measured & Articulate',
          audioDirection: 'Natural room tone into warm acoustic cello harmonics',
          aspectRatio: '9:16 Vertical Reel'
        }
      }));
    } else if (selectedCategory === 'Thought Leadership') {
      setFormsState(prev => ({
        ...prev,
        thoughtLeadershipForm: {
          workingTitle: 'The Architecture of Quiet Work in an Era of High Noise',
          publication: 'Nexora Studio Journal & Substack',
          coreThesis: 'Modern enterprise software has mistaken noise for engagement. The next paradigm of computing is subtractive.',
          supportingArguments: '1. The cognitive cost of attention switching in modern workspaces.\n2. Lessons from Swiss spatial typography and Bauhaus restraint.\n3. Why high-output creative agencies are systematically returning to asynchronous quietude.',
          depth: 'Deep-Dive Essay (~1,000 words)',
          pullQuote: 'When software speaks in hairlines, your mind recovers the bandwidth required for contemplation.',
          authorBio: 'Evelyn Vance · Principal Partner at Nexora Systems'
        }
      }));
    } else if (selectedCategory === 'Hero Brief') {
      setFormsState(prev => ({
        ...prev,
        heroBriefForm: {
          deliverable: '3D Spatial Key Visual (16:9)',
          focalSubject: 'A cantilevered dark glass workspace surface displaying Nexora\'s hairline CRM graph, next to handcrafted ceramic vessel and brass drafting instruments.',
          aesthetic: 'Japanese Wabi-Sabi + Brutalist Typography',
          lightingMood: 'Soft morning sunlight (4500K) through shoji screens, deep obsidian shadows',
          composition: 'Left-heavy layout with 60% negative space on right for editorial typography',
          colorPalette: 'Deep Forest Obsidian (#071C1A), Soft Sage (#A9BFA5), Warm Parchment (#E8E9D8)',
          aspectRatio: '16:9 Landscape (3840×2160)',
          cameraDirection: '35mm lens, 15° low-angle isometric elevation',
          materials: 'Micro-brushed titanium, matte black anodized aluminum, anti-reflective glass',
          additionalConstraints: 'No saturated neon lights, keep typography safe margins'
        }
      }));
    } else if (selectedCategory === 'Product Render') {
      setFormsState(prev => ({
        ...prev,
        heroBriefForm: {
          deliverable: 'Editorial Product Specimen (1:1)',
          focalSubject: 'Micro-textured solid billet titanium hardware dial displaying precision knurling and warm studio edge lighting.',
          aesthetic: 'Brutalist Precision & High-End Industrial Design',
          lightingMood: 'Dramatic 3200K rim lighting with deep velvety shadows and high specular highlights',
          composition: 'Centered macro hero composition with shallow depth of field',
          colorPalette: 'Brushed Titanium (#C8CCD0), Matte Obsidian (#071C1A), Deep Sage (#244B40)',
          aspectRatio: '1:1 Square (2048×2048)',
          cameraDirection: '90mm macro lens, 30° elevated oblique view',
          materials: 'Aerospace-grade titanium, micro-bead blasted steel, sapphire crystal',
          additionalConstraints: 'Emphasize micro-machining tolerances and clean bevel lines'
        }
      }));
    } else if (selectedCategory === 'Brand Specimen') {
      setFormsState(prev => ({
        ...prev,
        heroBriefForm: {
          deliverable: 'Brand Identity Lockup & Specimen',
          focalSubject: 'Minimal Swiss typography specimen sheet showing Nexora hairline font-display font-bold font scales and mathematical margin grid.',
          aesthetic: 'International Typographic Style + Architectural Minimalism',
          lightingMood: 'Even diffuse gallery daylight (5500K) across heavy tactile paper stock',
          composition: 'Strict asymmetrical grid with 65% negative space and crisp ink boundaries',
          colorPalette: 'Warm Parchment (#FDFBF7), Forest Slate (#143630), Muted Sage (#A9BFA5)',
          aspectRatio: '16:9 Landscape (3840×2160)',
          cameraDirection: 'Top-down orthographic flatlay with subtle paper cast shadow',
          materials: 'Heavy 350gsm cotton rag paper, debossed foil accents',
          additionalConstraints: 'Strict typographic hierarchy, no blurred glyphs'
        }
      }));
    } else if (selectedCategory === 'Product Demo') {
      setFormsState(prev => ({
        ...prev,
        adScriptForm: {
          videoFormat: '60s Manifesto Storyboard (YouTube/Web)',
          hookScene: 'Screen opens on total silence. A single cursor glides across a hairline pipeline graph with instant response.',
          coreTension: 'Contrasts cluttered SaaS interfaces with Nexora’s serene, distraction-free workflow.',
          solutionReveal: 'Step-by-step walkthrough of AI lead scoring, instant pipeline sync, and automated quiet outreach.',
          closingCta: 'Elevate your studio. Experience Nexora at nexora.studio/demo.',
          voiceoverStyle: 'Measured, Informative & Confident',
          audioDirection: 'Minimalist ambient synth pad with soft acoustic clicks',
          aspectRatio: '16:9 Desktop (1920×1080)'
        }
      }));
    } else if (selectedCategory === 'Brand Film') {
      setFormsState(prev => ({
        ...prev,
        adScriptForm: {
          videoFormat: '60s Manifesto Storyboard (YouTube/Web)',
          hookScene: 'Dawn light sweeps across an architect’s drafting table. Hands sketch a single hairline with brass compass.',
          coreTension: 'The modern creative mind is drowned in notifications. We surrendered craft for synthetic urgency.',
          solutionReveal: 'The transition from chaos to computational stillness. Nexora emerges as quiet architecture for thought.',
          closingCta: 'Stillness is a strategy. Nexora Atelier OS.',
          voiceoverStyle: 'Quiet, Cinematic & Profound',
          audioDirection: 'Solo acoustic cello into warm analog reverb and subtle room tone',
          aspectRatio: '16:9 Cinematic (2.39:1 Anamorphic)'
        }
      }));
    }
  };

  // Clear current category form
  const handleClearForm = () => {
    if (selectedCategory === 'Email Copy') {
      setFormsState(prev => ({
        ...prev,
        emailForm: { ...prev.emailForm, recipientPersona: '', keyProposition: '', cta: '', senderPersona: '' }
      }));
    } else if (selectedCategory === 'Social Post') {
      setFormsState(prev => ({
        ...prev,
        socialForm: { ...prev.socialForm, coreHook: '', keyTakeaways: '', visualDirection: '' }
      }));
    } else if (selectedCategory === 'Headline Set') {
      setFormsState(prev => ({
        ...prev,
        headlineForm: { ...prev.headlineForm, productFocus: '', coreTransformation: '', targetAudience: '' }
      }));
    } else if (selectedCategory === 'Ad Script' || selectedCategory === 'Product Demo' || selectedCategory === 'Brand Film') {
      setFormsState(prev => ({
        ...prev,
        adScriptForm: { ...prev.adScriptForm, hookScene: '', coreTension: '', solutionReveal: '', closingCta: '' }
      }));
    } else if (selectedCategory === 'Thought Leadership') {
      setFormsState(prev => ({
        ...prev,
        thoughtLeadershipForm: { ...prev.thoughtLeadershipForm, workingTitle: '', coreThesis: '', supportingArguments: '', pullQuote: '' }
      }));
    } else if (selectedCategory === 'Hero Brief' || selectedCategory === 'Product Render' || selectedCategory === 'Brand Specimen') {
      setFormsState(prev => ({
        ...prev,
        heroBriefForm: { ...prev.heroBriefForm, focalSubject: '', lightingMood: '', colorPalette: '', composition: '' }
      }));
    }
  };

  // -------------------------------------------------------------
  // Generation Engine: Produces variations with distinctive nuances
  // -------------------------------------------------------------
  const generateVariationsForCategory = (
    cat: CategoryType,
    count: number,
    customPrompt?: string
  ): GeneratedVariation[] => {
    const list: GeneratedVariation[] = [];
    const audience = formsState.emailForm.recipientPersona || brandContext.audience;

    if (cat === 'Email Copy') {
      const p = formsState.emailForm;
      const angleDesc = customPrompt || p.keyProposition;

      // Variation 1: Quiet
      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — QUIET',
        content: `[EMAIL DRAFT · ${p.campaignType.toUpperCase()} · QUIET TONE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: the architecture of quiet work
Preheader: ${p.preheader || 'Why deliberate studios are muting notification badges for hairline precision.'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear Julian,

When we examined the digital workflows of leading ${audience}, we noticed a pervasive friction: tools built to streamline collaboration were actively fracturing concentration.

${angleDesc || 'Nexora was engineered under a singular premise: software should behave like quiet architecture, not a notification siren.'}

Rather than bombarding your team with saturated alerts, Nexora provides:
  • Hairline client pipeline tracking with zero cognitive clutter
  • Asynchronous intelligence that respects deep work cadences
  • Unified lead capture calibrated to your studio’s aesthetic conviction

Would you be open to fifteen minutes next week for a private walkthrough?

→ ${p.cta || 'Schedule Private Walkthrough'}: https://nexora.studio/private-access

Warmly,
${p.senderPersona || 'Julian Vance · Atelier Director'}
${brandContext.productName}

P.S. Our current cohort is intentionally capped at twelve studio partners to ensure bespoke onboarding.`
      });

      // Variation 2: Contrarian
      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — CONTRARIAN',
          content: `[EMAIL DRAFT · ${p.campaignType.toUpperCase()} · CONTRARIAN TONE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: your tools are mining your attention
Preheader: How high-performing agencies recovered 12 billable hours by subtracting software noise.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Julian,

Most enterprise tools confuse motion with progress. They decorate your screen with red badge numbers, chime alerts, and modal interruptions to artificially manufacture "engagement."

We built ${brandContext.productName} to do the exact opposite.

${p.keyProposition || 'A serene, hairline operating system where lead management and studio execution occur in complete calm.'}

Three deliberate differences:
  1. Zero unread badges or synthetic urgency timers
  2. Hairline typography that restores 40% working memory
  3. Single-click pipeline reconciliation

If your team is ready to trade frantic dashboards for architectural focus:

→ ${p.cta || 'Request Studio Access'}: https://nexora.studio/atelier

In craft,
${p.senderPersona || 'Julian Vance · Atelier Director'}`
        });
      }

      // Variation 3: Editorial
      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — EDITORIAL',
          content: `[EMAIL DRAFT · ${p.campaignType.toUpperCase()} · EDITORIAL TONE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: A deliberate alternative to noisy software
Preheader: Notes on computational composure from the Nexora Studio.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear Julian,

In 1976, Dieter Rams stated that good design is unobtrusive: equipment should be neutral and leave room for the user’s self-expression.

Digital software forgot this principle.

${brandContext.productName} is an operating canvas crafted specifically for ${audience}. It replaces the chaos of typical CRM workflows with hairline precision, serene typography, and high-conviction pipeline intelligence.

We would be honored to show you how our atelier operates.

→ ${p.cta || 'Reserve 15-min Atelier Walkthrough'}: https://nexora.studio/invite

With respect,
${p.senderPersona || 'Julian Vance · Atelier Director'}`
        });
      }

      // Variation 4 & 5 if 5 selected
      if (count >= 5) {
        list.push({
          id: `var-${Date.now()}-4`,
          versionLabel: 'VERSION 04 — DIRECT',
          content: `[EMAIL DRAFT · DIRECT VIP OUTREACH]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: Private preview: Nexora v2.0
Preheader: Fast, silent CRM built for modern design ateliers.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Julian,

Reaching out directly because of your studio's standard of work.

We just unveiled Nexora v2.0—a zero-notification pipeline management tool engineered for creative founders who refuse to tolerate noisy software.

• Faster lead tracking
• Zero badge pollution
• Bespoke aesthetic alignment

Would you be open to a 10-minute preview this Thursday?

→ ${p.cta || 'Book Walkthrough'}: https://nexora.studio/preview

Best,
${p.senderPersona || 'Julian Vance'}`
        });

        list.push({
          id: `var-${Date.now()}-5`,
          versionLabel: 'VERSION 05 — ARCHITECTURAL',
          content: `[EMAIL DRAFT · ARCHITECTURAL SPECIFICATION]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: Spatial clarity in creative operations
Preheader: The tool is the room you think in.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Julian,

Architecture teaches us that physical spaces shape thoughts. The software you open at 8:00 AM does the exact same thing to your studio's cognitive capacity.

Nexora was built with the restraint of Japanese wabi-sabi and hairline Swiss typography.

If you value stillness as a competitive asset:
→ ${p.cta || 'Explore Atelier OS'}: https://nexora.studio/atelier

Warmly,
${p.senderPersona || 'Julian Vance'}`
        });
      }
    } else if (cat === 'Social Post') {
      const s = formsState.socialForm;
      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — QUIET',
        content: `[${s.platform.toUpperCase()} · ${s.format.toUpperCase()} · STILLNESS THESIS]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${s.coreHook || 'Most software is built around urgency. We built Nexora around stillness.'}

${s.keyTakeaways || '1. Notification badges trigger artificial cortisol spikes.\n2. Hairline layouts recover 40% working memory.\n3. Subtract the noise. Multiply the depth.'}

When you eliminate red badges and loud animations, your team recovers the cognitive bandwidth required to do work that actually endures.

Explore deliberate computing: ${s.primaryCtaUrl || 'nexora.studio/atelier'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[VISUAL ASSET SPECIFICATION]
${s.visualDirection || 'Monochromatic render with hairline grid and typography specimen'}

[TAGGING POLICY]
${s.hashtagStyle === 'Zero Hashtags (Strict Editorial)' ? 'None (Clean editorial styling)' : '#DesignSystems #QuietSoftware #Productivity'}`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — CONTRARIAN',
          content: `[${s.platform.toUpperCase()} · CONTRARIAN BREAKDOWN]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The dirty secret of enterprise SaaS:

Engagement metrics reward panic. The more notification badges they light up, the higher their daily active users look to investors.

Meanwhile, your creative directors are burning 28 minutes every context switch just trying to recover their train of thought.

We took a stand with ${brandContext.productName}:
• No unread counters
• No algorithmic "urgency" tags
• Pure hairline clarity

Stop letting tools ransom your focus.

${s.primaryCtaUrl || 'nexora.studio/atelier'}`
        });
      }

      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — EDITORIAL',
          content: `[${s.platform.toUpperCase()} · ATELIER NOTE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"The tool is the room you think in."

If your workspace is plastered with neon alarms, loud banners, and modal popups, your work will reflect that frenzy.

Stillness isn't a luxury in agency operations. It is the single most valuable competitive advantage.

Discover the quiet alternative: ${s.primaryCtaUrl || 'nexora.studio'}`
        });
      }

      if (count >= 5) {
        list.push({
          id: `var-${Date.now()}-4`,
          versionLabel: 'VERSION 04 — DIRECT',
          content: `[${s.platform.toUpperCase()} · METRICS SPECIMEN]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Results from our 90-day beta with 12 design studios:

- 40% reduction in status check-in meetings
- 28% higher lead conversion speed
- 0 red notification badges clicked

Software should be quiet. Depth follows composure.

${s.primaryCtaUrl || 'nexora.studio/atelier'}`
        });
        list.push({
          id: `var-${Date.now()}-5`,
          versionLabel: 'VERSION 05 — ARCHITECTURAL',
          content: `[${s.platform.toUpperCase()} · ARCHITECTURAL PRINCIPLE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Swiss spatial typography applied to CRM data structures:

When margins breathe, numbers stop shouting.
When hairlines replace drop-shadows, hierarchy emerges naturally.

Nexora Atelier OS is live. Built for high-conviction studios.

${s.primaryCtaUrl || 'nexora.studio'}`
        });
      }
    } else if (cat === 'Headline Set') {
      const h = formsState.headlineForm;
      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — ARCHITECTURAL',
        content: `[HEADLINE SET · ARCHITECTURAL SUITE]
Surface: ${h.surface}
Focus: ${h.productFocus || brandContext.productName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. "The Space Where Creation Happens."
   Subhead: Enterprise operations engineered in hairlines, not notification noise.
   CTA: ${h.buttonLockup || 'Experience Stillness'}

2. "A Quiet Command for Deliberate Studios."
   Subhead: Synchronize client pipelines with architectural composure.
   CTA: Request Atelier Access

3. "Subtract the Noise. Multiply the Depth."
   Subhead: The first CRM crafted specifically for high-conviction creative teams.
   CTA: Explore Platform`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — CONTRARIAN',
          content: `[HEADLINE SET · CONTRARIAN SUITE]
Surface: ${h.surface}
Focus: ${h.productFocus || brandContext.productName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. "Your Software Shouldn't Sound Like a Siren."
   Subhead: Reclaim 40% working memory by removing artificial urgency badges.
   CTA: Enter Stillness

2. "Built for Stillness. Calibrated for Growth."
   Subhead: Eliminate daily status pings while accelerating deal velocity.
   CTA: Start Walkthrough

3. "Stop Managing Noise. Start Directing Value."
   Subhead: The silent CRM built for elite design and architectural practices.
   CTA: Reserve Cohort Access`
        });
      }

      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — HIGH CONVERSION',
          content: `[HEADLINE SET · HIGH CONVERSION SUITE]
Surface: ${h.surface}
Focus: ${h.productFocus || brandContext.productName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. "The First Zero-Notification CRM for Creative Studios."
   Subhead: Close higher-value retainers without tool fatigue.
   CTA: Request Invitation

2. "Master Your Pipeline With Quiet Confidence."
   Subhead: Everything your studio needs to know, presented in hairline harmony.
   CTA: View Interactive Specimen

3. "Less Friction. Unmatched Composure."
   Subhead: Built from the ground up for founders who value design sovereignty.
   CTA: Begin Private Trial`
        });
      }

      if (count >= 5) {
        list.push({
          id: `var-${Date.now()}-4`,
          versionLabel: 'VERSION 04 — POETIC',
          content: `[HEADLINE SET · POETIC SUITE]
1. "Where Craft Meets Composure."
2. "Silence is the Ultimate Lever."
3. "Designed to Disappear."`
        });
        list.push({
          id: `var-${Date.now()}-5`,
          versionLabel: 'VERSION 05 — PROVOCATION',
          content: `[HEADLINE SET · PROVOCATION SUITE]
1. "Tear Down Your Notification Bells."
2. "Why Great Agencies Don't Use Cluttered CRMs."
3. "The Antidote to Slack Fatigue."`
        });
      }
    } else if (cat === 'Ad Script') {
      const a = formsState.adScriptForm;
      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — PROBLEM/SOLVE',
        content: `[VIDEO AD SCRIPT & STORYBOARD · ${a.videoFormat.toUpperCase()}]
Delivery Style: ${a.voiceoverStyle}
Audio: ${a.audioDirection}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[00:00 - 00:05] SCENE 1: THE HOOK
VISUAL: ${a.hookScene || 'Extreme macro tracking shot across an empty timber desk at dawn. Sunlight hits a tactile keyboard.'}
SFX: Quiet natural room tone. A single crisp mechanical key click.
VO: "When was the last time your work tools left you in complete peace?"

[00:05 - 00:14] SCENE 2: THE TENSION
VISUAL: ${a.coreTension || 'Screen erupts with 40 red badges, colorful alerts, and modal popups. Subtle camera shake.'}
SFX: Rising muffled chatter and digital chime dissonance.
VO: "Somewhere along the line, software stopped saving time... and began mining your attention."

[00:14 - 00:24] SCENE 3: THE RESOLUTION
VISUAL: ${a.solutionReveal || 'User taps one hotkey. Screen dissolves into Nexora\'s hairline interface. Everything quiet.'}
SFX: Deep cinematic bass swell, transitioning to warm acoustic cello harmonics.
VO: "Nexora was built under a different conviction: what you subtract is just as vital as what you build."

[00:24 - 00:30] SCENE 4: CALL TO ACTION
VISUAL: Nexora monochrome typography lockup with subtle hairline pulse.
ON-SCREEN TEXT: ${a.closingCta || 'Make space for what matters. nexora.studio'}
VO: "Make space for what matters. Reserve your atelier at nexora.studio."`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — FOUNDER MONOLOGUE',
          content: `[VIDEO AD SCRIPT · FOUNDER MONOLOGUE (30s)]
VOICEOVER: Intimate, direct, unhurried
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[00:00 - 00:08]
VISUAL: Close-up of hands sketching spatial diagrams on heavy parchment with a matte black pen.
VO: "Every creative director knows the feeling. You sit down to do deep work, and within ten minutes, your software has hijacked your brain."

[00:08 - 00:20]
VISUAL: Screen cuts to Nexora's hairline interface. The cursor glides smoothly across client deal stages. No popups. No red badges.
VO: "We built Nexora Atelier OS for those who believe elegance is subtractive. Stillness isn't a feature; it's the foundation."

[00:20 - 00:30]
VISUAL: Slow pull-back of studio at sunset.
VO: "Your craft deserves quiet tools. Experience Nexora today."`
        });
      }

      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — CINEMATIC MANIFESTO',
          content: `[VIDEO AD SCRIPT · CINEMATIC MANIFESTO (30s)]
VOICEOVER: Measured European cadence
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[00:00 - 00:10]
VISUAL: Black screen. Subtle hairline grid appears in warm sage (#A9BFA5).
VO: "Noise is easy. Silence takes discipline."

[00:10 - 00:22]
VISUAL: Fluid UI motion showing high-value lead cards organizing without notification sirens.
VO: "Nexora brings architectural composure to client pipelines. Engineered for studios of consequence."

[00:22 - 00:30]
VISUAL: Minimalist logo lockup.
VO: "Make space for what matters. nexora.studio"`
        });
      }

      if (count >= 5) {
        list.push({
          id: `var-${Date.now()}-4`,
          versionLabel: 'VERSION 04 — 15s REEL LOOP',
          content: `[15s VERTICAL REEL HOOK]
Fast cut comparison between chaos and hairline calm. High tempo audio cut into total silence.`
        });
        list.push({
          id: `var-${Date.now()}-5`,
          versionLabel: 'VERSION 05 — 6s BUMPER',
          content: `[6s BUMPER HOOK]
"Your CRM shouldn't sound like a siren. Nexora Atelier OS."`
        });
      }
    } else if (cat === 'Thought Leadership') {
      const t = formsState.thoughtLeadershipForm;
      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — ESSAY',
        content: `[EDITORIAL ESSAY · ${t.publication.toUpperCase()}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TITLE: ${t.workingTitle || 'The Architecture of Quiet Work'}
STANDFIRST: Why ambitious creative agencies are systematically abandoning badge-driven software suites.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I. THE COMMODIFICATION OF URGENCY
${t.coreThesis || 'Modern software suites have confused motion with progress. By saturating user interfaces with artificial badges, they simulate activity at the direct expense of contemplative output.'}

II. LESSONS FROM ARCHITECTURAL STILLNESS
When Dieter Rams formulated his tenth principle—"Less, but better"—he was addressing physical products. Yet digital interfaces have ignored this discipline for two decades. 

${t.supportingArguments || '1. Cognitive switching cost drains 28 minutes per context disruption.\n2. Restraint in visual hierarchy preserves working memory.\n3. Quiet tools produce superior conversion.'}

III. THE SUBTRACTIVE ADVANTAGE
"${t.pullQuote || 'When software speaks in hairlines, your mind recovers the bandwidth required for contemplation.'}"

To build work that outlasts the weekly sprint cycle, modern ateliers must protect their cognitive sovereignty. The future of tools is not louder—it is silent.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Author Bio:
${t.authorBio || 'Evelyn Vance is Principal Partner at Nexora Systems, researching human-computer composure and computational aesthetics.'}`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — OP-ED COLUMN',
          content: `[TECH OP-ED · FAST COMPANY PERSPECTIVE]
TITLE: Why We Removed Every Notification Badge From Our CRM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A notification badge is a design failure. It is software admitting it cannot structure relevance, so it resorts to visual screaming.

For ninety days, our design studio conducted a radical experiment: we stripped every red dot, auditory chime, and status ping from our pipeline software.

The results stunned our executive partners:
1. Average focus blocks increased from 24 minutes to 82 minutes.
2. Inbound client reply quality noticeably deepened.
3. Agency stress markers dropped precipitously.

Stillness is not an aesthetic indulgence. It is operational leverage.`
        });
      }

      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — MANIFESTO',
          content: `[ATELIER MANIFESTO · NEXORA DISPATCH]
TITLE: In Defense of Computational Composure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We believe that the tools an artist uses dictate the limits of their imagination.
We believe that attention is non-renewable.
We believe that true executive power resides in stillness, not velocity.

Nexora is our contribution to this quiet revolution.`
        });
      }

      if (count >= 5) {
        list.push({
          id: `var-${Date.now()}-4`,
          versionLabel: 'VERSION 04 — SUBSTACK BRIEF',
          content: `[SUBSTACK FIELD DISPATCH · 500 WORDS]`
        });
        list.push({
          id: `var-${Date.now()}-5`,
          versionLabel: 'VERSION 05 — EXECUTIVE DOSSIER',
          content: `[EXECUTIVE DOSSIER · C-LEVEL AUDIT REPORT]`
        });
      }
    } else if (cat === 'Hero Brief') {
      const b = formsState.heroBriefForm;
      const promptText = `cinematic 3D spatial key visual, ${b.focalSubject}, ${b.aesthetic}, lighting: ${b.lightingMood}, composition: ${b.composition}, color grading: ${b.colorPalette}, shot on 35mm Hasselblad, architectural render, octane render, 8k uhd, photorealistic, no badges, ultra minimal`;

      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — WABI-SABI ATELIER',
        imagePrompt: promptText,
        imageUrl: '/src/assets/images/spatial_key_visual_1790755715787.jpg',
        content: `[CREATIVE ART DIRECTION BRIEF · ${b.deliverable.toUpperCase()}]
Aesthetic Paradigm: ${b.aesthetic}
Format: ${b.aspectRatio}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CONCEPT & FOCAL SUBJECT
${b.focalSubject || 'A cantilevered dark glass workspace surface displaying Nexora\'s hairline CRM graph.'}

2. LIGHTING & ATMOSPHERE
${b.lightingMood || 'Soft morning sunlight (4500K) through shoji screens, deep obsidian shadows.'}

3. COLOR PALETTE SPECIFICATIONS
${b.colorPalette || 'Deep Forest Obsidian (#071C1A), Soft Sage (#A9BFA5), Warm Parchment (#E8E9D8)'}

4. COMPOSITION & SAFE MARGINS
${b.composition || 'Left-heavy layout with 60% negative space on right for editorial typography.'}

5. TECHNICAL DELIVERABLE REQUIREMENTS
  • Render Engine: Octane / Unreal Engine 5.4 Path Tracing
  • Deliverable: 3840 × 2160 (16:9 4K UHD), 32-bit EXR + sRGB PNG
  • Materials: ${b.materials || 'Micro-brushed titanium, matte black anodized aluminum, anti-reflective glass'}
  • Constraints: ${b.additionalConstraints || 'No neon glow, maintain 120px left margin for font-display font-bold typography'}`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — MONOLITHIC TITANIUM',
          imagePrompt: `monolithic titanium desk terminal floating in obsidian void, soft warm 3200k spotlight, hairline gold wireframe crm graph, extreme macro texture, 8k studio product render`,
          imageUrl: '/src/assets/images/titanium_studio_render_1790755733959.jpg',
          content: `[CREATIVE ART DIRECTION BRIEF · MONOLITHIC VARIATION]
Aesthetic Paradigm: Minimalist Monolith & Titanium Brutalism
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Focal Subject: Floating solid billet titanium desk pedestal with laser-etched hairline grid. A solitary obsidian glass screen glows softly with Nexora pipeline telemetry.
Lighting: Single high-angle 3200K pin-spotlight cutting through mist, pure black shadows.
Color Palette: Anodized Gunmetal (#1A1E1D), Warm Titanium (#D1D5DB), Soft Sage Accent (#A9BFA5).`
        });
      }

      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — ARCHITECTURAL DAWN',
          imagePrompt: `scandinavian concrete and light birch architect studio at 6am sunrise, cantilevered glass monitor displaying quiet minimal crm, cinematic depth of field, high resolution`,
          imageUrl: '/src/assets/images/scandinavian_dawn_studio_1790755765807.jpg',
          content: `[CREATIVE ART DIRECTION BRIEF · SCANDINAVIAN DAWN]
Aesthetic Paradigm: Scandinavian Restraint & Light Birch Wood
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Focal Subject: Cantilevered birch drafting desk with ultra-thin glass terminal displaying Nexora's client pipeline graph. Minimalist brass lamp casting warm pool of light.
Lighting: Warm dawn sunlight through floor-to-ceiling concrete colonnade.
Color Palette: Pale Birch (#E5D8C5), Warm Parchment (#FDFBF7), Matte Slate (#244B40).`
        });
      }

      if (count >= 5) {
        list.push({
          id: `var-${Date.now()}-4`,
          versionLabel: 'VERSION 04 — MACRO TACTILE',
          imagePrompt: `extreme macro texture of tactile ceramic vessel next to machined dark steel dial, warm lighting`,
          imageUrl: '/src/assets/images/ceramic_glass_volume_1790755783767.jpg',
          content: `[CREATIVE ART DIRECTION BRIEF · MACRO TACTILE]`
        });
        list.push({
          id: `var-${Date.now()}-5`,
          versionLabel: 'VERSION 05 — EDITORIAL SPECIMEN',
          imagePrompt: `swiss typography specimen poster printed on heavy uncoated linen paper, hairline layouts`,
          imageUrl: '/src/assets/images/swiss_brand_specimen_1790755749195.jpg',
          content: `[CREATIVE ART DIRECTION BRIEF · EDITORIAL SPECIMEN]`
        });
      }
    } else if (cat === 'Product Render') {
      const b = formsState.heroBriefForm;
      const promptText = `macro studio industrial design product photography of ${b.focalSubject || 'billet titanium tactile interface dial with micro-knurled bezel'}, ${b.aesthetic || 'brutalist minimalism'}, rim light, deep shadows, shot on 90mm macro lens, 8k uhd, photorealistic`;

      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — MACRO TITANIUM SPEC',
        imagePrompt: promptText,
        imageUrl: '/src/assets/images/titanium_studio_render_1790755733959.jpg',
        content: `[PRODUCT STUDIO RENDER SPEC · HARDWARE SPECIFICATION]
Deliverable: High-Res Macro Product Visual (1:1 / 16:9)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Subject: ${b.focalSubject || 'Machined titanium tactile dial and cantilevered obsidian glass display.'}
• Lighting Mood: Dramatic 3200K studio rim light with soft specular reflections.
• Material Palette: Micro-bead blasted aerospace titanium, matte obsidian acrylic, anti-glare glass.
• Camera Spec: 90mm tilt-shift macro lens, f/5.6 aperture, 25° oblique elevation.
• Texture Fidelity: Subtle hairline grain, chamfered edge highlights, zero plastic gloss.`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — MONOLITHIC ANODIZED SLATE',
          imagePrompt: `monolithic matte black anodized aluminum enclosure on slate stone slab, soft warm directional studio light, 8k uhd`,
          imageUrl: '/src/assets/images/ceramic_glass_volume_1790755783767.jpg',
          content: `[PRODUCT STUDIO RENDER SPEC · ANODIZED SLATE]
• Subject: Solid CNC milled obsidian aluminum console with hairline illuminated edge.
• Studio Lighting: High-contrast 4000K softbox overhead with deep linear reflections.`
        });
      }
      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — CERAMIC & GLASS HARMONY',
          imagePrompt: `minimalist unglazed white ceramic cylinder next to smoked glass touch terminal, morning architectural light, 8k`,
          imageUrl: '/src/assets/images/spatial_key_visual_1790755715787.jpg',
          content: `[PRODUCT STUDIO RENDER SPEC · CERAMIC & SMOKED GLASS]
• Subject: Artisanal wabi-sabi ceramic volume paired with precision optical glass telemetry surface.
• Materials: Matte porous clay, optical float glass, brushed hairline copper.`
        });
      }
      if (count >= 5) {
        list.push({
          id: `var-${Date.now()}-4`,
          versionLabel: 'VERSION 04 — EXPLODED HARDWARE ISOMETRIC',
          imagePrompt: `exploded isometric technical render of precision titanium dial and tactile haptic bearings, 8k uhd`,
          imageUrl: '/src/assets/images/scandinavian_dawn_studio_1790755765807.jpg',
          content: `[PRODUCT STUDIO RENDER SPEC · EXPLODED ISOMETRIC]`
        });
        list.push({
          id: `var-${Date.now()}-5`,
          versionLabel: 'VERSION 05 — DESK INTEGRATION HERO',
          imagePrompt: `luxury architect desk with floating glass terminal displaying minimal interface, dawn light, 8k`,
          imageUrl: '/src/assets/images/swiss_brand_specimen_1790755749195.jpg',
          content: `[PRODUCT STUDIO RENDER SPEC · DESK INTEGRATION]`
        });
      }
    } else if (cat === 'Brand Specimen') {
      const b = formsState.heroBriefForm;
      const promptText = `swiss modernism typography specimen poster, ${b.focalSubject || 'hairline font-display font-bold typography system with strict asymmetric grid'}, black and ivory ink on textured cotton rag paper, museum archive, 8k uhd`;

      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — SWISS GRID POSTER',
        imagePrompt: promptText,
        imageUrl: '/src/assets/images/swiss_brand_specimen_1790755749195.jpg',
        content: `[BRAND & EDITORIAL SPECIMEN · TYPOGRAPHIC SHEET]
Format: 350gsm Cotton Rag Specimen Poster (A2 / 16:9)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Concept: ${b.focalSubject || 'Architectural scale typographic layout demonstrating Nexora’s serene hierarchy.'}
• Grid System: 12-column asymmetric baseline grid with 40mm exterior margins.
• Color System: Deep Forest Obsidian (#071C1A), Warm Parchment (#FDFBF7), Soft Sage (#A9BFA5).
• Paper & Finish: Uncoated heavy linen stock with deep blind deboss brand seal.`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — FOIL EMBOSSED LOCKUP',
          imagePrompt: `close-up debossed warm brass foil logo lockup on dark matte obsidian linen board, angled raking light, 8k`,
          imageUrl: '/src/assets/images/spatial_key_visual_1790755715787.jpg',
          content: `[BRAND & EDITORIAL SPECIMEN · DEBOSSED FOIL LOCKUP]
• Concept: Deep blind-embossed typography with selective micro-foil accent on hand-milled cardstock.`
        });
      }
      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — SPATIAL RATIO DOSSIER',
          imagePrompt: `architectural fold-out blueprint brochure with hairline graphs and golden ratio dimensions, minimal, 8k`,
          imageUrl: '/src/assets/images/scandinavian_dawn_studio_1790755765807.jpg',
          content: `[BRAND & EDITORIAL SPECIMEN · GOLDEN RATIO SPECIMEN]
• Concept: Multi-page accordion fold-out brochure with architectural proportion ratios and typographic specimens.`
        });
      }
      if (count >= 5) {
        list.push({
          id: `var-${Date.now()}-4`,
          versionLabel: 'VERSION 04 — MONOCHROME BILLBOARD MOCKUP',
          imagePrompt: `brutalist concrete gallery wall with minimal typography exhibition poster, 8k`,
          imageUrl: '/src/assets/images/titanium_studio_render_1790755733959.jpg',
          content: `[BRAND & EDITORIAL SPECIMEN · GALLERY BILLBOARD]`
        });
        list.push({
          id: `var-${Date.now()}-5`,
          versionLabel: 'VERSION 05 — EDITORIAL COVER SPECIMEN',
          imagePrompt: `quarterly hardcover journal cover with hairline typography and debossed title, 8k`,
          imageUrl: '/src/assets/images/ceramic_glass_volume_1790755783767.jpg',
          content: `[BRAND & EDITORIAL SPECIMEN · HARDCOVER JOURNAL]`
        });
      }
    } else if (cat === 'Product Demo') {
      const a = formsState.adScriptForm;
      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — 60S INTERACTIVE SCREENFLOW',
        content: `[PRODUCT DEMO WALKTHROUGH · 60-SECOND SCREENFLOW]
Pacing: Measured, Architectural & Serene
Audio: Minimalist ambient synth pad with soft acoustic clicks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[00:00 - 00:12] SCENE 01 · THE SILENT CANVAS
• Video: Fluid 60fps screen capture gliding across Nexora's obsidian dashboard. Zero red badges or jarring alerts.
• Voiceover (Warm, Calm): "Modern agencies don’t need louder software. They need computational composure."

[00:12 - 00:30] SCENE 02 · REAL-TIME PIPELINE INTELLIGENCE
• Video: Single keypress opens live lead scoring. AI automatically ranks high-conviction studio inquiries without friction.
• Voiceover: "Nexora unifies client acquisition, pipeline tracking, and revenue forecasting into a single hairline canvas."

[00:30 - 00:48] SCENE 03 · AUTOMATED STILL OUTREACH
• Video: One click generates bespoke VIP outreach copy with editorial precision.
• Voiceover: "No bloat. No phantom urgency. Just quiet execution."

[00:48 - 01:00] SCENE 04 · CLOSING MONOGRAM & ACCESS
• Video: Screen fades to minimalist monogram. Hairline URL appears: nexora.studio/demo.
• Voiceover: "Make space for what matters. Reserve your atelier access today."`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — 30S QUICK FEATURE SPRINT',
          content: `[PRODUCT DEMO WALKTHROUGH · 30S FEATURE SPRINT]
• Focus: Rapid zero-friction lead conversion and automated calendar sync.`
        });
      }
      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — ARCHITECTURAL DEEP-DIVE',
          content: `[PRODUCT DEMO WALKTHROUGH · ARCHITECTURAL DEEP-DIVE]
• Focus: Full studio workflow walkthrough from discovery call to retainer signoff.`
        });
      }
    } else if (cat === 'Brand Film') {
      const a = formsState.adScriptForm;
      list.push({
        id: `var-${Date.now()}-1`,
        versionLabel: 'VERSION 01 — MANIFESTO: IN PRAISE OF STILLNESS',
        content: `[BRAND MANIFESTO FILM · 90-SECOND CINEMATIC SCRIPT]
Aspect Ratio: 2.39:1 Anamorphic Cinema
Audio: Solo cello harmonics and tactile room tone
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[00:00 - 00:20] PROLOGUE · THE COGNITIVE TOLL
• Visual: Dawn light sweeps over an empty timber studio desk. A designer sits quietly with tea. Suddenly, three monitors light up with flashing alerts, red counter numbers, and chime notifications.
• Audio: Cacophony of synthetic chimes slowly builds, then abruptly cuts to total silence.
• Voiceover: "At some point over the last decade, business software made a fatal mistake: it mistook noise for engagement."

[00:20 - 00:50] THE THESIS · ARCHITECTURE FOR THOUGHT
• Visual: Macro shot of a titanium pen drafting a single clean hairline on paper. The shot transitions into Nexora's dark glass interface.
• Audio: Warm, sustained cello chord enters.
• Voiceover: "The tools you open at 8 AM dictate the boundaries of your mind. If your software is chaotic, your judgment will be fractured. We engineered Nexora as quiet architecture for deliberate work."

[00:50 - 01:20] THE CONVICTION · ZERO NOISE
• Visual: Fluid choreography of studio directors managing multimillion-dollar accounts in seamless silence. Hairline typography. Serene pacing.
• Voiceover: "No unread badges. No synthetic urgency. Just pure, uncompromised focus."

[01:20 - 01:30] EPILOGUE · THE CALL
• Visual: Monolithic brass wordmark on obsidian slate.
• Voiceover: "Stillness is not the absence of energy. It is the concentration of power. Nexora Atelier OS."`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — THE CRAFT OF REST',
          content: `[BRAND MANIFESTO FILM · THE CRAFT OF REST]
• Pacing: Meditative essay on slowing down to accelerate quality.`
        });
      }
      if (count >= 3) {
        list.push({
          id: `var-${Date.now()}-3`,
          versionLabel: 'VERSION 03 — ARCHITECTURAL CADENCE',
          content: `[BRAND MANIFESTO FILM · ARCHITECTURAL CADENCE]
• Pacing: High-contrast Scandinavian architecture and computational clarity.`
        });
      }
    }

    return list;
  };

  // -------------------------------------------------------------
  // Primary Generate Handler (Structured & Quick)
  // -------------------------------------------------------------
  const handleGenerate = (customPrompt?: string, countOverride?: number, catOverride?: CategoryType) => {
    setIsGenerating(true);
    const cat = catOverride || selectedCategory;
    const count = countOverride || variationsCount;

    setTimeout(() => {
      const generated = generateVariationsForCategory(cat, count, customPrompt);
      setVariations(generated);
      setActiveVariationIndex(0);
      setIsGenerating(false);

      // Save primary asset to the archive
      if (generated[0]) {
        const title = customPrompt 
          ? customPrompt.slice(0, 45) + '...' 
          : `${cat} — ${brandContext.productName}`;

        const newAsset: GeneratedAsset = {
          id: `asset-${Date.now()}`,
          title: title,
          type: cat,
          platform: cat === 'Social Post'
            ? formsState.socialForm.platform
            : (cat === 'Ad Script' || cat === 'Product Demo' || cat === 'Brand Film')
              ? 'Paid Video & Motion'
              : (cat === 'Hero Brief' || cat === 'Product Render' || cat === 'Brand Specimen')
                ? 'Studio 3D & Visual'
                : 'Atelier Studio',
          preview: generated[0].content.slice(0, 140) + '...',
          createdAt: 'Just now',
          tags: [cat.split(' ')[0], brandContext.productName.split(' ')[0], 'Studio'],
          imageUrl: generated[0].imageUrl,
          campaign: campaign?.name,
          status: 'Draft',
          version: 1,
          versions: []
        };
        setLastAssetId(newAsset.id);
        onGenerateSuccess(newAsset);
      }
    }, 750);
  };

  // 11. Refine Handler: iterates in-place on the active variation
  const handleRefine = (instruction: string) => {
    if (!variations[activeVariationIndex]) return;

    setIsGenerating(true);
    setTimeout(() => {
      const current = variations[activeVariationIndex];
      let refined = current.content;

      const lower = instruction.toLowerCase();
      if (lower.includes('shorter') || lower.includes('minimal')) {
        refined = `[REFINED · CONCISE ATELIER EDIT]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` + 
          current.content
            .split('\n')
            .filter(line => !line.includes('P.S.') && !line.includes('Author Bio') && !line.includes('TECHNICAL DELIVERABLE'))
            .slice(0, 14)
            .join('\n') + `\n\n→ Explore stillness: nexora.studio`;
      } else if (lower.includes('premium') || lower.includes('human')) {
        refined = current.content.replace(
          /Rather than bombarding your team with saturated alerts/g,
          'Where conventional systems demand urgency, Nexora cultivates sustained executive focus'
        ) + `\n\n[REFINEMENT NOTE: Elevated diction, restrained pacing, and heightened spatial typography applied.]`;
      } else if (lower.includes('provocative')) {
        refined = current.content.replace(
          /When we examined the digital workflows/g,
          'Most enterprise CRMs are deliberate attention traps engineered to simulate activity'
        );
      } else {
        refined = current.content + `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[AI REFINEMENT APPLIED: "${instruction}"]\n• Content recalibrated to respect specific studio constraints while maintaining hairline composure.`;
      }

      const updated = [...variations];
      updated[activeVariationIndex] = {
        ...current,
        content: refined,
        versionLabel: `${current.versionLabel} (REFINED)`
      };
      setVariations(updated);
      setIsGenerating(false);
    }, 550);
  };

  // Edits to a saved draft become a new version once typing pauses, so history isn't one entry per keystroke.
  const editBase = useRef<string | null>(null);
  const editTimer = useRef<number | undefined>(undefined);
  const handleUpdateVariationContent = (idx: number, newContent: string) => {
    const updated = [...variations];
    if (updated[idx]) {
      if (editBase.current === null) editBase.current = updated[idx].content;
      updated[idx] = { ...updated[idx], content: newContent };
      setVariations(updated);
      window.clearTimeout(editTimer.current);
      editTimer.current = window.setTimeout(() => {
        const base = editBase.current;
        editBase.current = null;
        const asset = assets.find(a => a.id === lastAssetId);
        if (!asset || base === null || base === newContent) return;
        const v = asset.version ?? 1;
        onUpdateAsset?.(asset.id, {
          preview: newContent,
          version: v + 1,
          versions: [...(asset.versions ?? []), { version: v, at: 'Just now', text: base }],
          status: asset.status === 'Scheduled' || asset.status === 'Published' ? asset.status : 'Draft',
        });
      }, 900);
    }
  };

  const handleUpdateVariationImage = (idx: number, newImageUrl: string) => {
    const updated = [...variations];
    if (updated[idx]) {
      updated[idx] = { ...updated[idx], imageUrl: newImageUrl };
      setVariations(updated);
    }
  };

  const handleCopyAsset = (text: string, id: string) => {
    void copyText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full animate-fadeIn space-y-[15px]">
      <PageHeader
        eyebrow="Marketing / Content"
        title="Content"
        subtitle={
          isAssetsView
            ? 'Everything you have created, ready to reuse or schedule.'
            : 'Create marketing content from a brief, then edit, save or schedule it.'
        }
      />
      <ContentTabs active={isAssetsView ? 'library' : 'create'} onNavigate={onNavigateSub} libraryCount={assets.length} />

      {scheduling && variations[activeVariationIndex] && (
        <ScheduleDialog
          title={`${selectedCategory} · ${variations[activeVariationIndex].versionLabel}`}
          defaultChannel={selectedCategory === 'Social Post' ? formsState.socialForm.platform : selectedCategory === 'Email Copy' ? 'Email' : 'LinkedIn'}
          onClose={() => setScheduling(false)}
          onConfirm={(channel, when) => {
            const v = variations[activeVariationIndex];
            onSchedulePost?.({
              id: `post-${Date.now()}`,
              title: `${selectedCategory} — ${brandContext.productName}`,
              content: v.content,
              platforms: [channel],
              scheduledAt: when.toISOString(),
              scheduledTime: when.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
              status: 'Scheduled',
              tags: campaign ? [campaign.name] : undefined,
              author: 'You',
              createdAt: 'Just now',
            });
            if (lastAssetId) onUpdateAsset?.(lastAssetId, { status: 'Scheduled' });
            setScheduling(false);
          }}
        />
      )}

      {!isAssetsView ? (
        /* CREATE EXPERIENCE */
        <div className="space-y-4">
          {/* Top Control Bar: Mode Toggle + Compact Brand Context */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-1.5 shrink-0">
              <button type="button" onClick={() => setCreateMode('quick')}
                className={`nx-tab inline-flex items-center gap-1.5 ${createMode === 'quick' ? 'active' : ''}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Prompt</span>
              </button>
              <button type="button" onClick={() => setCreateMode('structured')}
                className={`nx-tab inline-flex items-center gap-1.5 ${createMode === 'structured' ? 'active' : ''}`}>
                <Layers className="w-3.5 h-3.5" />
                <span>Structured Brief</span>
              </button>
            </div>

            {campaigns.length > 0 && (
              <label className="flex items-center gap-2 text-[11px] font-bold text-ink-3 shrink-0">
                Campaign
                <select
                  value={campaignId}
                  onChange={e => setCampaignId(e.target.value)}
                  aria-label="Link to campaign"
                  className="max-w-[200px]"
                >
                  <option value="">None</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            )}

            <div className="flex-1 sm:max-w-md w-full">
              <BrandContextBanner
                context={brandContext}
                onUpdateContext={setBrandContext}
              />
            </div>
          </div>

          {/* 3 Core Asset Categories (Text, Images, Videos + Sub-format dropdown) */}
          <CategoryNav
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setVariations([]);
            }}
          />

          {/* MAIN GENERATION WORKFLOW GRID (Input vs Output Workspace) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Input Form (Quick or Structured) */}
            <div className="lg:col-span-6 space-y-4">
              {createMode === 'quick' ? (
                <QuickGenerateForm
                  onQuickGenerate={(prompt, count, detectedCat) => {
                    setSelectedCategory(detectedCat);
                    handleGenerate(prompt, count, detectedCat);
                  }}
                  isGenerating={isGenerating}
                />
              ) : (
                <StructuredBriefForms
                  category={selectedCategory}
                  formsState={formsState}
                  onUpdateState={setFormsState}
                  variationsCount={variationsCount}
                  onSelectVariationsCount={setVariationsCount}
                  onGenerate={() => handleGenerate()}
                  onLoadExample={handleLoadExample}
                  onClearForm={handleClearForm}
                  isGenerating={isGenerating}
                />
              )}
            </div>

            {/* Right Column: Output Workspace (Versions, Edit, Refine, Export, Image Render) */}
            <div className="lg:col-span-6 sticky top-4">
              <OutputWorkspace
                category={selectedCategory}
                variations={variations}
                activeVariationIndex={activeVariationIndex}
                onSelectVariation={setActiveVariationIndex}
                onUpdateVariationContent={handleUpdateVariationContent}
                onUpdateVariationImage={handleUpdateVariationImage}
                onRegenerate={() => handleGenerate()}
                onRefine={handleRefine}
                isGenerating={isGenerating}
                onSchedule={
                  onSchedulePost && variations[activeVariationIndex] && getMainCategoryForSub(selectedCategory) === 'text'
                    ? () => setScheduling(true)
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      ) : (
        /* GENERATED ASSETS ARCHIVE (Existing functionality fully preserved) */
        <div className="space-y-6">
          {/* Filter Bar & Count */}
          <div
            className={`border ${
              'border-line bg-surface'
            } p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[9px] transition-colors shadow-sm`}
          >
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              {[{ id: 'All', label: 'All', count: assets.length }, ...MAIN_CATEGORIES.map(m => ({
                id: m.id as string,
                label: m.label,
                count: assets.filter(x => getMainCategoryForSub(x.type as CategoryType) === m.id).length,
              }))].map((f) => {
                const isSelected = typeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTypeFilter(f.id)}
                    className={`nx-tab ${isSelected ? 'active' : ''}`}
                  >
                    {f.label} <span className="nx-tab-count">{f.count}</span>
                  </button>
                );
              })}
            </div>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status" className="w-full sm:w-[170px]">
              {['All', 'Draft', 'Awaiting approval', 'Approved', 'Scheduled', 'Published'].map(o => <option key={o} value={o}>{o === 'All' ? 'All statuses' : o}</option>)}
            </select>
            <input
              type="search"
              value={libQuery}
              onChange={e => setLibQuery(e.target.value)}
              placeholder="Search library"
              aria-label="Search library"
              className="nx-input w-full sm:w-[220px]"
            />
            <div
              className={`text-[11px] font-mono shrink-0 ${
                'text-ink-2'
              }`}
            >
              Showing{' '}
              {filteredAssets.length === 0
                ? 0
                : `${(assetPage - 1) * assetPageSize + 1}–${Math.min(
                    assetPage * assetPageSize,
                    filteredAssets.length
                  )}`}{' '}
              of {filteredAssets.length} assets
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div
              className={`p-12 border ${
                'border-line bg-surface'
              } text-center text-xs rounded-[9px] space-y-2`}
            >
              <div
                className={`font-display font-bold text-base ${
                  'text-ink'
                }`}
              >
                No assets match this category
              </div>
              <p
                className={
                  'text-ink-3'
                }
              >
                Select another filter above, or switch to "Create" to synthesize new assets for this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`border ${
                    'border-line bg-surface hover:border-line'
                  } p-6 rounded-[9px] transition-colors flex flex-col justify-between shadow-sm`}
                >
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span
                        className={`text-[10px] uppercase tracking-widest font-mono font-medium ${
                          'text-brand'
                        }`}
                      >
                        {asset.type} · {asset.platform}
                      </span>
                      <span
                        className={`text-[10px] font-mono ${
                          'text-ink-3'
                        }`}
                      >
                        {asset.createdAt}
                      </span>
                    </div>

                    {(asset.status || asset.campaign) && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {asset.status && <StatusBadge status={asset.status} />}
                        {asset.campaign && <span className="nx-tag teal">{asset.campaign}</span>}
                      </div>
                    )}

                    <h4
                      className={`font-display font-bold tracking-[-0.3px] mb-3 ${
                        'text-ink'
                      }`}
                    >
                      {asset.title}
                    </h4>

                    {asset.imageUrl && (
                      <div className="mb-3.5 aspect-video w-full rounded-[9px] overflow-hidden border border-inherit bg-black shadow-sm">
                        <img
                          src={asset.imageUrl}
                          alt={asset.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                        />
                      </div>
                    )}

                    <p
                      className={`text-xs font-light leading-relaxed mb-4 line-clamp-3 ${
                        'text-ink-3'
                      }`}
                    >
                      {asset.preview.replace(/[━─═]{3,}/g, ' ').replace(/\s+/g, ' ')}
                    </p>
                  </div>

                  {!asset.imageUrl && (
                    <div className="mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {(asset.status ?? 'Draft') === 'Draft' && (
                          <button type="button" className="nx-btn sm" onClick={() => onUpdateAsset?.(asset.id, { status: 'Awaiting approval' })}>Request approval</button>
                        )}
                        {asset.status === 'Awaiting approval' && (
                          <>
                            <button type="button" className="nx-btn sm primary" onClick={() => onUpdateAsset?.(asset.id, { status: 'Approved' })}>Approve</button>
                            <button type="button" className="nx-btn sm" onClick={() => onUpdateAsset?.(asset.id, { status: 'Draft' })}>Send back</button>
                          </>
                        )}
                        {asset.status === 'Approved' && (
                          <button type="button" className="nx-btn sm" onClick={() => onUpdateAsset?.(asset.id, { status: 'Draft' })}>Reopen as draft</button>
                        )}
                        <button
                          type="button"
                          className="nx-inline-link ml-auto"
                          aria-expanded={historyOpen === asset.id}
                          onClick={() => setHistoryOpen(historyOpen === asset.id ? null : asset.id)}
                        >
                          Version {asset.version ?? 1}{(asset.versions?.length ?? 0) > 0 ? ` · History (${asset.versions!.length})` : ''}
                        </button>
                      </div>
                      {historyOpen === asset.id && (
                        <div className="mt-2 border border-line rounded-[10px] divide-y divide-line">
                          <div className="px-3 py-2 text-[11px]"><strong className="text-ink">Version {asset.version ?? 1} (current)</strong></div>
                          {[...(asset.versions ?? [])].reverse().map(v => (
                            <div key={v.version} className="px-3 py-2 text-[11px] flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <strong className="text-ink">Version {v.version}</strong> <span className="text-ink-3">· {v.at}</span>
                                <p className="m-0 mt-0.5 text-ink-3 line-clamp-2">{v.text.replace(/[━─═]{3,}/g, ' ').replace(/\s+/g, ' ')}</p>
                              </div>
                              <button
                                type="button"
                                className="nx-btn sm shrink-0"
                                onClick={() => {
                                  const cur = asset.version ?? 1;
                                  onUpdateAsset?.(asset.id, {
                                    preview: v.text,
                                    version: cur + 1,
                                    versions: [...(asset.versions ?? []), { version: cur, at: 'Just now', text: asset.preview }],
                                    status: 'Draft',
                                  });
                                }}
                              >
                                Restore
                              </button>
                            </div>
                          ))}
                          {(asset.versions?.length ?? 0) === 0 && <div className="px-3 py-2 text-[11px] text-ink-3">No earlier versions. Edit this draft in the Studio to create one.</div>}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`pt-4 border-t ${
                      'border-line'
                    } flex items-center justify-between`}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags.map((t) => (
                        <span
                          key={t}
                          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border rounded-[7px] font-mono ${
                            'border-line bg-surface-hover text-ink-2'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAsset(asset.preview, asset.id)}
                      className={`text-xs uppercase tracking-widest flex items-center space-x-1 cursor-pointer transition-colors ${
                        'text-brand hover:text-brand-hover'
                      }`}
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy
                            className={`w-3 h-3 ${
                              'text-ink-2'
                            }`}
                          />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assets Grid Pagination */}
          {filteredAssets.length > 0 && (
            <div
              className={`border ${
                'border-line bg-surface'
              } rounded-[9px] transition-colors shadow-sm`}
            >
              <Pagination
                currentPage={assetPage}
                totalItems={filteredAssets.length}
                pageSize={assetPageSize}
                onPageChange={setAssetPage}
                onPageSizeChange={setAssetPageSize}
                pageSizeOptions={[4, 6, 8]}
                itemName="assets"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

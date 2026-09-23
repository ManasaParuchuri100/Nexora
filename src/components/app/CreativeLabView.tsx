import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Layers,
  ArrowRight,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { GeneratedAsset, SubCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import Pagination from './Pagination';
import BrandContextBanner, { DEFAULT_BRAND_CONTEXT, BrandContext } from './creative/BrandContextBanner';
import CategoryNav, { CategoryType } from './creative/CategoryNav';
import QuickGenerateForm from './creative/QuickGenerateForm';
import StructuredBriefForms, { StructuredFormsState } from './creative/StructuredBriefForms';
import OutputWorkspace, { GeneratedVariation } from './creative/OutputWorkspace';

interface CreativeLabViewProps {
  activeSubCategory: SubCategory;
  assets: GeneratedAsset[];
  onNavigateSub: (sub: SubCategory) => void;
  onGenerateSuccess: (newAsset: GeneratedAsset) => void;
}

export default function CreativeLabView({
  activeSubCategory,
  assets,
  onNavigateSub,
  onGenerateSuccess
}: CreativeLabViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const isAssetsView = activeSubCategory === 'generated-assets';

  // 2. Generation Mode: Structured Brief (default) vs Quick Generate
  const [createMode, setCreateMode] = useState<'structured' | 'quick'>('structured');

  // 3. Global Brand Context
  const [brandContext, setBrandContext] = useState<BrandContext>(DEFAULT_BRAND_CONTEXT);

  // 1. Active Category (Email Copy, Social Post, Headline Set, Ad Script, Thought Leadership, Hero Brief)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Email Copy');

  // 10. Variations count: 1, 3, or 5 (defaults to 3 for rich multi-version studio experience)
  const [variationsCount, setVariationsCount] = useState<number>(3);

  const [isGenerating, setIsGenerating] = useState(false);
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
      subheadGuidance: 'Max 12 words with serif styling',
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

  useEffect(() => {
    setAssetPage(1);
  }, [typeFilter]);

  const filteredAssets = useMemo(() => {
    if (typeFilter === 'All') return assets;
    return assets.filter(a => a.type === typeFilter);
  }, [assets, typeFilter]);

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
          subheadGuidance: 'Max 12 words with serif styling',
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
    } else if (selectedCategory === 'Ad Script') {
      setFormsState(prev => ({
        ...prev,
        adScriptForm: { ...prev.adScriptForm, hookScene: '', coreTension: '', solutionReveal: '', closingCta: '' }
      }));
    } else if (selectedCategory === 'Thought Leadership') {
      setFormsState(prev => ({
        ...prev,
        thoughtLeadershipForm: { ...prev.thoughtLeadershipForm, workingTitle: '', coreThesis: '', supportingArguments: '', pullQuote: '' }
      }));
    } else if (selectedCategory === 'Hero Brief') {
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
  • Constraints: ${b.additionalConstraints || 'No neon glow, maintain 120px left margin for serif typography'}`
      });

      if (count >= 2) {
        list.push({
          id: `var-${Date.now()}-2`,
          versionLabel: 'VERSION 02 — MONOLITHIC TITANIUM',
          imagePrompt: `monolithic titanium desk terminal floating in obsidian void, soft warm 3200k spotlight, hairline gold wireframe crm graph, extreme macro texture, 8k studio product render`,
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
          content: `[CREATIVE ART DIRECTION BRIEF · MACRO TACTILE]`
        });
        list.push({
          id: `var-${Date.now()}-5`,
          versionLabel: 'VERSION 05 — EDITORIAL SPECIMEN',
          imagePrompt: `swiss typography specimen poster printed on heavy uncoated linen paper, hairline layouts`,
          content: `[CREATIVE ART DIRECTION BRIEF · EDITORIAL SPECIMEN]`
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
          platform: cat === 'Social Post' ? formsState.socialForm.platform : cat === 'Ad Script' ? 'Paid Video' : 'Atelier Studio',
          preview: generated[0].content.slice(0, 140) + '...',
          createdAt: 'Just now',
          tags: [cat.split(' ')[0], brandContext.productName.split(' ')[0], 'Studio']
        };
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

  const handleUpdateVariationContent = (idx: number, newContent: string) => {
    const updated = [...variations];
    if (updated[idx]) {
      updated[idx] = { ...updated[idx], content: newContent };
      setVariations(updated);
    }
  };

  const handleCopyAsset = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 py-3">
      {/* Header with Subnav Switcher */}
      <section
        className={`border-b ${
          isLight ? 'border-[#E2ECE0]' : 'border-[rgba(169,191,165,0.2)]'
        } pb-5 flex flex-col md:flex-row md:items-end justify-between gap-5`}
      >
        <div>
          <span
            className={`text-[10px] sm:text-xs uppercase tracking-widest-plus ${
              isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
            } font-normal block mb-1.5`}
          >
            AI CREATIVE LABORATORY
          </span>
          <h1
            className={`serif text-3xl sm:text-4xl font-light ${
              isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'
            } tracking-tight`}
          >
            Creative Lab
          </h1>
          <p
            className={`mt-2 text-xs sm:text-sm ${
              isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/80'
            } font-light leading-relaxed max-w-xl`}
          >
            Synthesize high-conviction marketing copy, video storyboards, editorial essays, and visual art briefs tailored to each creative asset category.
          </p>
        </div>

        {/* Subnav switcher: Create vs Generated Assets */}
        <div
          className={`flex items-center space-x-6 text-xs uppercase tracking-widest border-b ${
            isLight ? 'border-[#E2ECE0]' : 'border-[rgba(169,191,165,0.2)]'
          } pb-1`}
        >
          <button
            type="button"
            onClick={() => onNavigateSub('create')}
            className={`pb-1 border-b transition-colors cursor-pointer font-mono ${
              !isAssetsView
                ? isLight
                  ? 'text-[#122420] border-[#143630] font-semibold'
                  : 'text-[#E8E9D8] border-[#E8E9D8] font-medium'
                : isLight
                  ? 'text-[#3E6A5E] border-transparent hover:text-[#122420]'
                  : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
            }`}
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => onNavigateSub('generated-assets')}
            className={`pb-1 border-b transition-colors cursor-pointer font-mono ${
              isAssetsView
                ? isLight
                  ? 'text-[#122420] border-[#143630] font-semibold'
                  : 'text-[#E8E9D8] border-[#E8E9D8] font-medium'
                : isLight
                  ? 'text-[#3E6A5E] border-transparent hover:text-[#122420]'
                  : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
            }`}
          >
            Generated Assets ({assets.length})
          </button>
        </div>
      </section>

      {!isAssetsView ? (
        /* CREATE EXPERIENCE */
        <div className="space-y-6">
          {/* 2. MODE SWITCHER: [ Quick Generate ] [ Structured Brief ] */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex rounded-[2px] border border-inherit p-0.5 bg-inherit">
              <button
                type="button"
                onClick={() => setCreateMode('quick')}
                className={`px-3.5 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  createMode === 'quick'
                    ? isLight
                      ? 'bg-[#143630] text-white font-medium rounded-[1px] shadow-sm'
                      : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px] shadow-sm'
                    : isLight
                      ? 'text-[#3E6A5E] hover:text-[#122420]'
                      : 'text-[#A9BFA5]/70 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Generate</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateMode('structured')}
                className={`px-3.5 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  createMode === 'structured'
                    ? isLight
                      ? 'bg-[#143630] text-white font-medium rounded-[1px] shadow-sm'
                      : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px] shadow-sm'
                    : isLight
                      ? 'text-[#3E6A5E] hover:text-[#122420]'
                      : 'text-[#A9BFA5]/70 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Structured Brief</span>
              </button>
            </div>

            <span
              className={`text-[11px] font-mono ${
                isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'
              }`}
            >
              {createMode === 'quick'
                ? 'Prompt with natural language'
                : 'Configure precision category parameters'}
            </span>
          </div>

          {/* 3. GLOBAL BRAND CONTEXT BANNER */}
          <BrandContextBanner
            context={brandContext}
            onUpdateContext={setBrandContext}
          />

          {/* 1. COMPACT ASSET CATEGORY SELECTOR (Email, Social, Headlines, Video, Editorial, Visual) */}
          <CategoryNav
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              // Clear previous outputs when switching category to keep workflow clean
              setVariations([]);
            }}
          />

          {/* 15. MAIN GENERATION WORKFLOW GRID (Input vs Output Workspace) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Left Column: Input Form (Quick or Structured) */}
            <div className="lg:col-span-6 space-y-6">
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
                onRegenerate={() => handleGenerate()}
                onRefine={handleRefine}
                isGenerating={isGenerating}
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
              isLight
                ? 'border-[#E2ECE0] bg-white'
                : 'border-[rgba(169,191,165,0.2)] bg-[#071C1A]'
            } p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[2px] transition-colors shadow-sm`}
          >
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <span
                className={`text-[10px] uppercase tracking-widest font-mono mr-2 shrink-0 ${
                  isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'
                }`}
              >
                Category:
              </span>
              {(
                [
                  'All',
                  'Email Copy',
                  'Social Post',
                  'Headline Set',
                  'Ad Script',
                  'Thought Leadership',
                  'Hero Brief'
                ] as const
              ).map((f) => {
                const isSelected = typeFilter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTypeFilter(f)}
                    className={`px-3 py-1 text-xs uppercase tracking-wider border rounded-[1px] transition-colors cursor-pointer shrink-0 font-mono ${
                      isSelected
                        ? isLight
                          ? 'bg-[#143630] text-white border-[#143630] font-medium'
                          : 'bg-[#0D2D2A] text-[#E8E9D8] border-[#A9BFA5] font-semibold'
                        : isLight
                          ? 'bg-[#F8F9F5] text-[#3E6A5E] border-[#D0DDD0] hover:text-[#122420]'
                          : 'text-[#A9BFA5]/60 border-[rgba(169,191,165,0.15)] hover:text-[#E8E9D8]'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            <div
              className={`text-[11px] font-mono shrink-0 ${
                isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]/70'
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
                isLight
                  ? 'border-[#E2ECE0] bg-white'
                  : 'border-[rgba(169,191,165,0.2)] bg-[#071C1A]'
              } text-center text-xs rounded-[2px] space-y-2`}
            >
              <div
                className={`serif text-base ${
                  isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'
                }`}
              >
                No assets match this category
              </div>
              <p
                className={
                  isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'
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
                    isLight
                      ? 'border-[#E2ECE0] bg-white hover:border-[#D0DDD0]'
                      : 'border-[rgba(169,191,165,0.2)] bg-[#071C1A] hover:bg-[#0D2D2A]/20'
                  } p-6 rounded-[2px] transition-colors flex flex-col justify-between shadow-sm`}
                >
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span
                        className={`text-[10px] uppercase tracking-widest font-mono font-medium ${
                          isLight ? 'text-[#143630]' : 'text-[#A9BFA5]'
                        }`}
                      >
                        {asset.type} · {asset.platform}
                      </span>
                      <span
                        className={`text-[10px] font-mono ${
                          isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'
                        }`}
                      >
                        {asset.createdAt}
                      </span>
                    </div>

                    <h4
                      className={`serif text-lg font-light mb-3 ${
                        isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'
                      }`}
                    >
                      {asset.title}
                    </h4>

                    <p
                      className={`text-xs font-light leading-relaxed mb-4 line-clamp-3 ${
                        isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/80'
                      }`}
                    >
                      {asset.preview}
                    </p>
                  </div>

                  <div
                    className={`pt-4 border-t ${
                      isLight
                        ? 'border-[#E2ECE0]'
                        : 'border-[rgba(169,191,165,0.15)]'
                    } flex items-center justify-between`}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags.map((t) => (
                        <span
                          key={t}
                          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border rounded-[1px] font-mono ${
                            isLight
                              ? 'border-[#D0DDD0] bg-[#EDF3EA] text-[#244B40]'
                              : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5]/70'
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
                        isLight
                          ? 'text-[#143630] hover:text-[#0A1F1B]'
                          : 'text-[#E8E9D8] hover:text-white'
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
                              isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
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
                isLight
                  ? 'border-[#E2ECE0] bg-white'
                  : 'border-[rgba(169,191,165,0.2)] bg-[#071C1A]'
              } rounded-[2px] transition-colors shadow-sm`}
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

import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { CategoryType } from './CategoryNav';

interface QuickGenerateFormProps {
  onQuickGenerate: (prompt: string, variationsCount: number, detectedCategory: CategoryType) => void;
  isGenerating: boolean;
}

export default function QuickGenerateForm({
  onQuickGenerate,
  isGenerating
}: QuickGenerateFormProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [prompt, setPrompt] = useState('');
  const [variationsCount, setVariationsCount] = useState<number>(3);

  const SUGGESTIONS = [
    {
      label: 'VIP Launch Email',
      text: 'Create a launch email for Nexora Atelier OS aimed at creative directors and agency founders.',
      cat: 'Email Copy' as CategoryType
    },
    {
      label: 'Contrarian X Post',
      text: 'Write a sharp contrarian post about how notification badges fracture creative agency productivity.',
      cat: 'Social Post' as CategoryType
    },
    {
      label: 'Hero H1 Headlines',
      text: 'Generate 5 high-conviction hero headline lockups for the Nexora Atelier OS release.',
      cat: 'Headline Set' as CategoryType
    },
    {
      label: '30s Atelier Video Ad',
      text: 'Draft a 30-second problem-agitate-solve ad script contrasting noisy software with Nexora calm.',
      cat: 'Ad Script' as CategoryType
    },
    {
      label: '3D Spatial Visual Brief',
      text: 'Generate an art direction brief for a 3D key visual of a dark glass workspace with brass instruments.',
      cat: 'Hero Brief' as CategoryType
    }
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    // Detect category roughly or default to Email Copy / Social
    const lower = prompt.toLowerCase();
    let detected: CategoryType = 'Email Copy';
    if (lower.includes('headline') || lower.includes('h1') || lower.includes('tagline')) {
      detected = 'Headline Set';
    } else if (lower.includes('video') || lower.includes('script') || lower.includes('reel') || lower.includes('ad')) {
      detected = 'Ad Script';
    } else if (lower.includes('visual') || lower.includes('image') || lower.includes('3d') || lower.includes('render') || lower.includes('hero brief')) {
      detected = 'Hero Brief';
    } else if (lower.includes('essay') || lower.includes('editorial') || lower.includes('journal') || lower.includes('article') || lower.includes('thought')) {
      detected = 'Thought Leadership';
    } else if (lower.includes('post') || lower.includes('twitter') || lower.includes('x') || lower.includes('linkedin') || lower.includes('social') || lower.includes('thread')) {
      detected = 'Social Post';
    }

    onQuickGenerate(prompt, variationsCount, detected);
  };

  return (
    <div
      className={`border rounded-[2px] p-6 transition-colors shadow-sm ${
        isLight
          ? 'bg-white border-[#E2ECE0]'
          : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)]'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <label
            htmlFor="quick-prompt"
            className={`text-xs uppercase tracking-widest font-mono font-medium ${
              isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'
            }`}
          >
            What do you want to create?
          </label>
          <span
            className={`text-[11px] font-mono ${
              isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'
            }`}
          >
            Natural Language Generation
          </span>
        </div>

        <div className="relative">
          <textarea
            id="quick-prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
            placeholder="e.g. Create a launch email for Nexora Atelier OS aimed at creative directors."
            className={`w-full text-sm p-3.5 rounded-[2px] border focus:outline-none resize-none leading-relaxed transition-colors ${
              isLight
                ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#122420] focus:border-[#244B40] placeholder-[#889988]'
                : 'bg-[#061816] border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5] placeholder-[#A9BFA5]/30'
            }`}
          />
          <span
            className={`absolute right-3 bottom-3 text-[10px] font-mono pointer-events-none hidden sm:inline-block ${
              isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/50'
            }`}
          >
            ⌘ + Return to generate
          </span>
        </div>

        {/* Suggestions chips */}
        <div className="space-y-1.5 pt-1">
          <span
            className={`text-[10px] uppercase font-mono tracking-wider block ${
              isLight ? 'text-[#668877]' : 'text-[#A9BFA5]/60'
            }`}
          >
            Quick inspiration
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setPrompt(item.text)}
                className={`text-[11px] px-2.5 py-1 rounded-[2px] border font-mono transition-colors cursor-pointer text-left ${
                  isLight
                    ? 'border-[#E2ECE0] bg-[#F8F9F5] text-[#244B40] hover:border-[#143630] hover:bg-[#EDF3EA]'
                    : 'border-[rgba(169,191,165,0.2)] bg-[#0D2D2A]/40 text-[#A9BFA5] hover:border-[#A9BFA5]/60 hover:text-white'
                }`}
              >
                + {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom bar with Variations and Generate button */}
        <div
          className={`pt-4 border-t ${
            isLight ? 'border-[#E2ECE0]' : 'border-[rgba(169,191,165,0.15)]'
          } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
        >
          {/* Variations selector: 1, 3, 5 */}
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] uppercase font-mono tracking-wider ${
                isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/80'
              }`}
            >
              Variations:
            </span>
            <div className="inline-flex rounded-[2px] border border-inherit overflow-hidden">
              {[1, 3, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setVariationsCount(num)}
                  className={`px-3 py-1 text-xs font-mono font-medium transition-colors cursor-pointer ${
                    variationsCount === num
                      ? isLight
                        ? 'bg-[#143630] text-white font-medium'
                        : 'bg-[#E8E9D8] text-[#071C1A] font-semibold'
                      : isLight
                        ? 'bg-[#F8F9F5] text-[#3E6A5E] hover:text-[#122420]'
                        : 'bg-[#061816] text-[#A9BFA5]/60 hover:text-[#E8E9D8]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Prominent Generate button */}
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`px-5 py-2.5 rounded-[2px] text-xs font-mono uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              !prompt.trim() || isGenerating
                ? 'opacity-50 cursor-not-allowed bg-neutral-400 text-white'
                : isLight
                  ? 'bg-[#143630] text-white hover:bg-[#0A1F1B] shadow-sm'
                  : 'bg-[#E8E9D8] text-[#071C1A] hover:bg-white shadow-sm'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ GENERATE</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

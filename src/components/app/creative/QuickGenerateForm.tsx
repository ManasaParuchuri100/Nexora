import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CategoryType } from './CategoryNav';

interface QuickGenerateFormProps {
  onQuickGenerate: (prompt: string, variationsCount: number, detectedCategory: CategoryType) => void;
  isGenerating: boolean;
}

export default function QuickGenerateForm({
  onQuickGenerate,
  isGenerating
}: QuickGenerateFormProps) {

  const [prompt, setPrompt] = useState('');
  const [variationsCount, setVariationsCount] = useState<number>(3);

  const SUGGESTIONS = [
    {
      label: 'VIP Launch Email',
      text: 'Create a launch email for Nexora Atelier OS aimed at creative directors and agency founders.',
      cat: 'Email Copy' as CategoryType
    },
    {
      label: 'Contrarian Social Post',
      text: 'Write a sharp contrarian post about how notification badges fracture creative agency productivity.',
      cat: 'Social Post' as CategoryType
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
      className={`border rounded-[8px] p-5 transition-colors shadow-sm ${
        'bg-surface border-line'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="quick-prompt"
            className={`text-xs font-medium ${
 'text-ink'
 }`}
          >
            Prompt / brief
          </label>
          <span
            className={`text-[11px] font-mono ${
              'text-ink-3'
            }`}
          >
            Press ⌘+Enter to run
          </span>
        </div>

        <div className="relative">
          <textarea
            id="quick-prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
            placeholder="e.g. Create a launch email for Nexora Atelier OS aimed at creative directors..."
            className={`w-full text-xs font-mono p-3 rounded-[8px] border focus:outline-none resize-none leading-relaxed transition-colors ${
              'bg-surface-raised border-line text-ink focus:border-line-strong placeholder:text-ink-3'
            }`}
          />
        </div>

        {/* Quick Inspiration Tags */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span
            className={`text-[12px] font-bold shrink-0 mr-1 ${
 'text-ink-3'
 }`}
          >
            Try:
          </span>
          {SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setPrompt(item.text)}
              className={`text-[11px] px-2 py-0.5 rounded-[8px] border font-mono transition-colors cursor-pointer shrink-0 ${
                'border-line bg-surface-raised text-ink-2 hover:border-brand'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Bottom bar with Variations and Generate button */}
        <div
          className={`pt-3 border-t ${
            'border-line'
          } flex items-center justify-between gap-3`}
        >
          <div className="flex items-center space-x-2">
            <span
              className={`text-[12px] font-bold ${
 'text-ink-3'
 }`}
            >
              Variations:
            </span>
            <div className="inline-flex gap-1.5">
              {[1, 3, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setVariationsCount(num)}
                  className={`nx-chip ${variationsCount === num ? 'active' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`px-4 py-2 rounded-[8px] text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
 !prompt.trim() || isGenerating
 ? 'opacity-40 cursor-not-allowed bg-surface-raised text-ink-3'
 : 'bg-brand text-on-brand hover:bg-brand-hover shadow-sm'
 }`}
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

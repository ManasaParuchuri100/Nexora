import React, { useState } from 'react';
import { Sparkles, Edit3, Check, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export interface BrandContext {
  productName: string;
  brandVoice: string;
  audience: string;
  visualLanguage: string;
  brandConstraints: string;
}

export const DEFAULT_BRAND_CONTEXT: BrandContext = {
  productName: 'Nexora Atelier OS',
  brandVoice: 'Quiet · Precise · Editorial · Premium',
  audience: 'Creative directors · Studio founders',
  visualLanguage: 'Minimal · Architectural · Wabi-Sabi',
  brandConstraints: 'No hype · No excessive emojis · No buzzwords'
};

interface BrandContextBannerProps {
  context: BrandContext;
  onUpdateContext: (newContext: BrandContext) => void;
}

export default function BrandContextBanner({
  context,
  onUpdateContext
}: BrandContextBannerProps) {

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<BrandContext>(context);

  const handleSave = () => {
    onUpdateContext(draft);
    setIsOpen(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_BRAND_CONTEXT);
    onUpdateContext(DEFAULT_BRAND_CONTEXT);
    setIsOpen(false);
  };

  return (
    <div
      className={`border rounded-[8px] transition-all text-xs ${
        'bg-surface border-line text-ink'
      }`}
    >
      {/* Sleek Compact Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center space-x-2.5 truncate">
          <Sparkles
            className={`w-3.5 h-3.5 shrink-0 ${
              'text-brand'
            }`}
          />
          <span
            className={`text-[12px] font-bold shrink-0 font-medium ${
 'text-ink-2'
 }`}
          >
            Brand Context:
          </span>
          <span className="font-medium truncate font-mono text-[12px]">
            {context.productName}
          </span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span
            className={`hidden sm:inline truncate text-[12px] font-light ${
              'text-ink-3'
            }`}
          >
            {context.brandVoice}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-2">
          <button
            type="button"
            onClick={() => {
              if (!isOpen) setDraft(context);
              setIsOpen(!isOpen);
            }}
            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-[8px] border text-[12px] font-mono transition-colors cursor-pointer ${
              isOpen
                ? 'border-brand bg-brand text-on-brand'
                : 'border-line text-ink-2 hover:bg-surface-hover'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>{isOpen ? 'Close' : 'Customize'}</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Customization Form */}
      {isOpen && (
        <div
          className={`p-4 border-t ${
            'border-line bg-surface-raised'
          } space-y-3.5 animate-fadeIn`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label
                className={`block text-[12px] font-bold mb-1 ${
 'text-ink-2'
 }`}
              >
                Product Name
              </label>
              <input
                type="text"
                value={draft.productName}
                onChange={(e) =>
                  setDraft({ ...draft, productName: e.target.value })
                }
                className={`w-full text-xs px-2.5 py-1.5 rounded-[8px] border focus:outline-none ${
                  'bg-surface border-line text-ink focus:border-line-strong'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-[12px] font-bold mb-1 ${
 'text-ink-2'
 }`}
              >
                Brand Voice
              </label>
              <input
                type="text"
                value={draft.brandVoice}
                onChange={(e) =>
                  setDraft({ ...draft, brandVoice: e.target.value })
                }
                className={`w-full text-xs px-2.5 py-1.5 rounded-[8px] border focus:outline-none ${
                  'bg-surface border-line text-ink focus:border-line-strong'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-[12px] font-bold mb-1 ${
 'text-ink-2'
 }`}
              >
                Target Audience
              </label>
              <input
                type="text"
                value={draft.audience}
                onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
                className={`w-full text-xs px-2.5 py-1.5 rounded-[8px] border focus:outline-none ${
                  'bg-surface border-line text-ink focus:border-line-strong'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-[12px] font-bold mb-1 ${
 'text-ink-2'
 }`}
              >
                Brand Constraints
              </label>
              <input
                type="text"
                value={draft.brandConstraints}
                onChange={(e) =>
                  setDraft({ ...draft, brandConstraints: e.target.value })
                }
                className={`w-full text-xs px-2.5 py-1.5 rounded-[8px] border focus:outline-none ${
                  'bg-surface border-line text-ink focus:border-line-strong'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-inherit">
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-[8px] border text-[12px] font-mono transition-colors cursor-pointer ${
                'border-line text-ink-3 hover:text-ink'
              }`}
              title="Reset to Atelier default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-[8px] text-[12px] font-mono font-medium transition-colors cursor-pointer ${
                'bg-brand text-on-brand hover:bg-brand-hover'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Save Context</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

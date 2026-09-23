import React, { useState } from 'react';
import { Sparkles, Edit3, Check, RotateCcw } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<BrandContext>(context);

  const handleSave = () => {
    onUpdateContext(draft);
    setIsEditing(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_BRAND_CONTEXT);
    onUpdateContext(DEFAULT_BRAND_CONTEXT);
    setIsEditing(false);
  };

  return (
    <div
      className={`border rounded-[2px] transition-colors p-4 sm:p-5 ${
        isLight
          ? 'bg-white border-[#E2ECE0] text-[#122420]'
          : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)] text-[#E8E9D8]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit">
        <div className="flex items-center space-x-2">
          <Sparkles
            className={`w-3.5 h-3.5 ${
              isLight ? 'text-[#143630]' : 'text-[#A9BFA5]'
            }`}
          />
          <span
            className={`text-[10px] uppercase tracking-widest font-mono font-medium ${
              isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
            }`}
          >
            NEXORA BRAND CONTEXT
          </span>
          <span
            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-[2px] ${
              isLight
                ? 'bg-[#EDF3EA] text-[#122420]'
                : 'bg-[#0D2D2A] text-[#E8E9D8]'
            }`}
          >
            {context.productName}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setDraft(context);
                setIsEditing(true);
              }}
              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-[2px] border text-[11px] transition-colors cursor-pointer ${
                isLight
                  ? 'border-[#D0DDD0] text-[#244B40] hover:bg-[#EDF3EA]'
                  : 'border-[rgba(169,191,165,0.25)] text-[#A9BFA5] hover:text-white hover:border-[#A9BFA5]/50'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Context</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSave}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-[2px] text-[11px] font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-[#143630] text-white hover:bg-[#0A1F1B]'
                    : 'bg-[#E8E9D8] text-[#071C1A] hover:bg-white font-medium'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-[2px] border text-[11px] transition-colors cursor-pointer ${
                  isLight
                    ? 'border-[#D0DDD0] text-[#668877] hover:text-[#122420]'
                    : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5]/60 hover:text-white'
                }`}
                title="Reset to Atelier default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`text-[11px] font-mono underline hover:no-underline cursor-pointer ${
                  isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/70'
                }`}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 text-xs">
          <div>
            <span
              className={`block text-[10px] uppercase font-mono tracking-wider mb-1 ${
                isLight ? 'text-[#668877]' : 'text-[#A9BFA5]/60'
              }`}
            >
              Brand voice
            </span>
            <p className="font-light leading-snug">{context.brandVoice}</p>
          </div>

          <div>
            <span
              className={`block text-[10px] uppercase font-mono tracking-wider mb-1 ${
                isLight ? 'text-[#668877]' : 'text-[#A9BFA5]/60'
              }`}
            >
              Audience
            </span>
            <p className="font-light leading-snug">{context.audience}</p>
          </div>

          <div>
            <span
              className={`block text-[10px] uppercase font-mono tracking-wider mb-1 ${
                isLight ? 'text-[#668877]' : 'text-[#A9BFA5]/60'
              }`}
            >
              Visual language
            </span>
            <p className="font-light leading-snug">{context.visualLanguage}</p>
          </div>

          <div>
            <span
              className={`block text-[10px] uppercase font-mono tracking-wider mb-1 ${
                isLight ? 'text-[#668877]' : 'text-[#A9BFA5]/60'
              }`}
            >
              Brand constraints
            </span>
            <p className="font-light leading-snug">{context.brandConstraints}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
          <div>
            <label
              className={`block text-[10px] uppercase font-mono tracking-wider mb-1 ${
                isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
              }`}
            >
              Brand voice
            </label>
            <input
              type="text"
              value={draft.brandVoice}
              onChange={(e) =>
                setDraft({ ...draft, brandVoice: e.target.value })
              }
              className={`w-full text-xs px-2.5 py-1.5 rounded-[2px] border focus:outline-none ${
                isLight
                  ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#122420]'
                  : 'bg-[#061816] border-[rgba(169,191,165,0.25)] text-[#E8E9D8]'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-[10px] uppercase font-mono tracking-wider mb-1 ${
                isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
              }`}
            >
              Audience
            </label>
            <input
              type="text"
              value={draft.audience}
              onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
              className={`w-full text-xs px-2.5 py-1.5 rounded-[2px] border focus:outline-none ${
                isLight
                  ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#122420]'
                  : 'bg-[#061816] border-[rgba(169,191,165,0.25)] text-[#E8E9D8]'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-[10px] uppercase font-mono tracking-wider mb-1 ${
                isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
              }`}
            >
              Visual language
            </label>
            <input
              type="text"
              value={draft.visualLanguage}
              onChange={(e) =>
                setDraft({ ...draft, visualLanguage: e.target.value })
              }
              className={`w-full text-xs px-2.5 py-1.5 rounded-[2px] border focus:outline-none ${
                isLight
                  ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#122420]'
                  : 'bg-[#061816] border-[rgba(169,191,165,0.25)] text-[#E8E9D8]'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-[10px] uppercase font-mono tracking-wider mb-1 ${
                isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
              }`}
            >
              Brand constraints
            </label>
            <input
              type="text"
              value={draft.brandConstraints}
              onChange={(e) =>
                setDraft({ ...draft, brandConstraints: e.target.value })
              }
              className={`w-full text-xs px-2.5 py-1.5 rounded-[2px] border focus:outline-none ${
                isLight
                  ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#122420]'
                  : 'bg-[#061816] border-[rgba(169,191,165,0.25)] text-[#E8E9D8]'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

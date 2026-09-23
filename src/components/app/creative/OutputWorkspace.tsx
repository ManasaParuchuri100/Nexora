import React, { useState, useRef } from 'react';
import {
  Copy,
  Check,
  Edit2,
  RefreshCw,
  Download,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { CategoryType } from './CategoryNav';

export interface GeneratedVariation {
  id: string;
  versionLabel: string; // e.g. "VERSION 01 — QUIET"
  content: string;
  imagePrompt?: string;
  renderedImageMock?: string;
}

interface OutputWorkspaceProps {
  category: CategoryType;
  variations: GeneratedVariation[];
  activeVariationIndex: number;
  onSelectVariation: (index: number) => void;
  onUpdateVariationContent: (index: number, newContent: string) => void;
  onRegenerate: () => void;
  onRefine: (instruction: string) => void;
  isGenerating: boolean;
}

export default function OutputWorkspace({
  category,
  variations,
  activeVariationIndex,
  onSelectVariation,
  onUpdateVariationContent,
  onRegenerate,
  onRefine,
  isGenerating
}: OutputWorkspaceProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customRefinement, setCustomRefinement] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [hasGeneratedImage, setHasGeneratedImage] = useState(false);

  const refineInputRef = useRef<HTMLInputElement>(null);

  const currentVariation = variations[activeVariationIndex] || null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleExport = () => {
    if (!currentVariation) return;
    const blob = new Blob([currentVariation.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-${category.toLowerCase().replace(/\s+/g, '-')}-${currentVariation.versionLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateImage = () => {
    setIsGeneratingImage(true);
    setTimeout(() => {
      setIsGeneratingImage(false);
      setHasGeneratedImage(true);
    }, 1200);
  };

  const handleApplyRefinement = (instruction: string) => {
    if (!instruction.trim()) return;
    onRefine(instruction);
    setCustomRefinement('');
  };

  // 12. CLEAN EDITORIAL EMPTY STATE
  if (!currentVariation && variations.length === 0) {
    return (
      <div
        className={`border rounded-[2px] p-8 sm:p-12 transition-colors flex flex-col items-center justify-center text-center min-h-[440px] shadow-sm ${
          isLight
            ? 'bg-white border-[#E2ECE0]'
            : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)]'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 text-base ${
            isLight
              ? 'bg-[#EDF3EA] text-[#143630]'
              : 'bg-[#0D2D2A] text-[#A9BFA5]'
          }`}
        >
          ✦
        </div>

        <span
          className={`text-[11px] uppercase tracking-widest-plus font-mono font-medium block mb-2 ${
            isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
          }`}
        >
          YOUR CREATIVE OUTPUT
        </span>

        <h3
          className={`serif text-xl sm:text-2xl font-light mb-2.5 ${
            isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'
          }`}
        >
          will appear here
        </h3>

        <p
          className={`text-xs sm:text-sm font-light max-w-sm leading-relaxed ${
            isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/70'
          }`}
        >
          Configure your brief and generate your first version.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-[2px] p-5 sm:p-6 transition-colors shadow-sm space-y-6 ${
        isLight
          ? 'bg-white border-[#E2ECE0]'
          : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)]'
      }`}
    >
      {/* Header: OUTPUT title & Action buttons */}
      <div
        className={`pb-4 border-b ${
          isLight ? 'border-[#E2ECE0]' : 'border-[rgba(169,191,165,0.15)]'
        } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
      >
        <div>
          <span
            className={`text-[10px] uppercase font-mono tracking-widest block font-medium ${
              isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
            }`}
          >
            OUTPUT
          </span>
          <h2
            className={`serif text-lg sm:text-xl font-light tracking-tight mt-0.5 ${
              isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'
            }`}
          >
            {currentVariation.versionLabel}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => handleCopy(currentVariation.content)}
            className={`px-2.5 py-1 rounded-[2px] border flex items-center space-x-1 transition-colors cursor-pointer ${
              isLight
                ? 'border-[#D0DDD0] text-[#143630] hover:bg-[#EDF3EA]'
                : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white hover:border-[#A9BFA5]/60'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2.5 py-1 rounded-[2px] border flex items-center space-x-1 transition-colors cursor-pointer ${
              isEditing
                ? isLight
                  ? 'bg-[#143630] text-white border-[#143630]'
                  : 'bg-[#E8E9D8] text-[#071C1A] border-[#E8E9D8] font-medium'
                : isLight
                  ? 'border-[#D0DDD0] text-[#143630] hover:bg-[#EDF3EA]'
                  : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white hover:border-[#A9BFA5]/60'
            }`}
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditing ? 'Done' : 'Edit'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              refineInputRef.current?.focus();
            }}
            className={`px-2.5 py-1 rounded-[2px] border flex items-center space-x-1 transition-colors cursor-pointer ${
              isLight
                ? 'border-[#D0DDD0] text-[#143630] hover:bg-[#EDF3EA]'
                : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white hover:border-[#A9BFA5]/60'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Refine</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className={`px-2.5 py-1 rounded-[2px] border flex items-center space-x-1 transition-colors cursor-pointer ${
              isLight
                ? 'border-[#D0DDD0] text-[#143630] hover:bg-[#EDF3EA]'
                : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white hover:border-[#A9BFA5]/60'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className={`px-2.5 py-1 rounded-[2px] border flex items-center space-x-1 transition-colors cursor-pointer ${
              isLight
                ? 'border-[#D0DDD0] text-[#143630] hover:bg-[#EDF3EA]'
                : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white hover:border-[#A9BFA5]/60'
            }`}
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 10. MULTIPLE VARIATIONS BAR */}
      {variations.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span
            className={`text-[10px] uppercase font-mono tracking-wider shrink-0 ${
              isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'
            }`}
          >
            Versions:
          </span>
          <div className="flex items-center space-x-1.5">
            {variations.map((v, idx) => {
              const isSelected = activeVariationIndex === idx;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVariation(idx)}
                  className={`px-3 py-1 text-xs font-mono rounded-[2px] border transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    isSelected
                      ? isLight
                        ? 'bg-[#143630] text-white border-[#143630] font-medium shadow-sm'
                        : 'bg-[#E8E9D8] text-[#071C1A] border-[#E8E9D8] font-semibold shadow-sm'
                      : isLight
                        ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#3E6A5E] hover:text-[#122420]'
                        : 'bg-[#061816] border-[rgba(169,191,165,0.2)] text-[#A9BFA5]/70 hover:text-white'
                  }`}
                >
                  <span>{v.versionLabel}</span>
                  {isSelected && (
                    <span className="text-[10px] opacity-80">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Content Body */}
      <div className="relative">
        {isEditing ? (
          <textarea
            rows={16}
            value={currentVariation.content}
            onChange={(e) =>
              onUpdateVariationContent(activeVariationIndex, e.target.value)
            }
            className={`w-full text-xs font-mono p-4 rounded-[2px] border focus:outline-none resize-y leading-relaxed transition-colors ${
              isLight
                ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#122420] focus:border-[#244B40]'
                : 'bg-[#061816] border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5]'
            }`}
          />
        ) : (
          <div
            className={`p-4 sm:p-5 rounded-[2px] border text-xs leading-relaxed font-mono whitespace-pre-wrap select-text overflow-x-auto max-h-[520px] overflow-y-auto ${
              isLight
                ? 'bg-[#F8F9F5] border-[#E2ECE0] text-[#122420]'
                : 'bg-[#061816] border-[rgba(169,191,165,0.2)] text-[#E8E9D8]'
            }`}
          >
            {currentVariation.content}
          </div>
        )}
      </div>

      {/* Visual Brief Specific Workspace Additions: Image Prompt & Image Mockup */}
      {category === 'Hero Brief' && currentVariation.imagePrompt && (
        <div
          className={`border rounded-[2px] p-4 transition-colors space-y-3 ${
            isLight
              ? 'border-[#D0DDD0] bg-[#EDF3EA]/50'
              : 'border-[rgba(169,191,165,0.25)] bg-[#0D2D2A]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase font-mono tracking-widest font-medium ${
                isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
              }`}
            >
              Image Generation Prompt
            </span>
            <button
              type="button"
              onClick={() => handleCopyPrompt(currentVariation.imagePrompt || '')}
              className={`text-[11px] font-mono flex items-center space-x-1 cursor-pointer transition-colors ${
                isLight ? 'text-[#143630] hover:text-[#0A1F1B]' : 'text-[#E8E9D8] hover:text-white'
              }`}
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied Prompt</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          <p
            className={`text-xs font-mono leading-relaxed p-2.5 rounded-[2px] border ${
              isLight
                ? 'bg-white border-[#D0DDD0] text-[#122420]'
                : 'bg-[#061816] border-[rgba(169,191,165,0.2)] text-[#A9BFA5]'
            }`}
          >
            {currentVariation.imagePrompt}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-[2px] flex items-center space-x-1.5 transition-colors cursor-pointer ${
                isLight
                  ? 'bg-[#143630] text-white hover:bg-[#0A1F1B]'
                  : 'bg-[#E8E9D8] text-[#071C1A] hover:bg-white font-medium'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>{isGeneratingImage ? 'Rendering Image...' : '✨ Generate Image'}</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-[2px] border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                isLight
                  ? 'border-[#D0DDD0] text-[#143630] hover:bg-white'
                  : 'border-[rgba(169,191,165,0.25)] text-[#E8E9D8] hover:text-white'
              }`}
            >
              <Download className="w-3 h-3" />
              <span>Download Brief</span>
            </button>
          </div>

          {/* Rendered Mockup Specimen */}
          {hasGeneratedImage && (
            <div
              className={`mt-4 p-3 border rounded-[2px] space-y-2 ${
                isLight
                  ? 'bg-white border-[#D0DDD0]'
                  : 'bg-[#061816] border-[rgba(169,191,165,0.3)]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'}>
                  3D SPATIAL SPECIMEN · 3840×2160 (16:9)
                </span>
                <span className="text-emerald-500 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Render Complete</span>
                </span>
              </div>

              <div className="aspect-video w-full rounded-[2px] bg-gradient-to-br from-[#061816] to-[#0A2622] border border-[#143630] flex flex-col items-center justify-center p-6 text-center text-[#E8E9D8] relative overflow-hidden">
                {/* Hairline Grid Overlay */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #A9BFA5 1px, transparent 1px), linear-gradient(to bottom, #A9BFA5 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5] mb-1 z-10">
                  NEXORA ATELIER KEY VISUAL SPECIMEN
                </span>
                <h4 className="serif text-lg sm:text-xl font-light text-white z-10">
                  Cantilevered Obsidian Surface & Hairline Graph
                </h4>
                <p className="text-[11px] text-[#A9BFA5]/80 font-light mt-1 max-w-sm z-10">
                  Soft 4500K directional morning sunlight · Matte anodized titanium & tempered glass
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 11. REFINE FUNCTIONALITY INTERFACE */}
      <div
        className={`pt-4 border-t ${
          isLight ? 'border-[#E2ECE0]' : 'border-[rgba(169,191,165,0.15)]'
        } space-y-3`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] uppercase font-mono tracking-widest font-medium ${
              isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
            }`}
          >
            REFINE THIS ASSET
          </span>
          <span
            className={`text-[10px] font-mono ${
              isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'
            }`}
          >
            Iterate without losing context
          </span>
        </div>

        {/* Quick action chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            'Make shorter',
            'More premium',
            'More human',
            'More provocative',
            'More minimal'
          ].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleApplyRefinement(action)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] border transition-colors cursor-pointer ${
                isLight
                  ? 'border-[#D0DDD0] bg-[#F8F9F5] text-[#244B40] hover:border-[#143630] hover:bg-[#EDF3EA]'
                  : 'border-[rgba(169,191,165,0.2)] bg-[#061816] text-[#A9BFA5] hover:border-[#A9BFA5]/60 hover:text-white'
              }`}
            >
              + {action}
            </button>
          ))}
        </div>

        {/* Custom refinement input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleApplyRefinement(customRefinement);
          }}
          className="flex items-center space-x-2 pt-1"
        >
          <input
            ref={refineInputRef}
            type="text"
            value={customRefinement}
            onChange={(e) => setCustomRefinement(e.target.value)}
            placeholder="Tell AI what to change... (e.g. emphasize Swiss typography, remove closing signoff)"
            className={`flex-1 text-xs px-3 py-2 rounded-[2px] border focus:outline-none transition-colors ${
              isLight
                ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#122420] focus:border-[#244B40] placeholder-[#889988]'
                : 'bg-[#061816] border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5] placeholder-[#A9BFA5]/30'
            }`}
          />
          <button
            type="submit"
            disabled={!customRefinement.trim()}
            className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer shrink-0 ${
              !customRefinement.trim()
                ? 'opacity-40 cursor-not-allowed border border-inherit text-inherit'
                : isLight
                  ? 'bg-[#143630] text-white hover:bg-[#0A1F1B]'
                  : 'bg-[#E8E9D8] text-[#071C1A] hover:bg-white font-medium'
            }`}
          >
            Apply
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  Filter, 
  Layers, 
  Send,
  RefreshCw
} from 'lucide-react';
import { GeneratedAsset, SubCategory } from '../../types';
import Pagination from './Pagination';

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
  const isAssetsView = activeSubCategory === 'generated-assets';

  // Create state
  const [prompt, setPrompt] = useState('');
  const [assetType, setAssetType] = useState<GeneratedAsset['type']>('Email Copy');
  const [tone, setTone] = useState<'Deliberate & Architectural' | 'Provocative & Direct' | 'Calm Minimalist'>('Deliberate & Architectural');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination & Filtering for Generated Assets Archive
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

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      let outputText = '';
      if (assetType === 'Email Copy') {
        outputText = `Subject: The architecture of quiet work in an era of noise\n\nDear Julian,\n\nWhen we examined the digital footprints of modern design leaders, we noticed a consistent friction: tools that were built to save time were actively draining contemplation.\n\nNexora was engineered under a single premise: what happens when your software speaks in hairlines, not notification sirens? We would welcome thirty minutes to demonstrate how your studio can synchronize lead capture without sacrificing creative tranquility.\n\nWarmly,\nEvelyn Vance · Nexora Atelier`;
      } else if (assetType === 'Social Post') {
        outputText = `Most productivity software is built around urgency. We built Nexora around stillness.\n\nWhen you subtract saturated badges and rounded notification pills, your mind recovers the cognitive bandwidth required to do work that actually endures.\n\nExplore deliberate computing: nexora.studio`;
      } else {
        outputText = `1. The Space Where Creation Happens.\n2. Deliberate Software for Ambitious Creators.\n3. Subtract the Noise. Multiply the Depth.`;
      }

      setGeneratedOutput(outputText);
      setIsGenerating(false);

      const newAsset: GeneratedAsset = {
        id: `asset-${Date.now()}`,
        title: prompt.slice(0, 45) + (prompt.length > 45 ? '...' : ''),
        type: assetType,
        platform: assetType === 'Email Copy' ? 'Direct Email' : 'X / Social',
        preview: outputText.slice(0, 120) + '...',
        createdAt: 'Just now',
        tags: [tone, 'AI Synthesized']
      };
      onGenerateSuccess(newAsset);
    }, 900);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-12 py-4">
      {/* Header */}
      <section className="border-b border-[rgba(169,191,165,0.2)] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest-plus text-[#A9BFA5] font-normal block mb-2">
            AI CREATIVE LABORATORY
          </span>
          <h1 className="serif text-4xl sm:text-5xl font-light text-[#E8E9D8] tracking-tight">
            Creative Lab
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#A9BFA5]/80 font-light leading-relaxed max-w-xl">
            Synthesize high-conviction marketing copy, editorial essays, and visual campaign narratives guided by Nexora’s aesthetic intelligence.
          </p>
        </div>

        {/* Subnav switcher */}
        <div className="flex items-center space-x-6 text-xs uppercase tracking-widest border-b border-[rgba(169,191,165,0.2)] pb-1">
          <button
            type="button"
            onClick={() => onNavigateSub('create')}
            className={`pb-1 border-b transition-colors cursor-pointer ${
              !isAssetsView 
                ? 'text-[#E8E9D8] border-[#E8E9D8] font-medium' 
                : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
            }`}
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => onNavigateSub('generated-assets')}
            className={`pb-1 border-b transition-colors cursor-pointer ${
              isAssetsView 
                ? 'text-[#E8E9D8] border-[#E8E9D8] font-medium' 
                : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
            }`}
          >
            Generated Assets ({assets.length})
          </button>
        </div>
      </section>

      {!isAssetsView ? (
        /* Create Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Prompt inputs */}
          <div className="lg:col-span-6 space-y-6 border border-[rgba(169,191,165,0.2)] p-6 sm:p-8 bg-[#071C1A]">
            <span className="text-[10px] uppercase tracking-widest-plus text-[#A9BFA5] block">
              Direct Synthesis
            </span>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#E8E9D8] mb-2 font-medium">
                Asset Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Email Copy', 'Social Post', 'Headline Set'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAssetType(t)}
                    className={`py-2 px-3 text-xs uppercase tracking-wider border rounded-[2px] transition-colors cursor-pointer text-center ${
                      assetType === t 
                        ? 'text-[#E8E9D8] border-[#A9BFA5] bg-[#0D2D2A]' 
                        : 'text-[#A9BFA5]/60 border-[rgba(169,191,165,0.2)] hover:border-[rgba(169,191,165,0.4)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#E8E9D8] mb-2 font-medium">
                Brand Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full bg-[#061816] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] text-xs px-3 py-2 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
              >
                <option value="Deliberate & Architectural">Deliberate & Architectural</option>
                <option value="Provocative & Direct">Provocative & Direct</option>
                <option value="Calm Minimalist">Calm Minimalist</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#E8E9D8] mb-2 font-medium">
                Concept or Narrative Prompt
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Announce the launch of our Kyoto studio residency. Emphasize quiet design, lack of notification spam, and invitation to senior directors."
                className="w-full bg-[#061816] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] text-xs p-3 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] placeholder-[#A9BFA5]/30 leading-relaxed font-light resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-[#E8E9D8] text-[#071C1A] py-3 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize Asset</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Preview */}
          <div className="lg:col-span-6 border border-[rgba(169,191,165,0.2)] p-6 sm:p-8 bg-[#071C1A] flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between border-b border-[rgba(169,191,165,0.2)] pb-3 mb-4">
                <span className="text-[10px] uppercase tracking-widest text-[#A9BFA5]">
                  Synthesized Output
                </span>
                {generatedOutput && (
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedOutput, 'active')}
                    className="text-[11px] text-[#A9BFA5] hover:text-[#E8E9D8] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedId === 'active' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy text</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {generatedOutput ? (
                <div className="text-xs sm:text-sm text-[#E8E9D8] leading-relaxed whitespace-pre-wrap font-light p-4 bg-[#061816] border border-[rgba(169,191,165,0.15)] max-h-96 overflow-y-auto">
                  {generatedOutput}
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-[#A9BFA5]/50 font-light">
                  Enter a concept prompt on the left and click Synthesize to generate calibrated marketing copy.
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[rgba(169,191,165,0.15)] flex items-center justify-between text-[11px] text-[#A9BFA5]/60">
              <span>Aesthetic calibration: Active</span>
              <button
                type="button"
                onClick={() => onNavigateSub('generated-assets')}
                className="uppercase tracking-widest text-[#E8E9D8] hover:text-white"
              >
                Browse archive ({assets.length}) &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Generated Assets Grid (Sharp panels, no rounded cards) */
        <div className="space-y-6">
          {/* Filter Bar & Count */}
          <div className="border border-[rgba(169,191,165,0.2)] p-4 bg-[#071C1A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[10px] uppercase tracking-widest text-[#A9BFA5]/60 font-mono mr-2 shrink-0">
                Filter:
              </span>
              {(['All', 'Email Copy', 'Social Post', 'Social Ad', 'Campaign Hook', 'Thought Leadership'] as const).map(f => {
                const isSelected = typeFilter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTypeFilter(f)}
                    className={`px-3 py-1 text-xs uppercase tracking-wider border rounded-[1px] transition-colors cursor-pointer shrink-0 font-mono ${
                      isSelected
                        ? 'bg-[#0D2D2A] text-[#E8E9D8] border-[#A9BFA5] font-semibold'
                        : 'text-[#A9BFA5]/60 border-[rgba(169,191,165,0.15)] hover:text-[#E8E9D8]'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] font-mono text-[#A9BFA5]/70 shrink-0">
              Showing {filteredAssets.length === 0 ? 0 : `${(assetPage - 1) * assetPageSize + 1}–${Math.min(assetPage * assetPageSize, filteredAssets.length)}`} of {filteredAssets.length} assets
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="p-12 border border-[rgba(169,191,165,0.2)] bg-[#071C1A] text-center text-xs text-[#A9BFA5]/50 font-light">
              No generated assets match the selected filter category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedAssets.map((asset) => (
                <div 
                  key={asset.id}
                  className="border border-[rgba(169,191,165,0.2)] p-6 bg-[#071C1A] hover:bg-[#0D2D2A]/20 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-[#A9BFA5]">
                        {asset.type} · {asset.platform}
                      </span>
                      <span className="text-[10px] text-[#A9BFA5]/60 font-mono">
                        {asset.createdAt}
                      </span>
                    </div>

                    <h4 className="serif text-lg font-light text-[#E8E9D8] mb-3">
                      {asset.title}
                    </h4>

                    <p className="text-xs text-[#A9BFA5]/80 font-light leading-relaxed mb-4 line-clamp-3">
                      {asset.preview}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[rgba(169,191,165,0.15)] flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags.map(t => (
                        <span key={t} className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-[rgba(169,191,165,0.2)] text-[#A9BFA5]/70">
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(asset.preview, asset.id)}
                      className="text-xs text-[#E8E9D8] hover:text-white uppercase tracking-widest flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#A9BFA5]" />
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
            <div className="border border-[rgba(169,191,165,0.2)] bg-[#071C1A]">
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

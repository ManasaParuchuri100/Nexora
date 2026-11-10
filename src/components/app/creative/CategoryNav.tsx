import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Palette, 
  Film, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import { CategoryType } from '../../../types';

export type { CategoryType };
export type MainCategory = 'text' | 'images' | 'videos';

export interface SubCategoryItem {
  id: CategoryType;
  label: string;
  badge: string;
}

export interface MainCategoryConfig {
  id: MainCategory;
  label: string;
  icon: React.ReactNode;
  subCategories: SubCategoryItem[];
}

export const MAIN_CATEGORIES: MainCategoryConfig[] = [
  {
    id: 'text',
    label: 'Text',
    icon: <FileText className="w-3.5 h-3.5" />,
    subCategories: [
      { id: 'Email Copy', label: 'Email Copy', badge: 'Outreach' },
      { id: 'Social Post', label: 'Social Post', badge: 'Social' },
      { id: 'Headline Set', label: 'Headline Set', badge: 'Headlines' },
      { id: 'Thought Leadership', label: 'Thought Leadership', badge: 'Essay' }
    ]
  },
  {
    id: 'images',
    label: 'Images',
    icon: <Palette className="w-3.5 h-3.5" />,
    subCategories: [
      { id: 'Hero Brief', label: '3D Spatial Visual', badge: 'Key Visual' },
      { id: 'Product Render', label: 'Product Studio Render', badge: 'Studio' },
      { id: 'Brand Specimen', label: 'Brand & Editorial Specimen', badge: 'Graphic' }
    ]
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: <Film className="w-3.5 h-3.5" />,
    subCategories: [
      { id: 'Ad Script', label: 'Ad Script (15–60s)', badge: 'Social Ad' },
      { id: 'Product Demo', label: 'Product Demo Walkthrough', badge: 'Screenflow' },
      { id: 'Brand Film', label: 'Brand Manifesto Film', badge: 'Cinematic' }
    ]
  }
];

export function getMainCategoryForSub(sub: CategoryType): MainCategory {
  if (['Hero Brief', 'Product Render', 'Brand Specimen'].includes(sub)) {
    return 'images';
  }
  if (['Ad Script', 'Product Demo', 'Brand Film'].includes(sub)) {
    return 'videos';
  }
  return 'text';
}

interface CategoryNavProps {
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
}

export default function CategoryNav({
  selectedCategory,
  onSelectCategory
}: CategoryNavProps) {

  const activeMain = getMainCategoryForSub(selectedCategory);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMainConfig = MAIN_CATEGORIES.find((m) => m.id === activeMain) || MAIN_CATEGORIES[0];
  const currentSubItem =
    currentMainConfig.subCategories.find((s) => s.id === selectedCategory) ||
    currentMainConfig.subCategories[0];

  const handleSelectMain = (mainId: MainCategory) => {
    if (mainId === activeMain) return;
    const targetConfig = MAIN_CATEGORIES.find((m) => m.id === mainId);
    if (targetConfig && targetConfig.subCategories.length > 0) {
      onSelectCategory(targetConfig.subCategories[0].id);
      setDropdownOpen(false);
    }
  };

  const handleSelectSub = (subId: CategoryType) => {
    onSelectCategory(subId);
    setDropdownOpen(false);
  };

  return (
    <div
      className={`border rounded-[10px] p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
        'bg-surface border-line'
      }`}
    >
      {/* 3 Core Category Tabs: Text, Images, Videos */}
      <div className="flex items-center space-x-1">
        <span
          className={`text-[12px] font-bold px-2 hidden md:inline-block ${
 'text-ink-3'
 }`}
        >
          Format
        </span>

        <div
          className={`inline-flex rounded-[8px] p-0.5 border ${
            'bg-surface-raised border-line'
          }`}
        >
          {MAIN_CATEGORIES.map((main) => {
            const isSelected = activeMain === main.id;
            return (
              <button
                key={main.id}
                type="button"
                onClick={() => handleSelectMain(main.id)}
                className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 rounded-[6px] ${
                  isSelected
                    ? 'bg-brand text-on-brand font-medium shadow-sm'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {main.icon}
                <span>{main.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Category Dropdown */}
      <div ref={dropdownRef} className="relative flex items-center space-x-2">
        <span
          className={`text-[12px] font-bold shrink-0 ${
 'text-ink-3'
 }`}
        >
          Sub-format:
        </span>

        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`px-3 py-1.5 rounded-[8px] border text-xs font-mono flex items-center justify-between space-x-2 min-w-[210px] transition-colors cursor-pointer ${
            'bg-surface-raised border-line text-ink hover:border-brand'
          }`}
        >
          <span className="truncate font-medium">{currentSubItem.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform shrink-0 ${
              dropdownOpen ? 'rotate-180' : ''
            } ${'text-ink-3'}`}
          />
        </button>

        {/* Dropdown Menu Popup */}
        {dropdownOpen && (
          <div
            className={`absolute right-0 top-full mt-1.5 w-64 rounded-[8px] border shadow-lg py-1 z-30 animate-fadeIn ${
              'bg-surface border-line text-ink'
            }`}
          >
            <div
              className={`px-3 py-1 text-[10px] border-b ${
 'text-ink-3 border-line'
 }`}
            >
              {currentMainConfig.label} Formats
            </div>

            <div className="py-1">
              {currentMainConfig.subCategories.map((sub) => {
                const isSelected = selectedCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSelectSub(sub.id)}
                    className={`w-full px-3 py-2 text-left text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-surface-hover text-brand font-semibold'
                        : 'hover:bg-surface-raised text-ink-2'
                    }`}
                  >
                    <span>{sub.label}</span>
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${
                          'text-brand'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

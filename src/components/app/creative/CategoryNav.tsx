import React from 'react';
import { Mail, Share2, Type, Film, BookOpen, Palette } from 'lucide-react';
import { GeneratedAsset } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';

export type CategoryType = GeneratedAsset['type'];

export interface CategoryItem {
  id: CategoryType;
  label: string; // Shorter visible label: Email, Social, Headlines, Video, Editorial, Visual
  icon: React.ReactNode;
  hint: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'Email Copy',
    label: 'Email',
    icon: <Mail className="w-3.5 h-3.5" />,
    hint: 'VIP outreach & launch notes'
  },
  {
    id: 'Social Post',
    label: 'Social',
    icon: <Share2 className="w-3.5 h-3.5" />,
    hint: 'X & LinkedIn perspectives'
  },
  {
    id: 'Headline Set',
    label: 'Headlines',
    icon: <Type className="w-3.5 h-3.5" />,
    hint: 'Hero titles & strategic hooks'
  },
  {
    id: 'Ad Script',
    label: 'Video',
    icon: <Film className="w-3.5 h-3.5" />,
    hint: '15-60s storyboards & voiceover'
  },
  {
    id: 'Thought Leadership',
    label: 'Editorial',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    hint: 'Essays & journal columns'
  },
  {
    id: 'Hero Brief',
    label: 'Visual',
    icon: <Palette className="w-3.5 h-3.5" />,
    hint: '3D spatial specs & art direction'
  }
];

interface CategoryNavProps {
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
}

export default function CategoryNav({
  selectedCategory,
  onSelectCategory
}: CategoryNavProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-[10px] uppercase tracking-widest font-mono ${
            isLight ? 'text-[#244B40]' : 'text-[#A9BFA5]'
          }`}
        >
          Asset Format
        </span>
        <span
          className={`text-[10px] font-mono ${
            isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'
          }`}
        >
          Select category to configure brief
        </span>
      </div>

      {/* Responsive Compact Bar with no clipping */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-2.5 rounded-[2px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? isLight
                    ? 'bg-[#EDF3EA] border-[#143630] text-[#122420] shadow-sm ring-1 ring-[#143630]/20'
                    : 'bg-[#0D2D2A] border-[#A9BFA5] text-[#E8E9D8] shadow-sm ring-1 ring-[#A9BFA5]/30'
                  : isLight
                    ? 'bg-white border-[#E2ECE0] text-[#3E6A5E] hover:border-[#D0DDD0] hover:text-[#122420]'
                    : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)] text-[#A9BFA5]/70 hover:border-[rgba(169,191,165,0.4)] hover:text-[#E8E9D8]'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-0.5">
                <span
                  className={
                    isSelected
                      ? isLight
                        ? 'text-[#143630]'
                        : 'text-[#A9BFA5]'
                      : 'opacity-60'
                  }
                >
                  {cat.icon}
                </span>
                <span
                  className={`text-xs font-medium tracking-wide ${
                    isSelected
                      ? isLight
                        ? 'text-[#122420] font-semibold'
                        : 'text-[#E8E9D8]'
                      : ''
                  }`}
                >
                  {cat.label}
                </span>
              </div>
              <span
                className={`text-[10px] leading-tight truncate ${
                  isSelected
                    ? isLight
                      ? 'text-[#244B40]'
                      : 'text-[#A9BFA5]/80'
                    : isLight
                      ? 'text-[#668877]'
                      : 'text-[#A9BFA5]/50'
                }`}
              >
                {cat.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { SubCategory } from '../../types';
import { Tabs } from '../ui';

export type ContentTab = 'create' | 'schedule' | 'library';

export const contentTabFor = (sub: SubCategory): ContentTab => {
  if (sub === 'library' || sub === 'content-library' || sub === 'generated-assets') return 'library';
  if (sub === 'create' || sub === 'ai-content') return 'create';
  return 'schedule';
};

const TAB_TARGET: Record<ContentTab, SubCategory> = {
  create: 'create',
  schedule: 'manual-scheduling',
  library: 'library',
};

/** The three local tabs of the Content destination: Create, Schedule and Library. */
export default function ContentTabs({
  active,
  onNavigate,
  libraryCount,
}: {
  active: ContentTab;
  onNavigate: (sub: SubCategory) => void;
  libraryCount?: number;
}) {
  return (
    <Tabs<ContentTab>
      idPrefix="content"
      label="Content sections"
      value={active}
      onChange={id => onNavigate(TAB_TARGET[id])}
      tabs={[
        { id: 'create', label: 'Create' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'library', label: 'Library', count: libraryCount },
      ]}
    />
  );
}

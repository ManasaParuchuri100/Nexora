import React, { useState } from 'react';
import { Inbox, TriangleAlert } from 'lucide-react';
import {
  AIInsight, Badge, Button, Card, CardContent, CardFooter, CardHeader, EmptyState, Input, PageHeader, Skeleton, StatusBadge, TabPanel, Tabs,
} from './ui';
import { useTheme } from '../context/ThemeContext';

const STATUSES = ['HOT', 'Qualified', 'WARM', 'COLD', 'Won', 'Lost', 'Draft', 'Awaiting approval', 'Approved', 'Scheduled', 'Connected', 'Disconnected'];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[16px] font-semibold text-ink m-0 mb-4 pb-2 border-b border-line">{title}</h2>
      {children}
    </section>
  );
}

/** Internal reference for the shared components. Open it at /#ui-gallery. */
export default function UiGallery() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('one');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-10">
        <PageHeader
          eyebrow="Internal / UI gallery"
          title="Components"
          subtitle="Normal, loading, disabled, empty and error states for the shared components."
          actions={<Button onClick={toggleTheme}>{theme === 'light' ? 'Dark theme' : 'Light theme'}</Button>}
        />

        <Block title="Button">
          <div className="flex flex-wrap gap-3 mb-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-3 mb-3">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="secondary" size="sm">Small</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="secondary" disabled>Disabled</Button>
            <Button variant="primary" loading>Saving</Button>
            <Button variant="secondary" loading>Loading</Button>
          </div>
          <Button variant="primary" loading={loading} onClick={() => { setLoading(true); window.setTimeout(() => setLoading(false), 1500); }}>
            Click to see loading
          </Button>
        </Block>

        <Block title="Badge and StatusBadge">
          <div className="flex flex-wrap gap-2 mb-3">
            {(['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'hot'] as const).map(t => <React.Fragment key={t}><Badge tone={t}>{t}</Badge></React.Fragment>)}
          </div>
          <div className="flex flex-wrap gap-2">{STATUSES.map(s => <React.Fragment key={s}><StatusBadge status={s} /></React.Fragment>)}</div>
          <p className="text-[12px] text-ink-3 mt-3 mb-0">Every status is shown as text as well as colour. Lifecycle stage, score and error severity stay separate.</p>
        </Block>

        <Block title="Card">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title="Card title" description="Header, content and an optional footer share one padding and border." action={<Button size="sm">Action</Button>} />
              <CardContent><p className="text-[14px] text-ink-2 m-0">Card content sits here.</p></CardContent>
              <CardFooter><Button size="sm">Cancel</Button><Button size="sm" variant="primary">Save</Button></CardFooter>
            </Card>
            <Card>
              <CardHeader title="Loading" description="Skeleton placeholder" />
              <CardContent><Skeleton lines={4} /></CardContent>
            </Card>
          </div>
        </Block>

        <Block title="Input">
          <div className="grid gap-x-6 sm:grid-cols-2">
            <Input label="Normal" placeholder="Type here" hint="A short hint under the field." />
            <Input label="Error" defaultValue="not-an-email" error="Enter a valid email address." />
            <Input label="Disabled" defaultValue="Read only value" disabled />
            <Input label="With value" defaultValue="Aster Labs" />
          </div>
        </Block>

        <Block title="Tabs">
          <Tabs idPrefix="gallery" label="Gallery tabs" value={tab} onChange={setTab} tabs={[{ id: 'one', label: 'First' }, { id: 'two', label: 'Second', count: 4 }, { id: 'three', label: 'Third' }]} className="mb-3" />
          <TabPanel idPrefix="gallery" id={tab}><p className="text-[14px] text-ink-2 m-0">Panel for the “{tab}” tab. Use the arrow keys, Home and End to move between tabs.</p></TabPanel>
        </Block>

        <Block title="EmptyState and error">
          <div className="grid gap-4 md:grid-cols-2">
            <EmptyState icon={<Inbox className="w-5 h-5" />} title="No conversations yet" description="Connect a channel and new conversations appear here." action={<Button variant="primary">Connect a channel</Button>} />
            <EmptyState icon={<TriangleAlert className="w-5 h-5" />} title="Could not load follow-ups" description="Check your connection and try again. Nothing was changed." action={<Button>Try again</Button>} />
          </div>
        </Block>

        <Block title="AIInsight">
          <AIInsight
            observation="WhatsApp brings the most leads, and LinkedIn converts best."
            recommendation="Reply faster on WhatsApp and review how leads move between New and Engaged."
            evidence="Based on 115 leads in the last 30 days"
            freshness="Updated today"
            action={{ label: 'Open leads', onClick: () => undefined }}
          />
        </Block>
      </div>
    </div>
  );
}

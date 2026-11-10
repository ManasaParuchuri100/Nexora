# Nexora UI, Stage 1: design system and application shell

This note is the hand-off for the Stage 1 redesign. It covers the tokens, the shared components, how
navigation maps onto the existing state, and what has and has not been checked.

Open the component gallery at `/#ui-gallery` to see every shared component in its normal, loading,
disabled, empty and error states, in both themes.

## 1. Tokens (`src/index.css`)

All colour, radius and control size values are semantic CSS variables defined once in `:root` (dark)
and `[data-theme="light"]`. Components use them through Tailwind names such as `bg-surface`,
`text-ink`, `border-line`, `bg-brand`, so a change in one place reaches the whole app.

| Token | Dark | Light | Used for |
|---|---|---|---|
| `--background` / `--sidebar` | `#070B14` / `#090E18` | `#F4F7FB` / `#FFFFFF` | App background, navigation |
| `--surface` / `--surface-raised` | `#0D1420` / `#111A28` | `#FFFFFF` / `#F1F5F9` | Cards, menus, raised controls |
| `--text-primary` / `--text-secondary` | `#F5F7FA` / `#94A3B8` | `#0B1220` / `#475569` | Main and supporting text |
| `--text-muted` | `#8393AA` | `#5B6B80` | Small supporting labels (4.5:1 or better) |
| `--muted-decor` | `#64748B` | `#94A3B8` | Decoration only, never small body text |
| `--primary` / `--primary-hover` | `#22D3EE` / `#67E8F9` | `#0E7490` / `#155E75` | Primary action, selection, AI content |
| `--accent-subtle` | cyan at 10% | cyan at 8% | Selected item and AI backgrounds |
| `--border-subtle` / `--border` / `--border-strong` | slate at 8 / 14 / 24% | ink at 6 / 10 / 20% | Separators and outlines |
| `--success` / `--warning` / `--error` | `#22C55E` / `#F59E0B` / `#F87171` | `#15803D` / `#B45309` / `#B91C1C` | Feedback |

The light theme is a separate set. The specification only gives dark values, and cyan `#22D3EE` is not
readable as text on white, so light uses a deeper cyan (`#0E7490`, 5.4:1 against white).

Type: Inter, falling back to the platform sans-serif. Page titles 28/600, section titles 16/600, body and
controls 14, supporting labels 12. Numbers use tabular figures. Spacing follows 4, 8, 12, 16, 24, 32, 48.
Cards have a 10px radius, controls 8px, with 1px borders and 40px control height (44px touch area on
mobile).

No glows or gradients sit behind data. Motion is limited to short fades and respects reduced motion.

## 2. Shared components (`src/components/ui`)

| Component | Contract |
|---|---|
| `Button` | `variant` primary, secondary, ghost, danger. `size` sm or md. `disabled`, `loading` (spinner, `aria-busy`, blocks clicks). |
| `Badge`, `StatusBadge` | `Badge` takes a `tone`. `StatusBadge` takes a domain value and uses one central mapping (`StatusBadge.tsx`). Status is always text as well as colour. |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | Shared padding and border. Footer is optional. |
| `Input` | Visible `label`, `hint`, `error` (announced with `role="alert"`), disabled state. |
| `PageHeader` | `title`, `subtitle`, `eyebrow` and a responsive `actions` area. One primary action per header. |
| `Tabs`, `TabPanel` | `role="tablist"`. Arrow keys, Home and End move between tabs. Each tab is linked to its panel. |
| `EmptyState` | Says what is missing and offers a valid next action. |
| `AIInsight` | Keeps the observation, the recommendation and the evidence apart. Confidence is not shown. |
| `Skeleton` | A loading placeholder that respects reduced motion. |

Existing primitives (modal shell, toast, tab pills) were reused. No second dropdown, dialog or drawer
library was added.

## 3. Application shell

* Sidebar 248px, collapsible to a 72px rail (saved in the browser). Narrow desktops and tablets start
  collapsed. Collapsed items have tooltips and labels for assistive technology.
* Top bar 64px: workspace selector (the only one), search, **New**, notifications, theme control and the
  account menu with profile and log out. The sidebar footer shows the current workspace read-only.
* Page title, description, local tabs and the primary page action sit inside the content area. Content
  padding is 32px on desktop and 16px on mobile.
* Mobile drawer: opens off-canvas, moves focus in, keeps Tab inside, closes on Escape and on backdrop
  click, and returns focus to the menu button.

## 4. Navigation compatibility map

State is unchanged: `activeCategory` plus `activeSubCategory`. The sidebar is a presentation layer.

| Sidebar item | `activeCategory` | Local tabs (`activeSubCategory`) |
|---|---|---|
| Overview | `overview` | none |
| Inbox | `inbox` (alias `engage`) | inbox, waiting-human, and the saved filters |
| Leads | `leads` | all-leads, pipeline, follow-ups |
| Campaigns | `campaigns` | campaign-list, create, plan |
| Content | `content` | create, schedule (calendar, queue, write with AI, connected accounts), library |
| Engagement Agent | `agent` | none |
| Market Intelligence | `market` | recommendations, competitors, trends, sources |
| Analytics | `analytics` | overview, leads, channels, activity-log |
| Settings | `settings` | business, ai-automation, channels, automation, team, billing, notifications |
| Onboarding (footer) | `onboarding` (URL `/setup`) | none |

Legacy aliases still resolve: `insights`, `creative-lab`, `social-hub`, `assistant`, `engage`. Destinations
with local tabs reopen on the tab used last in the session; the first visit opens the default tab.

Items the spec lists but that have no working module here (a separate Automations or Integrations
destination) are not shown. Automation rules and channels live under Settings.

## 5. Checks performed

Run in a browser (headless) against the dev build:

* Every destination reachable and rendering at 1440, 1024, 768 and 390px in both themes, with no
  page-wide horizontal scroll. Tables scroll inside their own container.
* Keyboard: tabs, the workspace menu, shared dialogs (focus in, Tab loop, Escape, focus return) and the
  mobile drawer (focus in, Tab loop, Escape, focus return).
* Contrast: the dark and light text, accent and status colours above were computed against their
  surfaces (normal text 4.5:1 or better).
* `tsc --noEmit` and `vite build` pass. There is no lint script in this repository.

## 6. Known limitations

* Some chart colour scales (the lead heatmap and new-customers chart) keep their own colours on purpose.
* The Stats and Insights views are not reachable from navigation and were only re-themed through tokens.
* Only the shared dialog (`NxModal`) traps focus. The sign-in modal and the setup overlay close on Escape but do not trap Tab.
* There is no role-based hiding of destinations, because the demo has a single role.

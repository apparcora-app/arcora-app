import type { AppSection } from '@/types';

export interface SectionTheme {
  badgeClassName: string;
  iconWrapClassName: string;
  iconClassName: string;
  surfaceClassName: string;
  borderClassName: string;
  accentTextClassName: string;
}

const sectionThemes: Record<AppSection, SectionTheme> = {
  dashboard: {
    badgeClassName: 'border-sky-400/20 bg-sky-500/12 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    iconWrapClassName: 'bg-sky-500/12 dark:bg-sky-500/12',
    iconClassName: 'text-sky-700 dark:text-sky-300',
    surfaceClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_42%),linear-gradient(180deg,rgba(240,249,255,0.96),rgba(226,232,240,0.86))] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_40%),linear-gradient(180deg,rgba(14,165,233,0.16),rgba(15,23,42,0.88))]',
    borderClassName: 'border-sky-400/20',
    accentTextClassName: 'text-sky-700 dark:text-sky-200',
  },
  bills: {
    badgeClassName: 'border-amber-400/20 bg-amber-500/12 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    iconWrapClassName: 'bg-amber-500/12 dark:bg-amber-500/12',
    iconClassName: 'text-amber-700 dark:text-amber-300',
    surfaceClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.2),transparent_42%),linear-gradient(180deg,rgba(255,251,235,0.96),rgba(254,243,199,0.86))] dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_42%),linear-gradient(180deg,rgba(245,158,11,0.16),rgba(23,23,23,0.9))]',
    borderClassName: 'border-amber-400/20',
    accentTextClassName: 'text-amber-700 dark:text-amber-200',
  },
  subscriptions: {
    badgeClassName: 'border-violet-400/20 bg-violet-500/12 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200',
    iconWrapClassName: 'bg-violet-500/12 dark:bg-violet-500/12',
    iconClassName: 'text-violet-700 dark:text-violet-300',
    surfaceClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.18),transparent_42%),linear-gradient(180deg,rgba(245,243,255,0.96),rgba(237,233,254,0.88))] dark:bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.22),transparent_42%),linear-gradient(180deg,rgba(124,58,237,0.16),rgba(24,24,38,0.9))]',
    borderClassName: 'border-violet-400/20',
    accentTextClassName: 'text-violet-700 dark:text-violet-200',
  },
  warranties: {
    badgeClassName: 'border-emerald-400/20 bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    iconWrapClassName: 'bg-emerald-500/12 dark:bg-emerald-500/12',
    iconClassName: 'text-emerald-700 dark:text-emerald-300',
    surfaceClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_42%),linear-gradient(180deg,rgba(236,253,245,0.96),rgba(209,250,229,0.88))] dark:bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_42%),linear-gradient(180deg,rgba(16,185,129,0.16),rgba(12,28,25,0.92))]',
    borderClassName: 'border-emerald-400/20',
    accentTextClassName: 'text-emerald-700 dark:text-emerald-200',
  },
  documents: {
    badgeClassName: 'border-cyan-400/20 bg-cyan-500/12 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200',
    iconWrapClassName: 'bg-cyan-500/12 dark:bg-cyan-500/12',
    iconClassName: 'text-cyan-700 dark:text-cyan-300',
    surfaceClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_42%),linear-gradient(180deg,rgba(236,254,255,0.96),rgba(207,250,254,0.88))] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_42%),linear-gradient(180deg,rgba(8,145,178,0.16),rgba(12,18,28,0.92))]',
    borderClassName: 'border-cyan-400/20',
    accentTextClassName: 'text-cyan-700 dark:text-cyan-200',
  },
  passwords: {
    badgeClassName: 'border-rose-400/20 bg-rose-500/12 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200',
    iconWrapClassName: 'bg-rose-500/12 dark:bg-rose-500/12',
    iconClassName: 'text-rose-700 dark:text-rose-300',
    surfaceClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.18),transparent_42%),linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,228,230,0.88))] dark:bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.22),transparent_42%),linear-gradient(180deg,rgba(234,88,12,0.14),rgba(31,17,18,0.92))]',
    borderClassName: 'border-rose-400/20',
    accentTextClassName: 'text-rose-700 dark:text-rose-200',
  },
  reminders: {
    badgeClassName: 'border-orange-400/20 bg-orange-500/12 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200',
    iconWrapClassName: 'bg-orange-500/12 dark:bg-orange-500/12',
    iconClassName: 'text-orange-700 dark:text-orange-300',
    surfaceClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_42%),linear-gradient(180deg,rgba(255,247,237,0.96),rgba(254,215,170,0.88))] dark:bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.22),transparent_42%),linear-gradient(180deg,rgba(249,115,22,0.16),rgba(31,20,14,0.92))]',
    borderClassName: 'border-orange-400/20',
    accentTextClassName: 'text-orange-700 dark:text-orange-200',
  },
  others: {
    badgeClassName: 'border-fuchsia-400/20 bg-fuchsia-500/12 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-200',
    iconWrapClassName: 'bg-fuchsia-500/12 dark:bg-fuchsia-500/12',
    iconClassName: 'text-fuchsia-700 dark:text-fuchsia-300',
    surfaceClassName:
      'bg-[radial-gradient(circle_at_top_left,rgba(232,121,249,0.18),transparent_42%),linear-gradient(180deg,rgba(253,244,255,0.96),rgba(250,232,255,0.88))] dark:bg-[radial-gradient(circle_at_top_left,rgba(232,121,249,0.22),transparent_42%),linear-gradient(180deg,rgba(192,38,211,0.14),rgba(32,16,35,0.92))]',
    borderClassName: 'border-fuchsia-400/20',
    accentTextClassName: 'text-fuchsia-700 dark:text-fuchsia-200',
  },
};

export const getSectionTheme = (section: AppSection): SectionTheme =>
  sectionThemes[section] ?? sectionThemes.others;

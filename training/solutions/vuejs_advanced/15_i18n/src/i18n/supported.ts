export const SUPPORTED = ['fr', 'en', 'de'] as const;

export type SupportedLocale = (typeof SUPPORTED)[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
};

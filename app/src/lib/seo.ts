import { ARCORA_SUPPORT_EMAIL } from '@/lib/publicInfo';

export const SITE_NAME = 'Arcora';
const LOCAL_SITE_URL = 'http://localhost:3000';
const LOCAL_HOSTNAMES = new Set(['localhost', '0.0.0.0', '::1', '[::1]']);
const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const sanitizeSiteUrl = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    return trimTrailingSlashes(url.origin);
  } catch {
    return undefined;
  }
};

const isLocalSiteUrl = (value: string) => {
  try {
    const url = new URL(value);
    return LOCAL_HOSTNAMES.has(url.hostname) || /^127(?:\.\d{1,3}){3}$/.test(url.hostname);
  } catch {
    return false;
  }
};

const getFallbackSiteUrl = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return trimTrailingSlashes(window.location.origin);
  }

  if (import.meta.env.DEV) {
    return LOCAL_SITE_URL;
  }

  throw new Error('VITE_PUBLIC_SITE_URL is required for production SEO URL generation.');
};

const configuredSiteUrl = sanitizeSiteUrl(import.meta.env.VITE_PUBLIC_SITE_URL);

export const SITE_URL =
  configuredSiteUrl && (!import.meta.env.PROD || !isLocalSiteUrl(configuredSiteUrl))
    ? configuredSiteUrl
    : getFallbackSiteUrl();
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icons/icon-512x512.png`;
export const DEFAULT_TITLE =
  'Arcora | Household admin app for bills, subscriptions, warranties, documents, and reminders';
export const DEFAULT_DESCRIPTION =
  'Arcora helps people keep bills, subscriptions, warranties, documents, reminders, and secure household records organized in one calm life-admin dashboard.';

const SOFTWARE_FEATURES = [
  'Bill due date tracking',
  'Subscription renewal tracking',
  'Warranty expiration tracking',
  'Personal document organization',
  'Password record organization',
  'Important date reminders',
  'Household admin dashboard',
];

export type JsonLd = Record<string, unknown>;

export type Breadcrumb = {
  name: string;
  path: string;
};

export const absoluteUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
};

export const createOrganizationSchema = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  description:
    'Arcora builds a secure life admin dashboard for organizing household records, bills, subscriptions, warranties, documents, passwords, and reminders.',
  url: SITE_URL,
  logo: absoluteUrl('/icons/icon-512x512.png'),
  email: ARCORA_SUPPORT_EMAIL,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: ARCORA_SUPPORT_EMAIL,
    url: absoluteUrl('/contact'),
  },
});

export const createWebSiteSchema = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  url: SITE_URL,
  inLanguage: 'en',
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
});

export const createSoftwareApplicationSchema = ({
  description = DEFAULT_DESCRIPTION,
  path = '/',
  featureList = SOFTWARE_FEATURES,
}: {
  description?: string;
  path?: string;
  featureList?: string[];
} = {}): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'ProductivityApplication',
  applicationSubCategory: 'Life admin dashboard',
  operatingSystem: 'Web',
  url: absoluteUrl(path),
  image: DEFAULT_OG_IMAGE,
  description,
  featureList,
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
});

export const createBreadcrumbSchema = (breadcrumbs: Breadcrumb[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: breadcrumb.name,
    item: absoluteUrl(breadcrumb.path),
  })),
});

export const createFaqSchema = (
  faqs: Array<{ question: string; answer: string }>,
): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

import fs from "node:fs"
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"

// https://vite.dev/config/
const PUBLIC_SITE_URL_ENV = 'VITE_PUBLIC_SITE_URL';
const LOCAL_SITE_URL = 'http://localhost:3000';
const LOCAL_HOSTNAMES = new Set(['localhost', '0.0.0.0', '::1', '[::1]']);

const emitServiceWorker = (env: Record<string, string>): Plugin => ({
  name: 'emit-arcora-service-worker',
  apply: 'build',
  generateBundle() {
    const templatePath = path.resolve(__dirname, 'service-worker.js');
    let source = fs.readFileSync(templatePath, 'utf8');

    const replacements = {
      '__VITE_FIREBASE_API_KEY__': env.VITE_FIREBASE_API_KEY ?? '',
      '__VITE_FIREBASE_AUTH_DOMAIN__': env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
      '__VITE_FIREBASE_PROJECT_ID__': env.VITE_FIREBASE_PROJECT_ID ?? '',
      '__VITE_FIREBASE_STORAGE_BUCKET__': env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
      '__VITE_FIREBASE_MESSAGING_SENDER_ID__': env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
      '__VITE_FIREBASE_APP_ID__': env.VITE_FIREBASE_APP_ID ?? '',
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      source = source.replaceAll(placeholder, value);
    });

    this.emitFile({
      type: 'asset',
      fileName: 'service-worker.js',
      source,
    });
  },
});

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const sanitizePublicSiteUrl = (value: string | undefined) => {
  const trimmedValue = value?.trim();

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

const resolvePublicSiteUrl = (env: Record<string, string>, isBuild: boolean) => {
  const siteUrl = sanitizePublicSiteUrl(env[PUBLIC_SITE_URL_ENV]);

  if (!siteUrl) {
    if (isBuild) {
      throw new Error(
        `${PUBLIC_SITE_URL_ENV} must be set to the deployed public origin before building SEO assets.`,
      );
    }

    return LOCAL_SITE_URL;
  }

  if (isBuild && isLocalSiteUrl(siteUrl)) {
    throw new Error(
      `${PUBLIC_SITE_URL_ENV} cannot be a localhost URL for production SEO assets. Set it to the deployed public origin.`,
    );
  }

  return siteUrl;
};

const sitemapEntries = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/bill-reminder-app', changefreq: 'weekly', priority: '0.9' },
  { path: '/subscription-tracker', changefreq: 'weekly', priority: '0.9' },
  { path: '/warranty-tracker', changefreq: 'weekly', priority: '0.85' },
  { path: '/personal-document-organizer', changefreq: 'weekly', priority: '0.85' },
  { path: '/important-date-reminder-app', changefreq: 'weekly', priority: '0.8' },
  { path: '/password-organizer', changefreq: 'weekly', priority: '0.8' },
  { path: '/household-management-app', changefreq: 'weekly', priority: '0.85' },
  { path: '/security', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
];

const llmsPageEntries = [
  {
    path: '/',
    title: 'Arcora homepage',
    description:
      'Secure life admin dashboard for household records, bills, subscriptions, warranties, documents, passwords, reminders, and important dates.',
  },
  {
    path: '/bill-reminder-app',
    title: 'Bill reminder app',
    description:
      'Feature page for tracking household bill due dates, recurring payments, payment notes, reminders, and supporting documents.',
  },
  {
    path: '/subscription-tracker',
    title: 'Subscription tracker',
    description:
      'Feature page for tracking active subscriptions, renewal dates, recurring charges, cancellation notes, and related records.',
  },
  {
    path: '/warranty-tracker',
    title: 'Warranty tracker',
    description:
      'Feature page for organizing product details, purchase records, warranty expiration dates, receipts, and coverage reminders.',
  },
  {
    path: '/personal-document-organizer',
    title: 'Personal document organizer',
    description:
      'Feature page for organizing household documents, statements, receipts, warranty files, detected dates, notes, and reminders.',
  },
  {
    path: '/important-date-reminder-app',
    title: 'Important date reminder app',
    description:
      'Feature page for reminders tied to bills, renewals, warranties, document dates, and household deadlines.',
  },
  {
    path: '/password-organizer',
    title: 'Password organizer',
    description:
      'Feature page for organizing household account records, encrypted saved password values, recovery files, linked websites, and review notes.',
  },
  {
    path: '/household-management-app',
    title: 'Household management app',
    description:
      'Feature page for the broader household admin system across bills, subscriptions, warranties, documents, passwords, and reminders.',
  },
];

const llmsSupportEntries = [
  {
    path: '/security',
    title: 'Security overview',
    description:
      'Explains account access, user-scoped records, document storage, password handling, data ownership, deletion and export support, and contact paths.',
  },
  {
    path: '/about',
    title: 'About Arcora',
    description:
      'Explains what Arcora is, why it exists, and how it helps organize private life admin records.',
  },
  {
    path: '/contact',
    title: 'Contact Arcora',
    description:
      'Support page for account help, privacy requests, deletion requests, bug reports, complaints, and product questions.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description:
      'Explains what Arcora stores, how information is used, storage providers, documents, password records, deletion requests, and privacy contact.',
  },
  {
    path: '/terms',
    title: 'Terms of Use',
    description:
      'Explains user responsibilities, content ownership, sensitive records, responsible use, availability, deletion support, and contact.',
  },
];

const formatLlmsEntry = (
  siteUrl: string,
  entry: { path: string; title: string; description: string },
) => `- [${entry.title}](${siteUrl}${entry.path === '/' ? '/' : entry.path}): ${entry.description}`;

const createLlmsTxt = (siteUrl: string) => [
  '# Arcora',
  '',
  '> Arcora is a secure life admin dashboard for organizing household records, bills, subscriptions, warranties, documents, passwords, reminders, deadlines, and important dates.',
  '',
  'Arcora is a web application for private household admin and personal record organization. The public site explains product workflows for bills, subscriptions, warranties, documents, password records, reminders, and whole-household management.',
  '',
  '## Product Summary',
  '',
  '- Product category: secure life admin dashboard.',
  '- Primary use: organize household records and deadlines in one account-based workspace.',
  '- Core modules: bills, subscriptions, warranties, documents, passwords, reminders, and dashboard review.',
  '- Access: public pages invite users to start a free account. Arcora does not publish paid pricing or plan-limit details on these public pages.',
  '- Support contact: app.arcora@gmail.com.',
  '',
  '## Main Public Pages',
  '',
  ...llmsPageEntries.map((entry) => formatLlmsEntry(siteUrl, entry)),
  '',
  '## Trust, Support, and Legal Pages',
  '',
  ...llmsSupportEntries.map((entry) => formatLlmsEntry(siteUrl, entry)),
  '',
  '## Structured Data Notes',
  '',
  '- Public marketing pages include Organization, WebSite, SoftwareApplication, BreadcrumbList, and visible FAQPage schema where FAQ content is shown on the page.',
  '- Arcora does not publish ratings, reviews, awards, customer counts, or paid pricing claims in structured data.',
  '- Production canonical, sitemap, robots, and llms.txt URLs are controlled by VITE_PUBLIC_SITE_URL.',
  '',
].join('\n');

const emitSeoAssets = (env: Record<string, string>, isBuild: boolean): Plugin => {
  const siteUrl = resolvePublicSiteUrl(env, isBuild);

  return {
    name: 'emit-arcora-seo-assets',
    transformIndexHtml(html) {
      return html.replaceAll('__ARCORA_PUBLIC_SITE_URL__', siteUrl);
    },
    generateBundle() {
      const lastmod = new Date().toISOString().slice(0, 10);
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...sitemapEntries.map((entry) => [
          '  <url>',
          `    <loc>${siteUrl}${entry.path === '/' ? '/' : entry.path}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          `    <changefreq>${entry.changefreq}</changefreq>`,
          `    <priority>${entry.priority}</priority>`,
          '  </url>',
        ].join('\n')),
        '</urlset>',
      ].join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `${sitemap}\n`,
      });

      this.emitFile({
        type: 'asset',
        fileName: 'llms.txt',
        source: createLlmsTxt(siteUrl),
      });
    },
  };
};

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const enableSourcemaps = env.VITE_ENABLE_SOURCEMAPS === 'true';
  const isBuild = command === 'build';

  return {
    base: './',
    plugins: [
      react(),
      emitServiceWorker(env),
      emitSeoAssets(env, isBuild),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: enableSourcemaps,
      rollupOptions: {
        output: {
          manualChunks: {
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            'recharts': ['recharts'],
            'tesseract': ['tesseract.js'],
          },
        },
      },
    },
    optimizeDeps: {
      exclude: ['@huggingface/transformers'],
    },
    server: {
      port: 3000,
      host: true,
    },
  };
});

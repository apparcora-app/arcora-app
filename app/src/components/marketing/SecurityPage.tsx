import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingReveal } from '@/components/marketing/MarketingAtmosphere';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ARCORA_SUPPORT_EMAIL } from '@/lib/publicInfo';
import { createOrganizationSchema, createWebSiteSchema } from '@/lib/seo';

const securityTopics = [
  {
    title: 'Account access',
    description:
      'Arcora uses Firebase Authentication for account sign-in, including email and password login, password reset, and supported social sign-in providers. Account records are scoped to the signed-in user.',
  },
  {
    title: 'User-scoped records',
    description:
      'Bills, subscriptions, warranties, documents, passwords, reminders, and notifications are stored under user-specific paths. Firestore rules are written so signed-in users can read and manage their own records.',
  },
  {
    title: 'Document protection',
    description:
      'Uploaded documents are saved in user-specific Firebase Storage paths. Storage rules require the signed-in owner to read, upload, update, or delete files, and uploads are limited by file type and size.',
  },
  {
    title: 'Password handling',
    description:
      'Saved password values are encrypted before they are stored. Reveal and copy actions require a session master key entered by the user, and that key should be kept private and strong.',
  },
  {
    title: 'Data ownership',
    description:
      'You keep ownership of the records and files you add to Arcora. Arcora stores and processes that information to provide the dashboard, reminders, uploads, and account features you use.',
  },
  {
    title: 'Deletion and export help',
    description:
      'You can delete many individual records and uploaded files inside the app. For account-level deletion requests, privacy questions, or export help, contact Arcora support with the email tied to your account.',
  },
];

const supportLinks = [
  {
    title: 'Privacy policy',
    body: 'Review what information Arcora stores, how it is used, and how to contact support for privacy requests.',
    href: '/privacy',
  },
  {
    title: 'Terms of use',
    body: 'Read the responsibilities that apply when you use Arcora to store records, files, reminders, and account details.',
    href: '/terms',
  },
  {
    title: 'Contact support',
    body: `Send account, privacy, deletion, or security questions to ${ARCORA_SUPPORT_EMAIL}.`,
    href: '/contact',
  },
];

export const SecurityPage = () => {
  return (
    <>
      <SEOHead
        title="Arcora Security and Trust | Account, documents, and password handling"
        description="Learn how Arcora approaches account access, user-scoped records, document uploads, password handling, data ownership, deletion requests, and support contact."
        path="/security"
        schemas={[createOrganizationSchema(), createWebSiteSchema()]}
        breadcrumbs={[
          { name: 'Arcora', path: '/' },
          { name: 'Security', path: '/security' },
        ]}
      />

      <MarketingLayout
        badge="Security and trust"
        title="A practical security overview for private life admin."
        description="Arcora is designed for personal records that deserve careful handling. This page explains the security and support basics in plain language, with specific details instead of broad security labels."
      >
        <MarketingReveal as="section" className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white text-slate-950 shadow-sm">
            <CardContent className="p-6 lg:p-7">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border border-[#d9ddf3]/60 bg-slate-50 p-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight md:text-2xl text-[#17164d]">
                    How Arcora handles access and sensitive records
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                    Arcora brings household records into one account-based workspace. The app uses authenticated access, user-scoped database paths, and user-scoped file storage rules to keep each person&apos;s records separated.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {securityTopics.map((topic) => (
                  <div
                    key={topic.title}
                    className="rounded-xl border border-[#d9ddf3]/80 bg-slate-50/50 p-4 shadow-sm transition-colors hover:bg-slate-100/70 hover:border-slate-300"
                  >
                    <h3 className="text-base font-bold text-slate-900">{topic.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{topic.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white text-slate-950 shadow-sm">
            <CardContent className="p-6 lg:p-7">
              <h2 className="text-xl font-bold tracking-tight md:text-2xl text-[#17164d]">
                Review the public trust pages before signing up
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                Security is not a single label. It is the combination of account access, storage rules, careful product behavior, and clear support paths when something needs attention.
              </p>
              <div className="mt-6 space-y-4">
                {supportLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block rounded-xl border border-[#d9ddf3]/80 bg-slate-50/50 p-4 shadow-sm transition-colors hover:bg-slate-100/70 hover:border-slate-300"
                  >
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-[#d9ddf3]/80 bg-slate-50/50 p-4 shadow-sm transition-colors hover:bg-slate-100/70 hover:border-slate-300">
                <h3 className="text-base font-bold text-slate-900">Practical limits</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  No online service can eliminate every risk. Protect your login, use a strong master key for password records, keep sensitive details out of support messages, and contact Arcora if you believe something needs review.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-sm transition-transform hover:-translate-y-0.5">
                  <Link to="/register">
                    Start your free account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[#d9ddf3] hover:bg-slate-50 text-slate-700">
                  <Link to="/contact">Contact Arcora</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </MarketingReveal>
      </MarketingLayout>
    </>
  );
};

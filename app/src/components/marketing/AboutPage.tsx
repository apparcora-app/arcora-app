import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingReveal } from '@/components/marketing/MarketingAtmosphere';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createOrganizationSchema, createWebSiteSchema } from '@/lib/seo';

const aboutPrinciples = [
  {
    title: 'Built around real household admin',
    description:
      'Arcora focuses on bills, subscriptions, warranties, documents, passwords, reminders, and deadlines because those are the records people repeatedly need to find, review, and act on.',
  },
  {
    title: 'Designed for context, not clutter',
    description:
      'A reminder is more useful when it stays close to the bill, renewal, document, or warranty it belongs to. Arcora keeps related details together so decisions take less searching.',
  },
  {
    title: 'Clear enough to keep using',
    description:
      'The product is meant to support a simple review habit: add the record, attach the right context, and return to one dashboard when something needs attention.',
  },
];

const workflowLinks = [
  {
    href: '/household-management-app',
    title: 'Household management app',
    body: 'See how Arcora works as a whole-system home-admin workspace.',
  },
  {
    href: '/bill-reminder-app',
    title: 'Bill reminder app',
    body: 'Review how bill due dates and supporting records fit into Arcora.',
  },
  {
    href: '/personal-document-organizer',
    title: 'Personal document organizer',
    body: 'Learn how documents stay connected to reminders, records, and follow-up tasks.',
  },
];

export const AboutPage = () => {
  return (
    <>
      <SEOHead
        title="About Arcora | Secure life admin dashboard"
        description="Learn what Arcora is, who it is for, and why it helps organize bills, subscriptions, warranties, documents, passwords, reminders, and household records."
        path="/about"
        schemas={[createOrganizationSchema(), createWebSiteSchema()]}
        breadcrumbs={[
          { name: 'Arcora', path: '/' },
          { name: 'About', path: '/about' },
        ]}
      />

      <MarketingLayout
        badge="About Arcora"
        title="Arcora is a secure life admin dashboard for the records everyday life depends on."
        description="Arcora helps people organize bills, subscriptions, warranties, documents, passwords, reminders, deadlines, and household records in one clearer workspace."
      >
        <MarketingReveal as="section" className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white text-slate-950 shadow-sm">
            <CardContent className="p-6 lg:p-7">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border border-[#d9ddf3]/60 bg-slate-50 p-2">
                  <BadgeCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight md:text-2xl text-[#17164d]">
                    Why Arcora exists
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                    Most life admin does not fail because people are careless. It fails because the information is split across email, calendars, notes, folders, browser saves, and memory. Arcora gives those recurring responsibilities a dedicated home.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {aboutPrinciples.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-[#d9ddf3]/80 bg-slate-50/50 p-4 shadow-sm transition-colors hover:bg-slate-100/70 hover:border-slate-300"
                  >
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white text-slate-950 shadow-sm">
            <CardContent className="p-6 lg:p-7">
              <h2 className="text-xl font-bold tracking-tight md:text-2xl text-[#17164d]">
                What Arcora helps you organize
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                Arcora is not a generic notes app or a heavy project-management system. It is a private home for the records, deadlines, and reminders that support daily life.
              </p>
              <div className="mt-6 space-y-4">
                {workflowLinks.map((item) => (
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
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-sm transition-transform hover:-translate-y-0.5">
                  <Link to="/register">
                    Start your free account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[#d9ddf3] hover:bg-slate-50 text-slate-700">
                  <Link to="/security">Read security overview</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </MarketingReveal>
      </MarketingLayout>
    </>
  );
};

import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import type { MarketingPageData } from '@/components/marketing/marketingPages';
import { SEOHead } from '@/components/seo/SEOHead';
import { MarketingReveal } from '@/components/marketing/MarketingAtmosphere';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  createFaqSchema,
  createOrganizationSchema,
  createSoftwareApplicationSchema,
  createWebSiteSchema,
} from '@/lib/seo';

type MarketingFeaturePageProps = {
  page: MarketingPageData;
};

export const MarketingFeaturePage = ({ page }: MarketingFeaturePageProps) => {
  const breadcrumbs = [
    { name: 'Arcora', path: '/' },
    { name: page.shortTitle, path: page.slug },
  ];

  return (
    <>
      <SEOHead
        title={page.seoTitle}
        description={page.metaDescription}
        path={page.slug}
        schemas={[
          createOrganizationSchema(),
          createWebSiteSchema(),
          createSoftwareApplicationSchema({
            description: page.metaDescription,
            path: page.slug,
            featureList: [
              page.definition,
              page.problem.title,
              page.solution.title,
              ...page.valueCards.map((card) => card.title),
            ],
          }),
          createFaqSchema(page.faqs),
        ]}
        breadcrumbs={breadcrumbs}
      />

      <MarketingLayout
        badge={page.eyebrow}
        title={page.heroTitle}
        description={page.heroDescription}
      >
        <MarketingReveal as="section" className="grid gap-4 lg:grid-cols-[1.25fr_0.95fr]">
          {/* Left Panel: Crisp White Marketing Theme */}
          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white text-slate-950 shadow-sm">
            <CardContent className="p-6 lg:p-7">
              <h2 className="text-xl font-bold tracking-tight md:text-2xl text-[#17164d]">
                What is a {page.shortTitle.toLowerCase()}?
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                {page.definition}
              </p>
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm text-slate-900">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
                  The problem
                </p>
                <h3 className="mt-2 text-base font-bold text-amber-900">{page.problem.title}</h3>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  {page.problem.description}
                </p>
              </div>
              <div className="mt-5 space-y-4">
                {page.heroPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="rounded-lg border border-[#d9ddf3]/60 bg-slate-50 p-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm leading-6 text-slate-600 md:text-base">{point}</p>
                  </div>
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
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel: Crisp White Marketing Theme */}
          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white shadow-sm text-slate-950">
            <CardContent className="p-6 lg:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
                How Arcora solves it
              </p>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#17164d] md:text-2xl">
                {page.solution.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                {page.solution.description}
              </p>
              <div className="mt-4 grid gap-3">
                {page.valueCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-xl border border-[#d9ddf3]/70 bg-slate-50/50 p-4 shadow-sm transition-colors hover:bg-slate-100/70 hover:border-slate-300"
                  >
                    <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </MarketingReveal>

        <MarketingReveal as="section" className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]" delay={0.04}>
          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    Workflow
                  </Badge>
                  <h2 className="mt-4 text-xl font-bold tracking-tight text-[#17164d] md:text-2xl">
                    Simple workflow in Arcora
                  </h2>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {page.workflow.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-xl border border-[#d9ddf3]/80 bg-slate-50/50 p-4 shadow-sm transition-colors hover:bg-slate-100/70 hover:border-slate-300"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-7">
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                Use cases
              </Badge>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#17164d] md:text-2xl">
                Specific use cases
              </h2>
              <div className="mt-6 grid gap-4">
                {page.useCases.map((useCase) => (
                  <div
                    key={useCase.title}
                    className="rounded-xl border border-[#d9ddf3]/80 bg-slate-50/50 p-4 shadow-sm transition-colors hover:bg-slate-100/70 hover:border-slate-300"
                  >
                    <h3 className="text-base font-bold text-slate-900">{useCase.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {useCase.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </MarketingReveal>

        <MarketingReveal as="section" className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]" delay={0.06}>
          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-7">
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                FAQs
              </Badge>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#17164d] md:text-2xl">
                Questions people usually ask before choosing a {page.shortTitle.toLowerCase()}
              </h2>
              <div className="mt-6 space-y-4">
                {page.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-[#d9ddf3]/80 bg-slate-50/50 p-4 shadow-sm transition-colors hover:bg-slate-100/70 hover:border-slate-300"
                  >
                    <h3 className="text-base font-bold text-slate-900">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-[#d9ddf3]/80 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-7">
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                Explore next
              </Badge>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#17164d] md:text-2xl">
                Related pages for the same home-admin system
              </h2>
              <div className="mt-6 space-y-4">
                {page.relatedPages.map((relatedPage) => (
                  <Link
                    key={relatedPage.href}
                    to={relatedPage.href}
                    className="block rounded-xl border border-[#d9ddf3]/80 bg-slate-50/50 p-4 shadow-sm transition-colors hover:bg-slate-100/70 hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{relatedPage.label}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {relatedPage.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 text-blue-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </MarketingReveal>
      </MarketingLayout>
    </>
  );
};

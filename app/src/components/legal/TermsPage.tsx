import { Card, CardContent } from '@/components/ui/card';
import { PublicInfoLayout } from '@/components/legal/PublicInfoLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { ARCORA_LEGAL_EFFECTIVE_DATE, ARCORA_SUPPORT_EMAIL } from '@/lib/publicInfo';
import { createOrganizationSchema, createWebSiteSchema } from '@/lib/seo';

const terms = [
  {
    title: 'Using Arcora',
    body:
      'Arcora is provided as a personal life admin dashboard for organizing records, reminders, documents, account details, and related household information. You are responsible for the information you upload, store, edit, or delete through your own use of the product.',
  },
  {
    title: 'Your account',
    body:
      'Keep your login credentials private and accurate. You are responsible for activity that happens through your account unless you report unauthorized access or another issue that requires support review.',
  },
  {
    title: 'Your content and ownership',
    body:
      'You keep ownership of the information and files you upload to Arcora. By using the service, you give Arcora permission to store and process that content only as needed to provide the features you choose to use.',
  },
  {
    title: 'Sensitive records',
    body:
      'Arcora can store personal records, uploaded documents, password records, reminders, and other sensitive details. You are responsible for deciding what to save, keeping your account secure, and avoiding unnecessary sensitive information in support messages.',
  },
  {
    title: 'Responsible use',
    body:
      'Do not use Arcora for unlawful activity, abuse of third-party services, malicious uploads, attempts to bypass security rules, or attempts to interfere with the product or other users.',
  },
  {
    title: 'No professional advice',
    body:
      'Arcora helps organize information, reminders, and records. It does not provide legal, financial, tax, insurance, medical, or professional advice. You are responsible for checking important deadlines, payments, documents, and decisions independently.',
  },
  {
    title: 'Availability and product changes',
    body:
      'Arcora works to stay reliable, but uptime, uninterrupted access, and permanent feature availability cannot be guaranteed. Features may change over time as the product improves or as technical requirements change.',
  },
  {
    title: 'Service providers',
    body:
      'Arcora uses third-party infrastructure providers to support authentication, data storage, file storage, hosting, and related product features. These providers help Arcora deliver the service you use.',
  },
  {
    title: 'Deletion and support requests',
    body:
      'You can delete many individual records inside the app. For account-level deletion requests, privacy questions, complaints, or account access issues, contact Arcora support with the email tied to your account.',
  },
  {
    title: 'Contact',
    body:
      `Questions about these terms can be sent to ${ARCORA_SUPPORT_EMAIL}.`,
  },
];

export const TermsPage = () => {
  return (
    <>
      <SEOHead
        title="Terms of Use | Arcora"
        description="Read the terms that explain how Arcora is intended to be used, your responsibilities, and how to contact support."
        path="/terms"
        schemas={[createOrganizationSchema(), createWebSiteSchema()]}
        breadcrumbs={[
          { name: 'Arcora', path: '/' },
          { name: 'Terms of Use', path: '/terms' },
        ]}
      />
      <PublicInfoLayout
        badge="Terms of Use"
        title="The terms for using Arcora."
        description="These terms explain how Arcora is intended to be used, what you remain responsible for, and how to contact support if something needs attention."
        asideTitle="Clear terms for a private life admin tool."
        asideDescription="Use Arcora responsibly, protect your account, review important records independently, and contact support when you need help with access, content, deletion, or privacy questions."
        asideMeta={
          <div className="grid gap-3">
            <MetaCard label="Effective" value={ARCORA_LEGAL_EFFECTIVE_DATE} />
            <MetaCard label="Contact" value={ARCORA_SUPPORT_EMAIL} />
          </div>
        }
      >
        {terms.map((section) => (
          <Card
            key={section.title}
            className="rounded-[1.35rem] border border-[#d9ddf3]/80 bg-white shadow-sm"
          >
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-[#17164d]">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
            </CardContent>
          </Card>
        ))}
      </PublicInfoLayout>
    </>
  );
};

const MetaCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.2rem] border border-[#d9ddf3]/70 bg-white p-4 shadow-[0_8px_30px_rgba(59,72,130,0.02)]">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-sm font-bold text-[#17164d]">{value}</p>
  </div>
);

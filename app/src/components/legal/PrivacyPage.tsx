import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PublicInfoLayout } from '@/components/legal/PublicInfoLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { ARCORA_LEGAL_EFFECTIVE_DATE, ARCORA_SUPPORT_EMAIL } from '@/lib/publicInfo';
import { createOrganizationSchema, createWebSiteSchema } from '@/lib/seo';

const sections = [
  {
    title: 'Information you choose to add',
    body:
      'Arcora stores the information you add to your account, such as bills, subscriptions, warranties, documents, reminders, password records, settings, and profile details. Uploaded files may include file names, file types, file sizes, extracted text, detected dates, notes, and related metadata needed to provide the app features.',
  },
  {
    title: 'Account and sign-in information',
    body:
      'Arcora uses Firebase Authentication for account access. If you sign in with email and password or a supported provider, Arcora receives the account details needed to create, authenticate, and maintain your login, such as your email address and display name when available.',
  },
  {
    title: 'How Arcora uses your information',
    body:
      'Arcora uses your information to authenticate your account, show your dashboard, save records, store uploaded files, keep reminders visible, support document workflows, sync product data, and respond to support or privacy requests. Arcora does not sell your personal data.',
  },
  {
    title: 'Storage and service providers',
    body:
      'Arcora uses Firebase services for authentication, database storage, file storage, hosting, and related app infrastructure. Records and uploaded files are stored so the product can provide the features you choose to use.',
  },
  {
    title: 'Documents and uploaded files',
    body:
      'Documents you upload are stored in user-specific storage paths and referenced by records in your account. You can delete uploaded document records inside the app, and Arcora attempts to remove the related stored file when the document is deleted.',
  },
  {
    title: 'Password records',
    body:
      'Saved password values are encrypted before they are stored. Reveal and copy actions require the session master key you enter in the app. You are responsible for choosing and protecting a strong master key.',
  },
  {
    title: 'Your choices and control',
    body:
      'You can edit or delete many records directly inside Arcora, including bills, subscriptions, warranties, documents, passwords, reminders, and notifications. Some account-level requests may require help from support.',
  },
  {
    title: 'Deletion and export requests',
    body:
      `For account-level deletion requests, privacy questions, complaints, or export help, contact ${ARCORA_SUPPORT_EMAIL}. Include the email address tied to your Arcora account so the request can be matched safely.`,
  },
  {
    title: 'Security limits',
    body:
      'Arcora uses authenticated access and user-scoped storage rules, but no online service can remove every risk. You should protect your login, use strong passwords, keep your master key private, and contact support if you believe your account or data has been exposed.',
  },
  {
    title: 'Policy updates',
    body:
      'Arcora may update this policy as the product changes. The effective date on this page shows when this version took effect.',
  },
];

export const PrivacyPage = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy | Arcora"
        description="Read how Arcora stores, uses, and supports requests related to the information you add to your life admin account."
        path="/privacy"
        schemas={[createOrganizationSchema(), createWebSiteSchema()]}
        breadcrumbs={[
          { name: 'Arcora', path: '/' },
          { name: 'Privacy Policy', path: '/privacy' },
        ]}
      />
      <PublicInfoLayout
        badge="Privacy Policy"
        title="How Arcora handles the information you choose to store."
        description="Arcora is built for personal life admin, including records that can be sensitive. This policy explains what Arcora stores, how it is used, and how to contact support for privacy, deletion, or export questions."
        asideTitle="Private life admin, clearly explained."
        asideDescription="This page summarizes the data Arcora uses to provide account access, records, reminders, document uploads, password records, and support."
        asideMeta={
          <div className="grid gap-3">
            <MetaCard label="Effective" value={ARCORA_LEGAL_EFFECTIVE_DATE} />
            <MetaCard label="Support" value={ARCORA_SUPPORT_EMAIL} />
          </div>
        }
      >
        {sections.map((section) => (
          <Card
            key={section.title}
            className="rounded-[1.35rem] border border-[#d9ddf3]/80 bg-white shadow-sm"
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#17164d]">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
                </div>
                <Badge variant="outline" className="w-fit rounded-full border-primary/20 bg-primary/5 text-primary">
                  Policy
                </Badge>
              </div>
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

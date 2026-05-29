import type { ElementType, FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Copy, Mail, MessageSquareText, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PublicInfoLayout } from '@/components/legal/PublicInfoLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { showToast } from '@/lib/notifications';
import { ARCORA_SUPPORT_EMAIL } from '@/lib/publicInfo';
import { createOrganizationSchema, createWebSiteSchema } from '@/lib/seo';

const topicOptions = [
  'General question',
  'Bug report',
  'Account access',
  'Privacy request',
  'Delete account request',
  'Complaint',
];

export const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(topicOptions[0]);
  const [message, setMessage] = useState('');

  const mailtoHref = useMemo(() => {
    const subject = `Arcora support: ${topic}`;
    const body = [
      `Name: ${name || 'Not provided'}`,
      `Email: ${email || 'Not provided'}`,
      `Topic: ${topic}`,
      '',
      message || 'Please describe your question or request.',
    ].join('\n');

    return `mailto:${ARCORA_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, message, name, topic]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ARCORA_SUPPORT_EMAIL);
      showToast({
        title: 'Support email copied',
        description: ARCORA_SUPPORT_EMAIL,
        type: 'success',
      });
    } catch {
      showToast({
        title: 'Copy unavailable',
        description: `Send your message to ${ARCORA_SUPPORT_EMAIL}.`,
        type: 'warning',
      });
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    window.location.href = mailtoHref;
    showToast({
      title: 'Opening your email app',
      description: 'If nothing opens, copy the support address and send your message manually.',
      type: 'info',
    });
  };

  return (
    <>
      <SEOHead
        title="Contact Arcora | Support, account help, and privacy requests"
        description="Contact Arcora for product support, account access help, privacy requests, deletion requests, complaints, or bug reports."
        path="/contact"
        schemas={[createOrganizationSchema(), createWebSiteSchema()]}
        breadcrumbs={[
          { name: 'Arcora', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
      />
      <PublicInfoLayout
        badge="Contact Arcora"
        title="Contact Arcora support."
        description="Use this page for account help, privacy requests, deletion requests, bug reports, complaints, or product questions. The form opens a prepared email draft so you can review and send it from your own email app."
        asideTitle="What to include in your message."
        asideDescription="Include the email address connected to your Arcora account, the topic you need help with, and enough detail for support to understand the issue. Do not include passwords or unnecessary sensitive information."
        asideMeta={
          <div className="space-y-3">
            <MetaCard
              icon={Mail}
              title="Support email"
              description={ARCORA_SUPPORT_EMAIL}
              action={
                <Button variant="outline" size="sm" onClick={handleCopyEmail}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              }
            />
            <MetaCard
              icon={ShieldAlert}
              title="Good topics to send here"
              description="Login trouble, account access, privacy questions, deletion requests, complaints, product questions, bug reports, and security concerns."
            />
          </div>
        }
      >
        <Card className="rounded-[1.35rem] border border-[#d9ddf3]/80 bg-white shadow-[0_12px_40px_rgba(59,72,130,0.04)]">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3">
                <MessageSquareText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#17164d]">Send a support message</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Arcora support is handled by email. This form does not submit a ticket in the browser; it prepares a message you can send from your email client.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-sm font-semibold text-slate-700">Name</Label>
                  <Input
                    id="contact-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="h-12 rounded-2xl border-[#d9ddf3] bg-white text-slate-800 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm font-semibold text-slate-700">Account email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 rounded-2xl border-[#d9ddf3] bg-white text-slate-800 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-topic" className="text-sm font-semibold text-slate-700">Topic</Label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d9ddf3] bg-white px-4 text-sm text-slate-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {topicOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-sm font-semibold text-slate-700">Message</Label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={7}
                  className="w-full rounded-2xl border border-[#d9ddf3] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Describe what happened, what you need, and any relevant account or device details. Do not include passwords."
                  required
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-transform hover:-translate-y-0.5">
                  <Mail className="mr-2 h-4 w-4" />
                  Open email draft
                </Button>
                <Button type="button" variant="outline" onClick={handleCopyEmail} className="rounded-full border-[#d9ddf3] hover:bg-slate-50 text-slate-700">
                  Copy support email
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </PublicInfoLayout>
    </>
  );
};

const MetaCard = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ElementType;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="rounded-[1.2rem] border border-[#d9ddf3]/70 bg-white p-4 shadow-[0_8px_30px_rgba(59,72,130,0.02)]">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-primary/15 bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#17164d]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {action}
    </div>
  </div>
);

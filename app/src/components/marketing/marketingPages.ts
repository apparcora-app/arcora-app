export type MarketingFaq = {
  question: string;
  answer: string;
};

export type MarketingSectionCard = {
  title: string;
  description: string;
};

export type MarketingPageData = {
  slug: string;
  navLabel: string;
  shortTitle: string;
  seoTitle: string;
  metaDescription: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  definition: string;
  problem: MarketingSectionCard;
  solution: MarketingSectionCard;
  heroPoints: string[];
  valueCards: MarketingSectionCard[];
  workflow: MarketingSectionCard[];
  useCases: MarketingSectionCard[];
  faqs: MarketingFaq[];
  relatedPages: Array<{
    href: string;
    label: string;
    description: string;
  }>;
};

export const marketingPages: MarketingPageData[] = [
  {
    slug: '/bill-reminder-app',
    navLabel: 'Bills',
    shortTitle: 'Bill Reminder App',
    seoTitle: 'Bill Reminder App for Household Due Dates | Arcora',
    metaDescription:
      'Arcora is a bill reminder app for tracking household due dates, recurring payments, payment notes, and supporting documents in one life admin dashboard.',
    eyebrow: 'Bills and due dates',
    heroTitle: 'Bill reminder app for household due dates and payment records',
    heroDescription:
      'Track recurring bills, one-time payments, reminder timing, and the records behind each payment without rebuilding the same system in calendars, inboxes, and spreadsheets.',
    definition:
      'A bill reminder app helps you save bill details, due dates, payment timing, notes, and related documents so upcoming payments are easier to review before they become urgent.',
    problem: {
      title: 'Bill due dates are easy to miss when every provider works differently',
      description:
        'Utilities, insurance, rent, loans, and service bills often arrive through different emails, portals, statements, and renewal notices. A basic calendar alert can remind you that something is due, but it usually does not keep the amount, document, notes, and follow-up context together.',
    },
    solution: {
      title: 'Arcora keeps the bill, reminder, and supporting record connected',
      description:
        'Arcora gives each bill a dedicated record with due date details, recurrence, notes, status, and reminder timing. When a statement or document matters, it can stay connected to the bill so the next action has context.',
    },
    heroPoints: [
      'Track recurring and one-time bill due dates in one dashboard',
      'Keep bill notes, payment status, and related documents close to the bill record',
      'Review what is due soon without relying on memory or scattered reminders',
    ],
    valueCards: [
      {
        title: 'Due dates stay visible',
        description:
          'Save the date, category, amount, status, and recurrence pattern so upcoming bills can be reviewed from one place.',
      },
      {
        title: 'Payment context is easier to recover',
        description:
          'Keep notes and supporting statements near the bill record instead of searching through old emails when a question comes up.',
      },
      {
        title: 'Reminders match the risk',
        description:
          'Use reminder timing that fits the bill, from same-day nudges to earlier lead times for larger payments or renewal windows.',
      },
    ],
    workflow: [
      {
        title: 'Create the bill record',
        description:
          'Add the bill name, amount, due date, category, payment status, recurrence, and notes so the record is clear later.',
      },
      {
        title: 'Attach or connect the source document',
        description:
          'Keep the statement, receipt, invoice, or relevant document connected when proof or extra context will matter later.',
      },
      {
        title: 'Review upcoming payments',
        description:
          'Use the dashboard and reminders to check what is due soon, what is overdue, and which payments need follow-up.',
      },
    ],
    useCases: [
      {
        title: 'Monthly utilities and housing costs',
        description:
          'Track electricity, internet, rent, mortgage, insurance, and other recurring household payments without spreading them across separate reminders.',
      },
      {
        title: 'One-time payment deadlines',
        description:
          'Save annual fees, service charges, school payments, tax-adjacent deadlines, and other payments that do not repeat often enough to remember.',
      },
      {
        title: 'Shared household review',
        description:
          'Give the person managing home admin a cleaner view of what needs attention before the next bill becomes a scramble.',
      },
    ],
    faqs: [
      {
        question: 'What is a bill reminder app?',
        answer:
          'A bill reminder app helps you track payment due dates, recurring bills, amounts, notes, and reminders so household payments are easier to review before they are overdue.',
      },
      {
        question: 'Can Arcora track recurring and one-time bills?',
        answer:
          'Yes. Arcora is designed for recurring bills and one-time payment deadlines, with records that can include due dates, notes, status, and reminder timing.',
      },
      {
        question: 'How is Arcora different from a calendar reminder?',
        answer:
          'A calendar reminder can tell you a bill is due. Arcora keeps the bill record, reminder timing, notes, status, and related documents together.',
      },
      {
        question: 'Can I keep bill documents with the reminder?',
        answer:
          'Yes. Arcora supports document records, so statements, receipts, invoices, or other supporting files can stay close to the bill they support.',
      },
    ],
    relatedPages: [
      {
        href: '/subscription-tracker',
        label: 'Subscription tracker',
        description: 'Track recurring services and renewal dates that behave like bills.',
      },
      {
        href: '/important-date-reminder-app',
        label: 'Important date reminder app',
        description: 'Use reminders for payment deadlines, renewals, and other time-sensitive admin.',
      },
      {
        href: '/personal-document-organizer',
        label: 'Personal document organizer',
        description: 'Keep statements, receipts, and invoices organized with the records they support.',
      },
    ],
  },
  {
    slug: '/subscription-tracker',
    navLabel: 'Subscriptions',
    shortTitle: 'Subscription Tracker',
    seoTitle: 'Subscription Tracker for Renewals and Recurring Charges | Arcora',
    metaDescription:
      'Arcora is a subscription tracker for organizing renewal dates, recurring charges, plan notes, cancellation windows, and related subscription records.',
    eyebrow: 'Renewals and recurring spend',
    heroTitle: 'Subscription tracker for renewals, recurring charges, and cancellation dates',
    heroDescription:
      'Keep streaming plans, software tools, memberships, device protection, and other recurring services visible before another renewal slips into the background.',
    definition:
      'A subscription tracker helps you list active subscriptions, renewal dates, recurring costs, cancellation notes, and reminders so you can review plans before the next charge.',
    problem: {
      title: 'Subscriptions become expensive because they are designed to fade into the background',
      description:
        'Many services renew automatically, bill on different cycles, and hide details across receipts, app stores, bank statements, and provider portals. By the time a charge appears, the best cancellation window may already be gone.',
    },
    solution: {
      title: 'Arcora turns each subscription into a reviewable record',
      description:
        'Arcora lets you save subscription names, costs, renewal dates, billing periods, notes, and reminders in the same dashboard as your bills and documents, so recurring spend is easier to inspect.',
    },
    heroPoints: [
      'Track active subscriptions, renewal dates, billing periods, and recurring charges',
      'Use reminders around cancellation windows and annual renewal dates',
      'Keep notes and documents close to each subscription record',
    ],
    valueCards: [
      {
        title: 'Renewal dates are easier to see',
        description:
          'Store the next renewal date and billing period so monthly, quarterly, and yearly plans do not disappear into statements.',
      },
      {
        title: 'Cancellation context stays close',
        description:
          'Save plan notes, cancellation links, or service details near the subscription instead of searching again when it is time to decide.',
      },
      {
        title: 'Recurring spend gets reviewed intentionally',
        description:
          'Use a dedicated list for active services so subscription cleanup becomes a regular review instead of a bank-statement surprise.',
      },
    ],
    workflow: [
      {
        title: 'Add the subscription',
        description:
          'Save the service name, amount, currency, billing period, category, next renewal date, and any cancellation notes.',
      },
      {
        title: 'Set renewal reminders',
        description:
          'Choose reminder timing that gives you enough room to keep, cancel, downgrade, or update the service before the charge lands.',
      },
      {
        title: 'Review active plans',
        description:
          'Check the dashboard to see which services are active, which renew soon, and which subscriptions need a decision.',
      },
    ],
    useCases: [
      {
        title: 'Streaming and household services',
        description:
          'Track entertainment plans, home services, device protection, memberships, and other recurring services that are easy to forget.',
      },
      {
        title: 'Software and creator tools',
        description:
          'Keep cloud storage, design tools, domain services, AI tools, and productivity subscriptions visible before annual renewals.',
      },
      {
        title: 'Family plan cleanup',
        description:
          'Review shared services, duplicate subscriptions, and plans no one uses before they continue into another billing cycle.',
      },
    ],
    faqs: [
      {
        question: 'What is a subscription tracker?',
        answer:
          'A subscription tracker helps you organize active subscriptions, renewal dates, billing periods, recurring costs, reminders, and cancellation details in one place.',
      },
      {
        question: 'Can Arcora track annual subscriptions?',
        answer:
          'Yes. Arcora can track monthly, quarterly, and yearly subscription records, including the next renewal date and reminder timing.',
      },
      {
        question: 'Why use a subscription tracker instead of a bank statement?',
        answer:
          'A bank statement shows charges after they happen. Arcora helps you review renewals before the next charge and keep plan context with the subscription record.',
      },
      {
        question: 'Can I track subscriptions with documents or receipts?',
        answer:
          'Yes. Arcora supports documents and notes, so subscription receipts, invoices, cancellation details, or plan records can stay connected.',
      },
    ],
    relatedPages: [
      {
        href: '/bill-reminder-app',
        label: 'Bill reminder app',
        description: 'Manage recurring payments and payment dates beside subscriptions.',
      },
      {
        href: '/important-date-reminder-app',
        label: 'Important date reminder app',
        description: 'Use reminder timing for renewals, cancellation windows, and annual deadlines.',
      },
      {
        href: '/household-management-app',
        label: 'Household management app',
        description: 'See how subscriptions fit into a broader home-admin dashboard.',
      },
    ],
  },
  {
    slug: '/warranty-tracker',
    navLabel: 'Warranties',
    shortTitle: 'Warranty Tracker',
    seoTitle: 'Warranty Tracker for Receipts and Expiration Dates | Arcora',
    metaDescription:
      'Arcora is a warranty tracker for organizing product details, purchase dates, warranty expiration dates, receipts, notes, and reminders.',
    eyebrow: 'Coverage and expiration dates',
    heroTitle: 'Warranty tracker for purchase records, receipts, and expiration dates',
    heroDescription:
      'Keep product coverage, purchase details, receipt references, service notes, and warranty reminders ready before coverage expires or something breaks.',
    definition:
      'A warranty tracker helps you save product details, purchase dates, warranty duration, expiration dates, receipts, notes, and reminders so coverage is easier to find and review.',
    problem: {
      title: 'Warranty information is usually needed long after the purchase',
      description:
        'Receipts get buried, product names blur together, and expiration dates are rarely top of mind until an appliance, device, or household item needs support. Without a tracker, the coverage window can pass unnoticed.',
    },
    solution: {
      title: 'Arcora keeps coverage details and reminders in one record',
      description:
        'Arcora lets you save the product, purchase date, warranty duration, expiration date, provider, retailer, contact notes, receipt references, and reminders so warranty action is easier to prepare.',
    },
    heroPoints: [
      'Track warranty expiration dates for appliances, electronics, and household products',
      'Keep receipts, provider details, and service notes close to the product record',
      'Review approaching coverage deadlines before the window quietly closes',
    ],
    valueCards: [
      {
        title: 'Coverage timelines stay visible',
        description:
          'Save purchase and expiration dates so the coverage window can be reviewed instead of guessed.',
      },
      {
        title: 'Receipts are easier to recover',
        description:
          'Connect receipts, documents, and product notes to the warranty record before you need them for a claim or service request.',
      },
      {
        title: 'Household products get a paper trail',
        description:
          'Keep device, appliance, retailer, provider, and service details in one place for later follow-up.',
      },
    ],
    workflow: [
      {
        title: 'Save the product details',
        description:
          'Add the product name, purchase date, warranty duration, expiration date, retailer, provider, and notes.',
      },
      {
        title: 'Attach receipt context',
        description:
          'Keep the receipt, warranty card, service document, serial number notes, or provider contact details near the product record.',
      },
      {
        title: 'Review expiring warranties',
        description:
          'Use reminders and dashboard review to see which warranties are approaching expiration and may need inspection or action.',
      },
    ],
    useCases: [
      {
        title: 'Appliances and electronics',
        description:
          'Track refrigerators, routers, laptops, phones, monitors, printers, and other items where coverage matters after purchase.',
      },
      {
        title: 'Home office and work gear',
        description:
          'Keep coverage records for equipment you rely on, especially when receipts and service details may be needed later.',
      },
      {
        title: 'Family purchase records',
        description:
          'Create one organized place for product coverage instead of leaving details split between drawers, email, and memory.',
      },
    ],
    faqs: [
      {
        question: 'What is a warranty tracker?',
        answer:
          'A warranty tracker helps you organize product names, purchase dates, warranty length, expiration dates, receipts, provider details, notes, and reminders.',
      },
      {
        question: 'Can Arcora remind me before a warranty expires?',
        answer:
          'Yes. Arcora supports reminder timing so warranty expiration dates can surface before the final coverage date.',
      },
      {
        question: 'What should I save with a warranty record?',
        answer:
          'Useful details include the product name, purchase date, warranty duration, expiration date, retailer, provider, receipt, serial number notes, and service history.',
      },
      {
        question: 'How is this different from storing receipts in email?',
        answer:
          'Email can hold a receipt, but Arcora keeps the receipt connected to the product, expiration date, provider notes, and reminder workflow.',
      },
    ],
    relatedPages: [
      {
        href: '/personal-document-organizer',
        label: 'Personal document organizer',
        description: 'Keep receipts, warranty cards, and service files easier to retrieve.',
      },
      {
        href: '/important-date-reminder-app',
        label: 'Important date reminder app',
        description: 'Use reminders for coverage deadlines and follow-up dates.',
      },
      {
        href: '/household-management-app',
        label: 'Household management app',
        description: 'Connect warranties to the rest of your home-admin records.',
      },
    ],
  },
  {
    slug: '/personal-document-organizer',
    navLabel: 'Documents',
    shortTitle: 'Document Organizer',
    seoTitle: 'Personal Document Organizer for Household Records | Arcora',
    metaDescription:
      'Arcora is a personal document organizer for household records, bills, receipts, warranty files, reminders, detected dates, and supporting paperwork.',
    eyebrow: 'Records and paperwork',
    heroTitle: 'Personal document organizer for household records and important files',
    heroDescription:
      'Give bills, statements, receipts, warranty cards, password-related uploads, and other important files a place where dates, reminders, and context stay attached.',
    definition:
      'A personal document organizer helps you store important files with clear titles, categories, dates, notes, and related tasks so household paperwork is easier to find and maintain.',
    problem: {
      title: 'Important documents are hard to use when they live only as files',
      description:
        'A file folder can store a PDF, but it does not automatically explain why the document matters, what deadline it supports, or which bill, warranty, subscription, or reminder it belongs to.',
    },
    solution: {
      title: 'Arcora connects documents to the life admin around them',
      description:
        'Arcora supports uploaded document records with titles, sections, file metadata, detected dates, extracted text, notes, and links to related bills or reminders, so files can become part of a working admin system.',
    },
    heroPoints: [
      'Organize important household documents by purpose and section',
      'Connect documents to bills, warranties, subscriptions, reminders, or password-related uploads',
      'Use document context to make due dates and follow-up tasks easier to understand',
    ],
    valueCards: [
      {
        title: 'Files get useful labels',
        description:
          'Give documents clear titles, sections, dates, notes, and tags so they are easier to recognize later.',
      },
      {
        title: 'Dates can become actionable',
        description:
          'Document records can include detected dates and reminder context, helping important dates move out of static files.',
      },
      {
        title: 'Documents support the wider dashboard',
        description:
          'Statements, receipts, invoices, warranties, and notes can support bills, subscriptions, reminders, and household records.',
      },
    ],
    workflow: [
      {
        title: 'Upload or save the document',
        description:
          'Add the file with a clear title, section, document type, notes, and any dates or tags that help identify it later.',
      },
      {
        title: 'Review extracted context',
        description:
          'Use detected text, dates, and classification details as helpful context, then correct or refine the record when needed.',
      },
      {
        title: 'Connect the document to a task',
        description:
          'Link the document to a bill, warranty, reminder, or other record so the file is useful when action is required.',
      },
    ],
    useCases: [
      {
        title: 'Bills, statements, and invoices',
        description:
          'Keep payment documents close to the bill or reminder they support, especially when proof or amount details matter.',
      },
      {
        title: 'Receipts and warranty files',
        description:
          'Save purchase records, warranty cards, and service documents where coverage details can stay visible.',
      },
      {
        title: 'Household reference records',
        description:
          'Organize contracts, insurance documents, tax-adjacent files, reminder notes, and general paperwork in a clearer system.',
      },
    ],
    faqs: [
      {
        question: 'What is a personal document organizer?',
        answer:
          'A personal document organizer helps you store and categorize important files with titles, dates, notes, tags, and related tasks so they are easier to retrieve.',
      },
      {
        question: 'How is Arcora different from cloud storage?',
        answer:
          'Cloud storage mainly stores files. Arcora keeps documents connected to household-admin context like bills, reminders, warranties, subscriptions, and important dates.',
      },
      {
        question: 'What kinds of documents fit in Arcora?',
        answer:
          'Arcora is useful for statements, receipts, invoices, warranty records, contracts, reminder notes, password-related uploads, and other household admin files.',
      },
      {
        question: 'Can documents connect to reminders?',
        answer:
          'Yes. Document records can support reminders and related records so a file is easier to act on when a deadline or follow-up date matters.',
      },
    ],
    relatedPages: [
      {
        href: '/bill-reminder-app',
        label: 'Bill reminder app',
        description: 'Pair statements and invoices with due-date workflows.',
      },
      {
        href: '/warranty-tracker',
        label: 'Warranty tracker',
        description: 'Keep receipts and warranty files connected to coverage dates.',
      },
      {
        href: '/password-organizer',
        label: 'Password organizer',
        description: 'Organize password-related uploads and account access records with care.',
      },
    ],
  },
  {
    slug: '/important-date-reminder-app',
    navLabel: 'Reminders',
    shortTitle: 'Reminder App',
    seoTitle: 'Important Date Reminder App for Household Deadlines | Arcora',
    metaDescription:
      'Arcora is an important date reminder app for tracking bill due dates, subscription renewals, warranty expirations, document dates, and household deadlines.',
    eyebrow: 'Important dates and follow-through',
    heroTitle: 'Important date reminder app for bills, renewals, warranties, and deadlines',
    heroDescription:
      'Keep household deadlines visible with reminders that stay connected to the bill, subscription, warranty, document, or record they are actually about.',
    definition:
      'An important date reminder app helps you save deadlines, due dates, renewal dates, expiration dates, reminder timing, and related context so follow-up is easier.',
    problem: {
      title: 'Important dates lose meaning when the reminder has no context',
      description:
        'A notification that says "renewal due" or "call provider" is easy to ignore if the supporting bill, warranty, document, or account detail lives somewhere else.',
    },
    solution: {
      title: 'Arcora keeps reminders close to the record that explains them',
      description:
        'Arcora supports reminders tied to household admin records, including bills, subscriptions, warranties, documents, and general tasks. The reminder can carry timing, priority, status, and related context.',
    },
    heroPoints: [
      'Track due dates, renewals, expirations, and household follow-up tasks',
      'Use reminder timing that fits same-day tasks or earlier review windows',
      'Keep reminders connected to the record that explains the action',
    ],
    valueCards: [
      {
        title: 'Deadlines become easier to interpret',
        description:
          'Connect reminders to related records so the alert tells you what needs attention and why.',
      },
      {
        title: 'Lead time can match the task',
        description:
          'Use earlier reminder timing for renewals, warranties, and documents that need review before the final date.',
      },
      {
        title: 'Follow-through stays visible',
        description:
          'Review pending, completed, or snoozed reminders alongside the household records they support.',
      },
    ],
    workflow: [
      {
        title: 'Create or connect the item',
        description:
          'Start from a bill, subscription, warranty, document, or standalone reminder with a clear title and due date.',
      },
      {
        title: 'Choose timing and priority',
        description:
          'Set the reminder window, priority, category, recurrence, and status so the reminder reflects the actual task.',
      },
      {
        title: 'Review upcoming reminders',
        description:
          'Use the dashboard to see what is approaching, what is overdue, and which reminders need action or completion.',
      },
    ],
    useCases: [
      {
        title: 'Bills and payment due dates',
        description:
          'Keep payment dates visible with the bill details and supporting records needed to act.',
      },
      {
        title: 'Subscription and warranty deadlines',
        description:
          'Review renewals, cancellation windows, and warranty expirations before the final date arrives.',
      },
      {
        title: 'Document and household follow-up',
        description:
          'Use reminders for document expirations, record updates, calls, service appointments, and recurring household admin.',
      },
    ],
    faqs: [
      {
        question: 'What is an important date reminder app?',
        answer:
          'An important date reminder app helps you track due dates, renewals, expiration dates, deadlines, and follow-up tasks with reminder timing and context.',
      },
      {
        question: 'Can Arcora remind me about bills and renewals?',
        answer:
          'Yes. Arcora supports reminders for bills, subscriptions, warranties, documents, and general household admin deadlines.',
      },
      {
        question: 'How is Arcora different from a phone reminder?',
        answer:
          'A phone reminder is often isolated. Arcora keeps the reminder close to the bill, subscription, warranty, document, or record that explains the task.',
      },
      {
        question: 'Can I use recurring reminders?',
        answer:
          'Arcora supports recurring reminder patterns for tasks that repeat, along with status and priority details for follow-through.',
      },
    ],
    relatedPages: [
      {
        href: '/bill-reminder-app',
        label: 'Bill reminder app',
        description: 'Use reminders in the context of payment due dates.',
      },
      {
        href: '/subscription-tracker',
        label: 'Subscription tracker',
        description: 'Track renewal reminders before recurring charges land.',
      },
      {
        href: '/warranty-tracker',
        label: 'Warranty tracker',
        description: 'Use reminders for warranty expirations and coverage reviews.',
      },
    ],
  },
  {
    slug: '/password-organizer',
    navLabel: 'Passwords',
    shortTitle: 'Password Organizer',
    seoTitle: 'Password Organizer for Household Account Records | Arcora',
    metaDescription:
      'Arcora is a password organizer for saving household account records, encrypted password values, recovery files, linked websites, and review reminders.',
    eyebrow: 'Account access records',
    heroTitle: 'Password organizer for household account records and recovery files',
    heroDescription:
      'Keep important logins, linked websites, password-related documents, and recovery notes closer to the rest of your household admin without making unsupported security promises.',
    definition:
      'A password organizer helps you save account names, usernames, linked websites, password records, strength labels, recovery files, and notes so important access details are easier to review.',
    problem: {
      title: 'Account access details get risky when they are scattered',
      description:
        'Households often keep logins in memory, browser saves, shared messages, old exports, or loose documents. That makes it harder to know what exists, which accounts need review, and where recovery material lives.',
    },
    solution: {
      title: 'Arcora keeps password records and recovery material in the life admin dashboard',
      description:
        'Arcora supports saved password records, linked websites, password strength labels, password-related uploads, and local reveal/copy actions that require a session master key entered by the user.',
    },
    heroPoints: [
      'Organize service names, usernames, linked websites, and password categories',
      'Save password values encrypted before storage and reveal them with a session master key',
      'Keep recovery files and password-related uploads visible beside other household records',
    ],
    valueCards: [
      {
        title: 'Account records become easier to audit',
        description:
          'Track which services exist, which have linked websites, and which records may need a stronger password or cleanup.',
      },
      {
        title: 'Reveal actions stay intentional',
        description:
          'Arcora requires a session master key to reveal or copy saved password values, helping reduce casual exposure inside the app.',
      },
      {
        title: 'Recovery material has a place',
        description:
          'Password-related uploads, recovery notes, and account documents can live near the account records they support.',
      },
    ],
    workflow: [
      {
        title: 'Add the account record',
        description:
          'Save the service name, username, website, category, password value, and any useful account notes.',
      },
      {
        title: 'Use a master key for reveal actions',
        description:
          'Enter the session master key when you need to reveal or copy a saved password value, then clear it when finished.',
      },
      {
        title: 'Review account health',
        description:
          'Use strength labels, linked websites, recovery files, and update dates to decide which accounts need attention.',
      },
    ],
    useCases: [
      {
        title: 'Household utility and service logins',
        description:
          'Keep access details for utilities, insurance, subscriptions, and service providers closer to the records they affect.',
      },
      {
        title: 'Recovery files and exports',
        description:
          'Store password-related uploads or recovery documents in the same organized workspace as the account record.',
      },
      {
        title: 'Personal access review',
        description:
          'Review weak or old credentials, linked sites, account categories, and password-related files during routine life admin cleanup.',
      },
    ],
    faqs: [
      {
        question: 'What is a password organizer?',
        answer:
          'A password organizer helps you store and review account names, usernames, websites, password records, categories, recovery files, notes, and strength information.',
      },
      {
        question: 'How does Arcora handle saved password values?',
        answer:
          'Arcora encrypts saved password values before storage and requires the user-entered session master key to reveal or copy them in the app.',
      },
      {
        question: 'Is Arcora a replacement for every dedicated password manager?',
        answer:
          'Arcora is best understood as a password organizer inside a broader life admin dashboard. It helps organize account records, encrypted saved password values, linked websites, and recovery files.',
      },
      {
        question: 'Can I store password-related documents?',
        answer:
          'Yes. Arcora supports password-related uploads such as recovery files or exports, and those files can stay visible beside password records.',
      },
    ],
    relatedPages: [
      {
        href: '/security',
        label: 'Security overview',
        description: 'Read how Arcora describes account access, document storage, and password handling.',
      },
      {
        href: '/personal-document-organizer',
        label: 'Personal document organizer',
        description: 'Organize password-related uploads and other important household files.',
      },
      {
        href: '/household-management-app',
        label: 'Household management app',
        description: 'See how password records fit into broader life admin.',
      },
    ],
  },
  {
    slug: '/household-management-app',
    navLabel: 'Home admin',
    shortTitle: 'Household Management App',
    seoTitle: 'Household Management App for Life Admin | Arcora',
    metaDescription:
      'Arcora is a household management app for organizing bills, subscriptions, warranties, documents, passwords, reminders, and household records.',
    eyebrow: 'Whole-system home admin',
    heroTitle: 'Household management app for bills, documents, reminders, and records',
    heroDescription:
      'Bring recurring payments, renewal dates, coverage records, important documents, password records, and reminders into one life admin dashboard built for regular review.',
    definition:
      'A household management app helps organize the records, deadlines, reminders, files, and recurring responsibilities that keep home admin from spreading across too many tools.',
    problem: {
      title: 'Home admin breaks down when every responsibility has its own hiding place',
      description:
        'Bills, subscriptions, warranties, documents, passwords, reminders, and household notes often live in separate apps. The friction comes from switching tools and rebuilding context when something needs action.',
    },
    solution: {
      title: 'Arcora works as the review layer for household life admin',
      description:
        'Arcora brings the main household admin modules into one workspace, so bills, renewals, documents, password records, warranties, and reminders can be reviewed together instead of as isolated lists.',
    },
    heroPoints: [
      'Organize bills, subscriptions, warranties, documents, passwords, and reminders',
      'Reduce context switching between due dates, files, account records, and notes',
      'Build a repeatable review habit for the records that keep daily life running',
    ],
    valueCards: [
      {
        title: 'One dashboard connects the major record types',
        description:
          'Review payments, renewals, documents, warranties, password records, and reminders from the same home-admin system.',
      },
      {
        title: 'Context stays close to action',
        description:
          'Keep records, documents, dates, notes, and reminders near the task they support so follow-through is easier.',
      },
      {
        title: 'The system can grow gradually',
        description:
          'Start with the category causing the most friction, then add other modules as your household admin routine becomes clearer.',
      },
    ],
    workflow: [
      {
        title: 'Start with the highest-friction category',
        description:
          'Add the bills, documents, subscriptions, warranties, password records, or reminders that currently cause the most searching.',
      },
      {
        title: 'Connect dates and supporting records',
        description:
          'Add due dates, renewal dates, expiration dates, notes, files, and reminders where they clarify the next action.',
      },
      {
        title: 'Review the dashboard regularly',
        description:
          'Use Arcora as a weekly or monthly review layer for upcoming deadlines, active records, and household follow-up tasks.',
      },
    ],
    useCases: [
      {
        title: 'Busy households',
        description:
          'Keep family paperwork, recurring payments, renewals, reminders, and account records from spreading across too many places.',
      },
      {
        title: 'Solo professionals',
        description:
          'Use one calm admin dashboard for personal obligations, work-adjacent subscriptions, documents, and recurring reminders.',
      },
      {
        title: 'Digital cleanup projects',
        description:
          'Move from scattered folders, inbox searches, and ad-hoc notes into a more intentional life admin system.',
      },
    ],
    faqs: [
      {
        question: 'What is a household management app?',
        answer:
          'A household management app helps organize home-admin records such as bills, subscriptions, warranties, documents, passwords, reminders, and important dates.',
      },
      {
        question: 'Is Arcora a task manager?',
        answer:
          'Arcora is more specific than a general task manager. It focuses on life admin records, deadlines, reminders, documents, and the context behind household follow-through.',
      },
      {
        question: 'What should I organize first in Arcora?',
        answer:
          'Start with the area that creates the most friction, such as bills, subscriptions, warranties, documents, passwords, or recurring reminders.',
      },
      {
        question: 'Who is Arcora best for?',
        answer:
          'Arcora is useful for households, busy individuals, solo professionals, family organizers, and anyone trying to reduce scattered life admin.',
      },
    ],
    relatedPages: [
      {
        href: '/bill-reminder-app',
        label: 'Bill reminder app',
        description: 'Track due dates and payment records inside the broader home-admin system.',
      },
      {
        href: '/personal-document-organizer',
        label: 'Personal document organizer',
        description: 'Keep the documents behind household admin easier to retrieve.',
      },
      {
        href: '/password-organizer',
        label: 'Password organizer',
        description: 'Organize account records and recovery files alongside the rest of life admin.',
      },
    ],
  },
];

export const marketingPageMap = Object.fromEntries(
  marketingPages.map((page) => [page.slug, page]),
) as Record<string, MarketingPageData>;

export const publicSitePaths = [
  '/',
  ...marketingPages.map((page) => page.slug),
  '/security',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
];

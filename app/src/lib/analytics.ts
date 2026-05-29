import type { Analytics } from 'firebase/analytics';

type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

const placeholderFragments = [
  'your_',
  'your-',
  'your ',
  'placeholder',
  'replace',
  'change-me',
  'changeme',
  'todo',
  '<',
  '>',
];

const isConfiguredValue = (value: unknown) => {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.toLowerCase();

  return (
    trimmedValue.length > 0 &&
    !placeholderFragments.some((fragment) => normalizedValue.includes(fragment))
  );
};

const hasFirebaseAnalyticsConfig = () => [
  import.meta.env.VITE_FIREBASE_API_KEY,
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  import.meta.env.VITE_FIREBASE_APP_ID,
].every(isConfiguredValue);

let analyticsPromise: Promise<Analytics | null> | null = null;

export const getArcoraAnalytics = async () => {
  if (
    typeof window === 'undefined' ||
    import.meta.env.VITE_ENABLE_FIREBASE_ANALYTICS !== 'true' ||
    !hasFirebaseAnalyticsConfig()
  ) {
    return null;
  }

  analyticsPromise ??= Promise.all([
    import('firebase/analytics'),
    import('@/lib/firebase'),
  ])
    .then(async ([analyticsModule, firebaseModule]) => {
      if (!(await analyticsModule.isSupported())) {
        return null;
      }

      return analyticsModule.getAnalytics(firebaseModule.app);
    })
    .catch((error) => {
      console.warn('Firebase Analytics is unavailable.', error);
      return null;
    });

  return analyticsPromise;
};

export const trackEvent = async (
  eventName: string,
  params?: AnalyticsEventParams,
) => {
  const analytics = await getArcoraAnalytics();

  if (!analytics) {
    return;
  }

  const { logEvent } = await import('firebase/analytics');
  logEvent(analytics, eventName, params);
};

export const trackPageView = async (
  path = typeof window !== 'undefined' ? window.location.pathname : '/',
  title = typeof document !== 'undefined' ? document.title : undefined,
) => {
  await trackEvent('page_view', {
    page_path: path,
    page_title: title,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
  });
};

import { useEffect } from 'react';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  absoluteUrl,
  createBreadcrumbSchema,
  type Breadcrumb,
  type JsonLd,
} from '@/lib/seo';

type SEOHeadProps = {
  title?: string;
  description?: string;
  path?: string;
  robots?: string;
  ogType?: 'website' | 'article';
  image?: string;
  schemas?: JsonLd[];
  breadcrumbs?: Breadcrumb[];
};

const ensureMetaTag = (attribute: 'name' | 'property', value: string) => {
  const selector = `meta[${attribute}="${value}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  return element;
};

const ensureCanonicalLink = () => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }

  return element;
};

export const SEOHead = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path,
  robots = 'index,follow',
  ogType = 'website',
  image = DEFAULT_OG_IMAGE,
  schemas = [],
  breadcrumbs = [],
}: SEOHeadProps) => {
  useEffect(() => {
    const currentPath = path ?? window.location.pathname;
    const canonicalUrl = absoluteUrl(currentPath);
    const pageSchemas = [...schemas];

    if (breadcrumbs.length > 0) {
      pageSchemas.push(createBreadcrumbSchema(breadcrumbs));
    }

    document.title = title;

    ensureMetaTag('name', 'description').content = description;
    ensureMetaTag('name', 'robots').content = robots;
    ensureMetaTag('property', 'og:title').content = title;
    ensureMetaTag('property', 'og:description').content = description;
    ensureMetaTag('property', 'og:type').content = ogType;
    ensureMetaTag('property', 'og:url').content = canonicalUrl;
    ensureMetaTag('property', 'og:site_name').content = SITE_NAME;
    ensureMetaTag('property', 'og:image').content = image;
    ensureMetaTag('name', 'twitter:card').content = 'summary_large_image';
    ensureMetaTag('name', 'twitter:title').content = title;
    ensureMetaTag('name', 'twitter:description').content = description;
    ensureMetaTag('name', 'twitter:image').content = image;
    ensureCanonicalLink().href = canonicalUrl;

    document.head
      .querySelectorAll('script[data-arcora-schema="true"]')
      .forEach((script) => script.remove());

    pageSchemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.arcoraSchema = 'true';
      script.dataset.arcoraSchemaIndex = `${index}`;
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.head
        .querySelectorAll('script[data-arcora-schema="true"]')
        .forEach((script) => script.remove());
    };
  }, [breadcrumbs, description, image, ogType, path, robots, schemas, title]);

  return null;
};

import { useEffect } from 'react';
import { Language, SiteSettings } from '../types/cms';

interface SeoOptions {
  title?: string;
  description?: string;
  lang: Language;
  settings?: SiteSettings | null;
}

export function useDocumentSeo({ title, description, lang, settings }: SeoOptions) {
  useEffect(() => {
    const defaultTitle =
      lang === 'ar'
        ? settings?.seoTitleAr || 'HCC – Concept Ecosystem | شركة محمد حسن حلاوة وشركاؤه'
        : settings?.seoTitleEn || 'HCC – Concept Ecosystem | Halawa Consultancy Co.';

    const defaultDesc =
      lang === 'ar'
        ? settings?.seoDescriptionAr ||
          'بيت الخبرة للاستشارات الإدارية، ISO 9001، هندسة التعافي الاقتصادي، حاضنة الأعمال Concept Hub، وخدمات التعهيد عن بُعد.'
        : settings?.seoDescriptionEn ||
          'Corporate consulting, ISO 9001 quality systems, economic recovery engineering, venture building, and remote BPO teams.';

    const resolvedTitle = title ? `${title} | HCC – Concept Ecosystem` : defaultTitle;
    const resolvedDesc = description || defaultDesc;

    document.title = resolvedTitle;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    const updateMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };

    updateMeta('meta[name="description"]', resolvedDesc);
    updateMeta('meta[property="og:title"]', resolvedTitle);
    updateMeta('meta[property="og:description"]', resolvedDesc);
    updateMeta('meta[name="twitter:title"]', resolvedTitle);
    updateMeta('meta[name="twitter:description"]', resolvedDesc);

    const canonicalHref = window.location.origin + window.location.pathname;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;
  }, [title, description, lang, settings]);
}

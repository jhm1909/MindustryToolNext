'use client';

import { use, useCallback } from 'react';

import { useLocaleStore } from '@/zustand/locale-store';
import useClientApi from '@/hooks/use-client';
import { Locale, locales, TranslateFunction } from '@/i18n/config';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { unstable_cache } from 'next/cache';
import axiosInstance from '@/query/config/config';

const EMPTY = {};

const getCachedTranslation = unstable_cache(
  (group: string, language: string) =>
    axiosInstance
      .get('/translations', {
        params: {
          group,
          language,
        },
      })
      .then(({ data }) => data),
  ['translations'],
  { revalidate: 600 },
);

export function useI18n(): TranslateFunction {
  const { isCurrentLocaleSet, currentLocale, translation, setTranslation } = useLocaleStore();
  const axios = useClientApi();

  if (translation[currentLocale] === undefined) {
    translation[currentLocale] = {};
  }

  const keys = translation[currentLocale];

  const t = useCallback(
    (text: string, args?: Record<string, string>) => {
      if (!text) {
        throw new Error('Bad key');
      }

      const parts = text.split('.');

      if (parts.length === 0) {
        throw new Error('Bad key');
      }

      const group = parts.length === 1 ? 'common' : parts[0];
      const key = parts.length === 1 ? parts[0] : parts[1];

      text = `${group}.${key}`;

      const value = keys[group];

      if (value === undefined) {
        try {
          keys[group] = JSON.parse(localStorage.getItem(`${currentLocale}.translation.${group}`) || '{}');
        } catch (e) {
          keys[group] = EMPTY;
        }

        if (!isCurrentLocaleSet) {
          return key;
        }

        axios
          .get('/translations', {
            params: {
              group,
              language: currentLocale,
            },
          })
          .then((result) => {
            if (result.data) {
              setTranslation({ [group]: result.data });
              localStorage.setItem(`${currentLocale}.translation.${group}`, JSON.stringify(result.data));
            }
          })
          .catch((err) => console.error(err));
      }

      if (!value || Object.keys(value).length === 0) {
        return key;
      }

      const translated = value[key];

      if (!translated) {
        console.warn(`Missing key: ${text}`);
        return key;
      }

      return formatTranslation(translated, args) || key;
    },
    [keys, isCurrentLocaleSet, axios, currentLocale, setTranslation],
  );

  if (typeof window === 'undefined') {
    return (text: string, args?: Record<string, string>) => {
      if (!text) {
        throw new Error('Bad key');
      }

      const parts = text.split('.');

      if (parts.length === 0) {
        throw new Error('Bad key');
      }

      const group = parts.length === 1 ? 'common' : parts[0];
      const key = parts.length === 1 ? parts[0] : parts[1];

      text = `${group}.${key}`;

      try {
        const data = getCachedTranslation(group, currentLocale);
        const translated = use(data)[key];
        return formatTranslation(translated, args) || key;
      } catch (err) {
        return key;
      }
    };
  }

  return t;
}

export function formatTranslation(text: string, args?: Record<string, string>) {
  if (!args || !text) {
    return text;
  }

  Object.entries(args).forEach(([key, value]) => {
    text = text.replace(`{${key}}`, value);
  });

  return text;
}

export function useChangeLocale() {
  const [_, setCookie] = useCookies();
  const { setCurrentLocale } = useLocaleStore();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();

  return (locale: Locale) => {
    const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

    const url = pathnameHasLocale ? `/${locale}/${pathname.slice(4)}` : `/${locale}${pathname}`;

    setCurrentLocale(locale);
    setCookie('Locale', locale, { path: '/' });

    router.push(`${url}?${new URLSearchParams(params).toString()}`);
  };
}

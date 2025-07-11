import { createInstance } from 'i18next';
import { InitOptions } from 'i18next';
import HttpApi, { HttpBackendOptions } from 'i18next-http-backend';
import { cache } from 'react';

import env from '@/constant/env';
import { Locale, defaultLocale, defaultNamespace, locales } from '@/i18n/config';
import { withRetry } from '@/lib/utils';

import { initReactI18next } from 'react-i18next/initReactI18next';

const getTranslationCached = cache(async (url: string) => {
	try {
		return await withRetry(async () => {
			const res = await fetch(url, {
				headers: {
					Server: 'true',
				},
				cache: 'force-cache',
				next: {
					revalidate: 3600,
					tags: ['translations'],
				},
				signal: AbortSignal.timeout(2000),
			});

			if (!res.ok) {
				const bodyText = await res.text();
				let bodyJson;
				try {
					bodyJson = JSON.parse(bodyText);
				} catch {
					bodyJson = { message: bodyText };
				}

				throw new Error(
					JSON.stringify({
						error: true,
						status: res.status,
						statusText: res.statusText,
						url,
						body: bodyJson,
					}),
				);
			}

			return await res.json();
		}, 3);
	} catch (error) {
		console.error('Fail to fetch server translation: ' + url + ' ' + error);
		return Promise.reject(error);
	}
});

const createMissingTranslation = async (url: string, body: any) => {
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'force-cache',
		next: {
			revalidate: 3600,
			tags: ['translations'],
		},
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(5000),
	});

	if (!res.ok) throw new Error('Server: fail to create missing translation: ' + (await res.text()));
	const result = await res.json();
	return { status: res.status, data: result.data };
};

export function getServerOptions(lng = defaultLocale, ns = defaultNamespace) {
	const options: InitOptions<HttpBackendOptions> = {
		// debug: process.env.NODE_ENV === 'development',
		supportedLngs: locales,
		lng,
		saveMissing: true,
		interpolation: {
			escapeValue: false,
		},
		fallbackLng: defaultLocale,
		fallbackNS: defaultNamespace,
		defaultNS: defaultNamespace,
		ns,
		backend: {
			loadPath: `${env.url.api}/translations/{{lng}}/{{ns}}?v=2`,
			addPath: `${env.url.api}/translations/{{lng}}/{{ns}}/create-missing`,
			request(options, url, payload, callback) {
				try {
					if (url.includes('create-missing')) {
						withRetry(() => createMissingTranslation(url, payload), 3)
							.then((data) => callback(null, data))
							.catch((error) => {
								console.error('Server: fail to crease missing translation: ' + url + ' ' + error);
								callback(error, undefined);
							});
					} else {
						getTranslationCached(url)
							.then((result) => callback(undefined, { status: 200, data: result }))
							.catch((error) => callback(error, undefined));
					}
				} catch (error) {
					if (error instanceof Error) {
						const cause = (error as any).cause;
						if (cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
							console.error('Connection timed out: ' + url);
						} else {
							console.error('Fetch error: ' + url, error.message);
						}
					} else {
						console.error('Unknown error: ' + url, error);
					}
				}
			},
		},
	};

	return options;
}

const initI18next = async (language: Locale, namespace?: string | string[]) => {
	const i18nInstance = createInstance();
	await i18nInstance.use(initReactI18next).use(HttpApi).init<HttpBackendOptions>(getServerOptions(language, namespace));

	return i18nInstance;
};

export const getTranslation = async (
	locale: Locale,
	namespace: string | string[] = 'common',
	options: { keyPrefix?: string } = {},
) => {
	const language = locales.includes(locale as any) ? locale : defaultLocale;
	namespace = Array.isArray(namespace) ? namespace.map((n) => n.toLowerCase()) : namespace.toLowerCase();

	const i18nextInstance = await initI18next(language, namespace);
	const t = i18nextInstance.getFixedT(language, namespace, options.keyPrefix);

	return {
		t: (key: string, options?: any) => t(key.toLowerCase(), options) as string,
		i18n: i18nextInstance,
	};
};

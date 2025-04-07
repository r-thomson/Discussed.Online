import { type Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

export interface RequestSettings {
	reddit: 'reddit.com' | 'old.reddit.com';
	hackerNews: 'news.ycombinator.com' | 'hackerneue.com';
}

declare module 'hono' {
	interface ContextVariableMap {
		settings: RequestSettings;
	}
}

export const DEFAULT_SETTINGS: RequestSettings = {
	reddit: 'reddit.com',
	hackerNews: 'news.ycombinator.com',
};

export const SETTINGS_COOKIE = 'settings';
export const MAX_COOKIE_AGE = 60 * 60 * 24 * 400;

export const settingsMiddleware = createMiddleware(async (c, next) => {
	const cookie = getCookie(c, SETTINGS_COOKIE) ?? '';
	const settings = parseSettingsCookie(cookie);

	c.set('settings', { ...DEFAULT_SETTINGS, ...settings });

	// Refresh cookie expiration
	if (c.req.method === 'GET') {
		setSettingsCookie(c, settings);
	}

	await next();
});

export function parseSettingsCookie(cookie: string): Partial<RequestSettings> {
	const settings: Partial<RequestSettings> = {};

	const params = new URLSearchParams(cookie ?? '');

	switch (params.get('reddit')) {
		case 'reddit.com':
			settings.reddit = 'reddit.com';
			break;
		case 'old.reddit.com':
			settings.reddit = 'old.reddit.com';
			break;
	}

	switch (params.get('hackerNews')) {
		case 'news.ycombinator.com':
			settings.hackerNews = 'news.ycombinator.com';
			break;
		case 'hackerneue.com':
			settings.hackerNews = 'hackerneue.com';
			break;
	}

	return settings;
}

export function unparseSettingsCookie(
	settings: Partial<RequestSettings>,
): string {
	const params = new URLSearchParams(settings);
	return params.toString();
}

export function setSettingsCookie(
	c: Context,
	settings: Partial<RequestSettings>,
) {
	setCookie(c, SETTINGS_COOKIE, unparseSettingsCookie(settings), {
		maxAge: MAX_COOKIE_AGE,
	});
	c.set('settings', { ...DEFAULT_SETTINGS, ...settings });
}

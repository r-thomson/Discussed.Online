import { sentry } from '@sentry/hono/deno';
import type { Hono } from 'hono';

const SENTRY_DSN = Deno.env.get('SENTRY_DSN') ?? '';

export function initSentry(app: Hono) {
	if (!SENTRY_DSN) return;

	app.use(
		sentry(app, {
			dsn: SENTRY_DSN,
			sendDefaultPii: true,
			tracesSampleRate: 1.0,
			enableLogs: true,
		}),
	);

	console.log('Sentry SDK initialized');
}

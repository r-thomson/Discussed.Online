import { consoleLoggingIntegration, sentry } from '@sentry/hono/deno';
import type { Hono } from 'hono';

const SENTRY_DSN = Deno.env.get('SENTRY_DSN') ?? '';

export function initSentry(app: Hono) {
	if (!SENTRY_DSN) return;

	app.use(
		sentry(app, {
			dsn: SENTRY_DSN,
			integrations: [
				consoleLoggingIntegration(),
			],
			tracesSampleRate: 1.0,
			ignoreTransactions: [/^[A-Z]+ \/healthz$/],
			enableLogs: true,
		}),
	);

	console.log('Sentry SDK initialized');
}

import * as Sentry from '@sentry/deno';

const SENTRY_DSN = Deno.env.get('SENTRY_DSN') ?? '';

if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN,
		sendDefaultPii: true,
		enableLogs: true,
	});
}

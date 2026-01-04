import { createMiddleware } from 'hono/factory';
import { routePath } from 'hono/route';
import * as Sentry from '@sentry/deno';

export const sentryMiddleware = createMiddleware(async (c, next) => {
	const sentry = Sentry.getClient();

	if (sentry) {
		await Sentry.startSpan({
			name: routePath(c, -1),
			op: 'http.server',
		}, next);
	} else {
		await next();
	}

	if (c.error) {
		sentry?.captureException(c.error);
	}
});

import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { logger } from 'hono/logger';
import { TrieRouter } from 'hono/router/trie-router';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { serveAssets } from './assets.ts';
import Document from './components/Document.tsx';
import { Error404, Error500 } from './components/errors.tsx';
import { settingsMiddleware } from './middleware/settings.ts';
import healthz from './routes/healthz.ts';
import index from './routes/index.ts';
import settings from './routes/settings.ts';

const app = new Hono({
	router: new TrieRouter(),
});

app.use(logger());
app.use(trimTrailingSlash());
app.use(jsxRenderer(Document));
app.use(settingsMiddleware);

app.notFound(async (c) => {
	c.status(404);
	return c.render(Error404());
});

app.onError(async (err, c) => {
	console.error(err);

	c.status(500);
	return c.render(Error500());
});

app.route('/', index);
app.route('/settings', settings);
app.get('/styles/*', serveAssets);
app.route('/healthz', healthz);

export default app;

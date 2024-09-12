import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { logger } from 'hono/logger';
import { TrieRouter } from 'hono/router/trie-router';
import Document from './components/Document.tsx';
import { serveAssets } from './assets.ts';
import healthz from './routes/healthz.ts';
import index from './routes/index.tsx';

const app = new Hono({
	router: new TrieRouter(),
});

app.use(logger());
app.use(jsxRenderer(Document));

app.route('/', index);
app.get('/styles/*', serveAssets);
app.route('/healthz', healthz);

export default app;

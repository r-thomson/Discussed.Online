import { getDiscussions } from './discussions.ts';
import { jsxRenderer } from 'hono/jsx-renderer';
import { logger } from 'hono/logger';
import { postcssMiddleware } from './styles/postcss.ts';
import { serveStatic } from 'hono/deno';
import { TrieRouter } from 'hono/router/trie-router';
import { type Context, Hono } from 'hono';
import Document from './components/Document.tsx';
import { UrlForm } from './components/UrlForm.tsx';
import { pluralize } from './utils.ts';
import { DiscussionItem } from './components/DiscussionItem.tsx';

const app = new Hono({
	router: new TrieRouter(),
});

app.use(logger());

app.use(jsxRenderer(Document));

// Unfortunately /styles/*.css does not work
app.use(
	'/styles/:_{.+\\.css}',
	postcssMiddleware,
	serveStatic({ root: './src/' }),
);

app.get('/', async (c: Context) => {
	let url;
	try {
		url = new URL(c.req.query('url') ?? '');
	} catch {
		return c.render(
			<div class='min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 py-32 flex flex-col px-4 sm:px-8 py-4 justify-center items-center'>
				<h1 class='pb-12 text-4xl sm:text-6xl font-semibold text-center whitespace-nowrap text-gray-800'>
					Discussed.Online
				</h1>
				<div class='w-full max-w-2xl pb-20'>
					<UrlForm />
				</div>
			</div>,
		);
	}

	const discussions = await getDiscussions(url);

	return c.render(
		<>
			<header class='flex flex-col items-center px-4 sm:px-8 pt-12 pb-8 bg-gradient-to-b from-slate-50 to-slate-200'>
				<h1 class='mb-6 text-4xl font-semibold text-center whitespace-nowrap text-gray-800'>
					<a href='/'>
						Discussed.Online
					</a>
				</h1>
				<div class='max-w-2xl w-full'>
					<UrlForm value={url.toString()} />
				</div>
			</header>
			<main class='max-w-4xl mx-auto px-4 sm:px-8 py-4'>
				<p class='pb-4 text-sm text-center truncate'>
					{discussions.length}{' '}
					{pluralize(discussions.length, 'discussion', 'discussions')}
					{' for '}
					<a href={url.href} class='underline'>
						<strong>
							{url.hostname}
							{url.pathname}
							{url.search}
						</strong>
					</a>:
				</p>
				<ul class='divide-y divide-gray-200 '>
					{discussions.map((d) => (
						<li class='py-2'>
							<DiscussionItem discussion={d} />
						</li>
					))}
				</ul>
			</main>
		</>,
	);
});

app.get(
	'/:url{https?://[a-zA-Z0-9:.@-]+\\.[a-zA-Z0-9]+\\b.*}',
	(c: Context) => {
		const reqUrl = new URL(c.req.url);
		const params = new URLSearchParams();
		params.set('url', reqUrl.pathname.slice(1) + reqUrl.search);
		return c.redirect('/?' + params.toString());
	},
);

app.get('/healthz', (c: Context) => {
	return c.text("Damn... I'm looking good!");
});

export default app;

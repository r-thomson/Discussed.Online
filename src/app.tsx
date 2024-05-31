import { getDiscussions } from './discussions.ts';
import { jsxRenderer } from 'hono/jsx-renderer';
import { logger } from 'hono/logger';
import { postcssMiddleware } from './styles/postcss.ts';
import { serveStatic } from 'hono/deno';
import { TrieRouter } from 'hono/router/trie-router';
import { type Context, Hono } from 'hono';
import Document from './Document.tsx';

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
			<>
				<h1>Discussed.Online</h1>
				<form action='/'>
					<input
						type='url'
						name='url'
						placeholder='Paste a URL here&hellip;'
						size={60}
					/>
					<button type='submit'>Go!</button>
				</form>
			</>,
		);
	}

	const discussions = await getDiscussions(url);

	return c.render(
		<>
			<h1>Discussed.Online</h1>
			<p>
				Discussions for <b>{url.toString()}</b>:
			</p>
			<ul>
				{discussions.map((d) => (
					<li style='margin-bottom: 6px;'>
						<a href={d.url}>
							{d.title}
							<br />
							{d.numComments} comments on {d.siteName} ({d.score}
							{' '}
							points)
						</a>
					</li>
				))}
			</ul>
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

export default app;

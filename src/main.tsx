/** @jsx jsx */
/** @jsxFrag Fragment */

import { type Context, Hono, TrieRouter } from 'hono/mod.ts';
import { getDiscussions } from './discussions.ts';
import { Fragment, jsx, jsxRenderer, logger } from 'hono/middleware.ts';

const app = new Hono({
	router: new TrieRouter(),
});

app.use(logger());

app.use(jsxRenderer(({ children }) => (
	<html lang='en-US'>
		<head>
			<meta charset='utf-8' />
			<meta
				name='viewport'
				content='width=device-width,initial-scale=1'
			/>
			<meta name='color-scheme' content='light dark' />
			<title>discussed.online</title>
		</head>
		<body>
			{children}
		</body>
	</html>
)));

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

Deno.serve(app.fetch);

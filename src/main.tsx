/** @jsx jsx */
import { type Context, Hono, TrieRouter } from 'hono/mod.ts';
import { getDiscussions } from './discussions.ts';
import { html } from 'hono/helper.ts';
import { jsx } from 'hono/middleware.ts';

const app = new Hono({
	router: new TrieRouter(),
});

app.get('/', async (c: Context) => {
	let url;
	try {
		url = new URL(c.req.query('url') ?? '');
	} catch {
		return c.html(
			<Document>
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
			</Document>,
		);
	}

	const discussions = await getDiscussions(url);

	return c.html(
		<Document>
			<h1>Discussed.Online</h1>
			<p>
				Discussions for <b>{url}</b>:
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
		</Document>,
	);
});

Deno.serve(app.fetch);

const Document = (props: { children?: unknown }) =>
	html`
	<!doctype html>
	<html lang="en-US">
	<head>
		<meta charset="utf-8">
		<meta content="width=device-width,initial-scale=1" name="viewport">
		<meta name="color-scheme" content="light dark">
		<title>discussed.online</title>
	</head>
	<body>
		${props.children}
	</body>
	</html>
	`;

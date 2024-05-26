import { type Context, Hono, TrieRouter } from 'hono/mod.ts';
import { type Discussion, getDiscussions } from './discussions.ts';

const app = new Hono({
	router: new TrieRouter(),
});

app.get('/', async (c: Context) => {
	let url;
	try {
		url = new URL(c.req.query('url') ?? '');
	} catch {
		return c.html(renderIndex());
	}

	const results = await getDiscussions(url);

	return c.html(renderResults(url.toString(), results));
});

Deno.serve(app.fetch);

function renderIndex(): string {
	return `
	<!doctype html>
	<html lang="en-US">
	<head>
		<meta charset="utf-8">
		<meta content="width=device-width,initial-scale=1" name="viewport">
		<meta name="color-scheme" content="light dark">
		<title>discussed.online</title>
	</head>
	<body>
		<h1>Discussed.Online</h1>
		<form action="/">
		<input type="url" name="url" placeholder="Paste a URL here&hellip;" size="60">
		<button type="submit">Go!</button>
		</form>
	</body>
	</html>
	`;
}

function renderResults(url: string, discussions: Discussion[]): string {
	return `
	<!doctype html>
	<html lang="en-US">
	<head>
		<meta charset="utf-8">
		<meta content="width=device-width,initial-scale=1" name="viewport">
		<meta name="color-scheme" content="light dark">
		<title>discussed.online</title>
	</head>
	<body>
		<h1>Discussed.Online</h1>
		<p>Discussions for <b>${url}</b>:</p>
		<ul>
	${
		discussions.map((d) =>
			`<li style="margin-bottom: 6px;">
				<a href="${d.url}">
					${d.title}
					<br>
					${d.numComments} comments on ${d.siteName} (${d.score} points)
				</a>
			</li>`
		).join('')
	}
		</ul>
	</body>
	</html>`;
}

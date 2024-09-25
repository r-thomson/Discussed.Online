import { type Context, Hono } from 'hono';
import * as discussionSites from '../discussions/sites.ts';
import { matchUrl } from '../discussions/url_match.ts';
import { HomePage } from '../components/HomePage.tsx';
import { ResultsPage } from '../components/ResultsPage.tsx';

const app = new Hono();

app.get('/', (c) => {
	let url;
	try {
		url = new URL(c.req.query('url') ?? '');
	} catch {
		return c.render(HomePage());
	}

	return renderDiscussions(url, c);
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

async function renderDiscussions(url: URL, c: Context) {
	const match = matchUrl(url);

	const results = await Promise.allSettled(
		Object.values(discussionSites).map((discussionSite) =>
			discussionSite.getDiscussionsForUrl(match)
		),
	);

	results.forEach((result) => {
		if (result.status === 'rejected') {
			console.error(result.reason);
		}
	});

	const discussions = results
		.filter((result) => result.status === 'fulfilled')
		.flatMap((result) => result.value)
		.sort((a, b) => b.numComments - a.numComments);

	return c.render(ResultsPage({ discussions, url }));
}

export default app;

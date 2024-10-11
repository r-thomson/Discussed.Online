import { type Context, Hono } from 'hono';
import * as discussionSites from '../discussions/sites.ts';
import type { Discussion, DiscussionsOrdering } from '../discussions/types.ts';
import { matchUrl } from '../discussions/url_match.ts';
import { HomePage } from '../components/HomePage.tsx';
import { ResultsPage } from '../components/ResultsPage.tsx';

const app = new Hono();

app.get('/', (c) => {
	const urlParam = c.req.query('url');

	if (urlParam === undefined) {
		return c.render(HomePage());
	} else if (!URL.canParse(urlParam)) {
		return c.redirect('/');
	} else {
		return renderDiscussions(new URL(urlParam), c);
	}
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
	const ordering = parseOrdering(c.req.query('ordering') ?? '') ?? 'popular';

	const results = await Promise.allSettled(
		Object.values(discussionSites).map((discussionSite) =>
			discussionSite.getDiscussionsForUrl(match, { ordering })
		),
	);

	results.forEach((result) => {
		if (result.status === 'rejected') {
			console.error(result.reason);
		}
	});

	let discussions = results
		.filter((result) => result.status === 'fulfilled')
		.flatMap((result) => result.value);
	discussions = sortDiscussions(discussions, ordering);

	return c.render(ResultsPage({ discussions, url, ordering }));
}

function parseOrdering(value: string): DiscussionsOrdering | undefined {
	value = value.toLowerCase();
	if (value === 'popular') return 'popular';
	if (value === 'recent') return 'recent';
	return undefined;
}

export function sortDiscussions(
	discussions: Discussion[],
	ordering: DiscussionsOrdering,
) {
	return discussions.toSorted((a, b) => {
		switch (ordering) {
			case 'popular':
				return b.numComments - a.numComments;
			case 'recent':
				return b.dateSubmitted.getTime() - a.dateSubmitted.getTime();
		}
	});
}

export default app;

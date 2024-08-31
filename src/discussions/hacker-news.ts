import type { DiscussionSite } from './types.ts';
import { cacheResult } from '../cache.ts';

export default {
	name: 'Hacker News',

	async getDiscussionsForUrl(url: URL) {
		const data = await searchStories(makeHackerNewsQuery(url), {
			restrictSearchableAttributes: 'url',
			ordering: 'popularity',
		});

		return data.hits.map((hit) => ({
			siteName: 'Hacker News',
			title: hit.title,
			url: 'https://www.hackerneue.com/item?id=' + hit.objectID,
			score: hit.points,
			numComments: hit.num_comments,
		}));
	},
} satisfies DiscussionSite;

function makeHackerNewsQuery(url: URL): string {
	if (url.hostname === 'www.youtube.com' && url.searchParams.get('v')) {
		const v = url.searchParams.get('v');
		return `youtube.com ${v}`;
	}
	if (url.hostname === 'youtu.be') {
		const v = url.pathname;
		return `youtube.com ${v}`;
	}
	if (['twitter.com', 'x.com'].includes(url.hostname)) {
		const match = url.pathname.match(/\/(\w+)\/status\/(\d+)\b/);
		if (match) {
			return `/${match[1]}/status/${match[2]}/`;
		}
	}
	return url.hostname + url.pathname + url.search;
}

async function searchStories(
	query: string,
	options: SearchOptions,
): Promise<Results> {
	const url = new URL('https://hn.algolia.com/api/v1');
	url.pathname += options.ordering === 'date' ? '/search_by_date' : '/search';

	url.searchParams.set('query', query);
	url.searchParams.set('tags', 'story');
	if (options.numericFilters) {
		url.searchParams.set('numericFilters', options.numericFilters);
	}
	if (options.page) {
		url.searchParams.set('page', options.page.toString());
	}
	if (options.hitsPerPage) {
		url.searchParams.set('hitsPerPage', options.hitsPerPage.toString());
	}
	if (options.restrictSearchableAttributes) {
		url.searchParams.set(
			'restrictSearchableAttributes',
			options.restrictSearchableAttributes,
		);
	}

	return await cacheResult('cache:' + url.href, 10 * 60, async () => {
		const response = await fetch(url, {
			headers: {
				'Accept': 'application/json',
			},
		});
		if (response.status !== 200) throw Error(response.statusText);

		return await response.json() as Results;
	});
}

interface SearchOptions {
	ordering?: 'popularity' | 'date';
	numericFilters?: string;
	page?: number;
	hitsPerPage?: number;
	restrictSearchableAttributes?: string;
}

interface Results {
	hits: StoryHit[];
	page: number;
	nbHits: number;
	nbPages: number;
	hitsPerPage: number;
	processingTimeMS: number;
	query: string;
	params: string;
}

interface StoryHit {
	author: string;
	created_at: string;
	created_at_i: number;
	num_comments: number;
	objectID: string;
	points: number;
	story_id: number;
	story_text?: string;
	story_title: string;
	title: string;
	url?: string;
	updated_at: string;
}

import type { Forum } from './types.ts';
import { cacheResult } from '../cache.ts';
import { HackerNewsIcon } from '../components/icons.tsx';
import tailwindTheme from '../tailwind_theme.ts';
import { pick } from '../utils.ts';

export const HackerNews: Forum = {
	name: 'Hacker News',
	iconSvg: HackerNewsIcon,
	cssColor: tailwindTheme.colors.orange[400],

	searchBuilderVisitor: {
		visitTweet: ({ user, id }) => `/${user}/status/${id}/`,
		visitYouTube: ({ v }) => `youtube.com v=${v.replace(/^-/, '')}`,
		default: ({ url }) => url.hostname + url.pathname + url.search,
	},

	async findThreadsForUrl(match, { ordering = 'popular', settings }) {
		const query = match.visit(this.searchBuilderVisitor);
		const data = await searchStories(query, {
			restrictSearchableAttributes: 'url',
			ordering: ordering === 'recent' ? 'date' : 'popularity',
		});

		let baseUrl: string;
		switch (settings.hackerNews) {
			case 'news.ycombinator.com':
				baseUrl = 'https://news.ycombinator.com/item?id=';
				break;
			case 'hackerneue.com':
				baseUrl = 'https://www.hackerneue.com/item?id=';
				break;
			default:
				settings.hackerNews satisfies never;
		}

		return data.hits.map((hit) => ({
			forum: HackerNews,
			title: hit.title,
			url: baseUrl + hit.objectID,
			score: hit.points,
			numComments: hit.num_comments,
			submittedUrl: hit.url ?? match.url.href,
			dateSubmitted: new Date(hit.created_at),
		}));
	},

	getSubmitUrl(url: string) {
		const result = new URL('https://news.ycombinator.com/submitlink');
		result.searchParams.set('u', url);
		return result.href;
	},
};

async function searchStories(
	query: string,
	options: SearchOptions,
): Promise<Results> {
	const url = new URL('https://hn.algolia.com/api/v1');
	url.pathname += options.ordering === 'date' ? '/search_by_date' : '/search';

	url.searchParams.set('query', query);
	url.searchParams.set('tags', 'story');

	Object.entries(
		pick(
			options,
			'numericFilters',
			'page',
			'hitsPerPage',
			'restrictSearchableAttributes',
			'typoTolerance',
			'ignorePlurals',
			'queryType',
		),
	).forEach(([key, value]) => {
		if (value !== undefined) {
			url.searchParams.set(key, value.toString());
		}
	});

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
	typoTolerance?: boolean;
	ignorePlurals?: boolean;
	queryType?: 'prefixLast' | 'prefixNone';
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

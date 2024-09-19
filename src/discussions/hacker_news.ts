import type { DiscussionSite } from './types.ts';
import { cacheResult } from '../cache.ts';

export default {
	name: 'Hacker News',

	searchBuilderVisitor: {
		visitTweet: ({ user, id }) => `/${user}/status/${id}/`,
		visitYouTube: ({ v }) => `youtube.com v=${v.replace(/^-/, '')}`,
		default: ({ url }) => url.hostname + url.pathname + url.search,
	},

	async getDiscussionsForUrl(match) {
		const query = match.visit(this.searchBuilderVisitor);
		const data = await searchStories(query, {
			restrictSearchableAttributes: 'url',
			ordering: 'popularity',
		});

		return data.hits.map((hit) => ({
			siteName: 'Hacker News',
			title: hit.title,
			url: 'https://www.hackerneue.com/item?id=' + hit.objectID,
			score: hit.points,
			numComments: hit.num_comments,
			submittedUrl: hit.url ?? match.url.href,
			dateSubmitted: new Date(hit.created_at),
		}));
	},
} satisfies DiscussionSite;

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
	if (options.page !== undefined) {
		url.searchParams.set('page', options.page.toString());
	}
	if (options.hitsPerPage !== undefined) {
		url.searchParams.set('hitsPerPage', options.hitsPerPage.toString());
	}
	if (options.restrictSearchableAttributes !== undefined) {
		url.searchParams.set(
			'restrictSearchableAttributes',
			options.restrictSearchableAttributes,
		);
	}
	if (options.typoTolerance !== undefined) {
		url.searchParams.set('typoTolerance', options.typoTolerance.toString());
	}
	if (options.ignorePlurals !== undefined) {
		url.searchParams.set('ignorePlurals', options.ignorePlurals.toString());
	}
	if (options.queryType !== undefined) {
		url.searchParams.set('queryType', options.queryType);
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

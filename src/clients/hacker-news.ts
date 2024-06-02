interface SearchOptions {
	ordering?: 'popularity' | 'date';
	numericFilters?: string;
	page?: number;
	hitsPerPage?: number;
	restrictSearchableAttributes?: string;
}

export async function searchStories(
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

	const response = await fetch(url);
	if (response.status !== 200) throw Error(response.statusText);

	return await response.json() as Results;
}

export interface Results {
	hits: StoryHit[];
	page: number;
	nbHits: number;
	nbPages: number;
	hitsPerPage: number;
	processingTimeMS: number;
	query: string;
	params: string;
}

export interface StoryHit {
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

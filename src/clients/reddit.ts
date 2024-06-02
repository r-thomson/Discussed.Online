interface SearchOptions {
	sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
	t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
	after?: string;
	before?: string;
	limit?: number;
}

export async function searchLinks(
	query: string,
	options: SearchOptions,
): Promise<Results> {
	const url = new URL('https://www.reddit.com/search.json');
	url.searchParams.set('q', query);
	if (options.sort) {
		url.searchParams.set('sort', options.sort);
	}
	if (options.t) {
		url.searchParams.set('t', options.t);
	}
	if (options.after) {
		url.searchParams.set('after', options.after);
	}
	if (options.before) {
		url.searchParams.set('before', options.before);
	}
	if (options.limit) {
		url.searchParams.set('limit', options.limit.toString());
	}

	const response = await fetch(url);
	if (response.status !== 200) {
		console.error(await response.text());
		throw Error(response.statusText);
	}

	return await response.json() as Results;
}

export interface Results {
	kind: 'Listing';
	data: {
		after: string;
		before: string | null;
		dist: number;
		modhash: string;
		children: LinkHit[];
	};
}

export interface LinkHit {
	kind: 't3';
	data: {
		author: string | null;
		created: number;
		created_utc: number;
		id: string;
		is_self: boolean;
		num_comments: number;
		over_18: boolean;
		permalink: string; // Relative URL
		score: number;
		selftext_html: string | null;
		selftext: string | null;
		subreddit: string;
		subreddit_name_prefixed: string;
		title: string;
		url: string;
	};
}

import { cacheResult } from '../cache.ts';
import { AsyncLock, basicAuth } from '../utils.ts';

interface AccessTokenResponse {
	access_token: string;
	token_type: 'bearer';
	expires_in: number;
	scope: string;
}

/** Retrieve access tokens via client_credentials flow with a cache */
class AccessTokenCache {
	private readonly clientId: string;
	private readonly clientSecret: string;

	constructor(clientId: string, clientSecret: string) {
		if (!clientId) throw Error('clientId is required');
		if (!clientSecret) throw Error('clientSecret is required');

		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	private cache: { token: string; expiresAt: number } | null = null;

	getCached(): string | undefined {
		if (this.cache && this.cache.expiresAt > Date.now()) {
			return this.cache.token;
		}
	}

	setCache({ access_token, expires_in }: AccessTokenResponse) {
		this.cache = {
			token: access_token,
			expiresAt: Date.now() + (expires_in * 1000),
		};
	}

	private async fetchAccessToken(): Promise<AccessTokenResponse> {
		const { clientId, clientSecret } = this;
		const response = await fetch(
			'https://www.reddit.com/api/v1/access_token',
			{
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Authorization': basicAuth(clientId, clientSecret),
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					grant_type: 'client_credentials',
				}),
			},
		);

		if (response.status !== 200) throw Error(response.statusText);
		return await response.json() as AccessTokenResponse;
	}

	private readonly lock = new AsyncLock();

	getToken(): Promise<string> {
		return this.lock.acquire(async () => {
			const cachedToken = this.getCached();
			if (cachedToken) return cachedToken;

			const tokenResponse = await this.fetchAccessToken();
			this.setCache(tokenResponse);

			return tokenResponse.access_token;
		});
	}
}

const accessTokens = new AccessTokenCache(
	Deno.env.get('REDDIT_CLIENT_ID') ?? '',
	Deno.env.get('REDDIT_CLIENT_SECRET') ?? '',
);

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
	const url = new URL('https://oauth.reddit.com/search');
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

	return await cacheResult('cache:' + url.href, 10 * 60, async () => {
		const response = await fetch(url, {
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + await accessTokens.getToken(),
				'User-Agent': 'discussed.online',
			},
		});
		if (response.status !== 200) throw Error(response.statusText);

		return await response.json() as Results;
	});
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

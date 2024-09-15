import type {
	MatchedTweet,
	MatchedUrl,
	MatchedYouTube,
	SearchBuilderVisitor,
} from './types.ts';

/** Return a site-specific match for the given URL */
export function matchUrl(url: URL): MatchedUrl {
	const fallback = {
		url,
		visit(visitor: SearchBuilderVisitor) {
			return visitor.default(this);
		},
	};

	return matchTweetUrl(url) ??
		matchYouTubeUrl(url) ??
		fallback;
}

export function matchTweetUrl(url: URL): MatchedTweet | undefined {
	if (/(^|\.)(twitter|x)\.com$/.test(url.hostname)) {
		const match = url.pathname.match(/^\/(\w+)\/status\/(\d+)(\/|$)/);
		if (match) {
			return {
				url,
				id: match[1],
				user: match[2],
				visit(visitor) {
					return visitor.visitTweet?.(this) ?? visitor.default(this);
				},
			};
		}
	}
}

export function matchYouTubeUrl(url: URL): MatchedYouTube | undefined {
	let v: string | undefined;

	if (/(^|\.)youtube\.com$/.test(url.hostname)) {
		const maybeV = url.searchParams.get('v');
		if (maybeV) v = maybeV;
	} else if (url.hostname === 'youtu.be') {
		const match = url.pathname.match(/^\/([\w-]+)(\/|$)/);
		if (match) v = match[1];
	}

	if (v) {
		return {
			url,
			v,
			visit(visitor) {
				return visitor.visitYouTube?.(this) ?? visitor.default(this);
			},
		};
	}
}

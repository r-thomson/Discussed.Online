import type {
	MatchedTtvClip,
	MatchedTweet,
	MatchedUrl,
	MatchedYouTube,
	SearchBuilderVisitor,
} from './types.ts';

/** Return a site-specific match for the given URL */
export function matchUrl(url: URL): MatchedUrl {
	return matchTtvClipUrl(url) ??
		matchTweetUrl(url) ??
		matchYouTubeUrl(url) ??
		matchAnyUrl(url);
}

export function matchTtvClipUrl(url: URL): MatchedTtvClip | undefined {
	if (/(^|\.)clips\.twitch\.tv$/.test(url.hostname)) {
		const match = url.pathname.match(/^\/(\w+)(?:-[\w-]+)?/);
		if (match) {
			return {
				url,
				id: match[1],
				visit(visitor) {
					return visitor.visitTtvClip?.(this) ??
						visitor.default(this);
				},
			};
		}
	} else if (/(^|\.)twitch\.tv$/.test(url.hostname)) {
		const match = url.pathname.match(/^\/\w+\/clip\/(\w+)(?:-[\w-]+)?/);
		if (match) {
			return {
				url,
				id: match[1],
				visit(visitor) {
					return visitor.visitTtvClip?.(this) ??
						visitor.default(this);
				},
			};
		}
	}
}

export function matchTweetUrl(url: URL): MatchedTweet | undefined {
	if (/(^|\.)(twitter|x)\.com$/.test(url.hostname)) {
		const match = url.pathname.match(/^\/(\w+)\/status\/(\d+)(\/|$)/);
		if (match) {
			return {
				url,
				user: match[1],
				id: match[2],
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

const UTM_PARAMS = [
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_term',
	'utm_content',
];

export function matchAnyUrl(url: URL): MatchedUrl {
	url = new URL(url);
	for (const param of UTM_PARAMS) {
		url.searchParams.delete(param);
	}

	return {
		url,
		visit(visitor: SearchBuilderVisitor) {
			return visitor.default(this);
		},
	};
}

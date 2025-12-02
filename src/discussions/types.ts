import { type DOMAttributes } from 'hono/jsx';
import { type JSX } from 'hono/jsx/jsx-runtime';
import { type RequestSettings } from '../middleware/settings.ts';

/** A Forum is a website that hosts discussion threads. */
export interface Forum {
	name: string;
	cssColor: string;
	iconSvg: (props: DOMAttributes) => JSX.Element;
	searchBuilderVisitor: SearchBuilderVisitor;
	findThreadsForUrl(match: MatchedUrl, options: {
		ordering?: ThreadsOrdering;
		settings: RequestSettings;
	}): Promise<Thread[]>;
	getSubmitUrl?: (url: string, options: {
		settings: RequestSettings;
	}) => string;
}

/** A Thread is an individual posting of a given URL to a Forum. */
export interface Thread {
	forum: Forum;
	boardName?: string;
	title: string;
	url: string;
	score: number;
	numComments: number;
	submittedUrl: string;
	dateSubmitted: Date;
}

export type ThreadsOrdering = 'popular' | 'recent';

/*
The system here is a bit complex and could definitely use some simplification,
but here is the basic idea:

Ultimately, we want to start with a URL and end up with a site-specific search
query. Different sites will to implement different query-building logic, on a
per-search-API basis. This is currently implemented via the visitor pattern.

It's a little OOP-y for my JavaScript tastes, but it gets the job done.
*/

export interface SearchBuilderVisitor {
	visitTtvClip?: (match: MatchedTtvClip) => string | undefined;
	visitTweet?: (match: MatchedTweet) => string | undefined;
	visitYouTube?: (match: MatchedYouTube) => string | undefined;
	default(match: MatchedUrl): string;
}

export interface MatchedUrl {
	visit(visitor: SearchBuilderVisitor): string;
	url: URL;
}

export interface MatchedTtvClip extends MatchedUrl {
	id: string;
}

export interface MatchedTweet extends MatchedUrl {
	user: string;
	id: string;
}

export interface MatchedYouTube extends MatchedUrl {
	v: string;
}

import { searchLinks as searchReddit } from './clients/reddit.ts';
import { searchStories as searchHackerNews } from './clients/hacker-news.ts';

export interface Discussion {
	siteName: string;
	title: string;
	url: string;
	score: number;
	numComments: number;
}

const TWITTER_SITES = ['twitter.com', 'x.com'];

function getRedditSearch(url: URL): string {
	if (url.hostname === 'www.youtube.com' && url.searchParams.get('v')) {
		const v = url.searchParams.get('v');
		return `url:${v} (site:youtube.com OR site:youtu.be)`;
	}
	if (url.hostname === 'youtu.be') {
		const v = url.pathname;
		return `url:${v} (site:youtube.com OR site:youtu.be)`;
	}
	if (TWITTER_SITES.includes(url.hostname)) {
		const match = url.pathname.match(/\w+\/status\/(\d+)\b/);
		if (match) {
			return `url:${match[1]} (${
				TWITTER_SITES.map((s) => 'site:' + s).join(' OR ')
			})`;
		}
	}
	return 'url:' + url.hostname + url.pathname + url.search;
}

function getHackerNewsSearch(url: URL): string {
	if (url.hostname === 'www.youtube.com' && url.searchParams.get('v')) {
		const v = url.searchParams.get('v');
		return `youtube.com/watch?v=${v}`;
	}
	if (url.hostname === 'youtu.be') {
		const v = url.pathname;
		return `youtube.com/watch?v=${v}`;
	}
	if (TWITTER_SITES.includes(url.hostname)) {
		const match = url.pathname.match(/\/(\w+)\/status\/(\d+)\b/);
		if (match) {
			return `/${match[1]}/status/${match[2]}/`;
		}
	}
	return url.hostname + url.pathname + url.search;
}

export async function getDiscussions(searchUrl: URL): Promise<Discussion[]> {
	const discussions: Discussion[] = await Promise.all([
		searchReddit(getRedditSearch(searchUrl), {
			sort: 'comments',
		}).then((data) =>
			data.data.children.map((child) => ({
				siteName: child.data.subreddit_name_prefixed,
				title: child.data.title,
				url: 'https://www.reddit.com' + child.data.permalink,
				score: child.data.score,
				numComments: child.data.num_comments,
			}))
		),
		searchHackerNews(getHackerNewsSearch(searchUrl), {
			restrictSearchableAttributes: 'url',
			ordering: 'popularity',
		}).then((data) =>
			data.hits.map((hit) => ({
				siteName: 'Hacker News',
				title: hit.title,
				url: 'https://www.hackerneue.com/item?id=' + hit.objectID,
				score: hit.points,
				numComments: hit.num_comments,
			}))
		),
	]).then((array) => array.flat(1));

	discussions.sort((a, b) => b.numComments - a.numComments);
	return discussions;
}

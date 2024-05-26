import { searchLinks as searchReddit } from './clients/reddit.ts';
import { searchStories as searchHackerNews } from './clients/hacker-news.ts';

export interface Discussion {
	siteName: string;
	title: string;
	url: string;
	score: number;
	numComments: number;
}

export async function getDiscussions(searchUrl: URL): Promise<Discussion[]> {
	const trimmedSearchUrl = searchUrl.hostname + searchUrl.pathname +
		searchUrl.search;

	const discussions: Discussion[] = await Promise.all([
		searchReddit(`url:${trimmedSearchUrl}`, {
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
		searchHackerNews(trimmedSearchUrl, {
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

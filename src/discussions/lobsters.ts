import type { DiscussionSite } from './types.ts';
import { cacheResult } from '../cache.ts';

export default {
	name: 'Lobsters',

	searchBuilderVisitor: {
		default: ({ url }) => url.href,
	},

	async getDiscussionsForUrl(match) {
		const query = match.visit(this.searchBuilderVisitor);
		const stories = await getStoriesByUrl(query);

		// The API doesn't seem to support any built-in sorting
		stories.sort((a, b) => b.comment_count - a.comment_count);

		return stories.map((story) => ({
			siteName: 'Lobsters',
			title: story.title,
			url: story.comments_url,
			score: story.score,
			numComments: story.comment_count,
			submittedUrl: story.url,
			dateSubmitted: new Date(story.created_at),
		}));
	},
} satisfies DiscussionSite;

async function getStoriesByUrl(searchUrl: string): Promise<Story[]> {
	const url = new URL('https://lobste.rs/stories/url/all');
	url.searchParams.set('url', searchUrl);

	return await cacheResult('cache:' + url.href, 10 * 60, async () => {
		const response = await fetch(url, {
			headers: {
				'Accept': 'application/json',
			},
		});
		if (response.status !== 200) throw Error(response.statusText);

		return await response.json() as Story[];
	});
}

interface Story {
	comment_count: number;
	comments_url: string;
	created_at: string;
	description: string;
	description_plain: string;
	flags: number;
	score: number;
	short_id: string;
	short_id_url: string;
	submitter_user: string;
	tags: string[];
	title: string;
	url: string;
	user_is_author: boolean;
}

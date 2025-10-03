import type { Forum } from './types.ts';
import { cacheResult } from '../cache.ts';
import { LobstersIcon } from '../components/icons.tsx';
import tailwindTheme from '../tailwind_theme.ts';

export const Lobsters: Forum = {
	name: 'Lobsters',
	iconSvg: LobstersIcon,
	cssColor: tailwindTheme.colors.red[800],

	searchBuilderVisitor: {
		default: ({ url }) => url.href,
	},

	async findThreadsForUrl(match) {
		const query = match.visit(this.searchBuilderVisitor);
		const stories = await getStoriesByUrl(query);

		return stories.map((story) => ({
			forum: Lobsters,
			title: story.title,
			url: story.comments_url,
			score: story.score,
			numComments: story.comment_count,
			submittedUrl: story.url,
			dateSubmitted: new Date(story.created_at),
		}));
	},
};

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

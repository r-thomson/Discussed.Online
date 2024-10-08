import { Timestamp } from './Timestamp.tsx';
import type { Discussion } from '../discussions/types.ts';
import { pluralize } from '../utils.ts';

interface DiscussionItemProps {
	discussion: Discussion;
}

export const DiscussionItem = ({ discussion }: DiscussionItemProps) => {
	// TODO: move styling information to the DiscussionSite object
	const siteColor = discussion.siteName === 'Hacker News'
		? 'bg-orange-400 text-white'
		: discussion.siteName === 'Lobsters'
		? 'bg-red-800 text-white'
		: discussion.siteName.startsWith('r/')
		? 'bg-orange-600 text-white'
		: '';

	return (
		<div class='space-y-0.5'>
			<h2 class='font-medium leading-tight'>
				<a
					href={discussion.url}
					class='text-blue-800 visited:text-blue-900'
				>
					{discussion.title}
				</a>
			</h2>
			<p class='text-xs leading-snug'>
				<a href={discussion.url} class='font-medium underline'>
					{discussion.numComments} comments
				</a>
				{' on '}
				<span class={`inline-block px-1 ${siteColor}`}>
					{discussion.siteName}
				</span>{' '}
				<Timestamp date={discussion.dateSubmitted} />{' '}
				({discussion.score.toLocaleString('en-US')}{' '}
				{pluralize(discussion.score, 'point', 'points')})
			</p>
		</div>
	);
};

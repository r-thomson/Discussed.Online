import { Timestamp } from './Timestamp.tsx';
import type { Thread } from '../discussions/types.ts';
import { pluralize } from '../utils.ts';

interface ThreadItemProps {
	thread: Thread;
}

export const ThreadItem = ({ thread }: ThreadItemProps) => {
	// TODO: move styling information to the Forum object
	const forumColor = thread.siteName === 'Hacker News'
		? 'bg-orange-400 text-white'
		: thread.siteName === 'Lobsters'
		? 'bg-red-800 text-white'
		: thread.siteName.startsWith('r/')
		? 'bg-orange-600 text-white'
		: '';

	return (
		<div class='space-y-0.5'>
			<h2 class='font-medium leading-tight'>
				<a
					href={thread.url}
					class='text-blue-800 visited:text-blue-900'
				>
					{thread.title}
				</a>
			</h2>
			<p class='text-xs leading-snug'>
				<a href={thread.url} class='font-medium underline'>
					{thread.numComments} comments
				</a>
				{' on '}
				<span class={`inline-block px-1 ${forumColor}`}>
					{thread.siteName}
				</span>{' '}
				<Timestamp date={thread.dateSubmitted} />{' '}
				({thread.score.toLocaleString('en-US')}{' '}
				{pluralize(thread.score, 'point', 'points')})
			</p>
		</div>
	);
};

import { Timestamp } from './Timestamp.tsx';
import type { Thread } from '../discussions/types.ts';
import { pluralize } from '../utils.ts';

interface ThreadItemProps {
	thread: Thread;
}

export const ThreadItem = ({ thread }: ThreadItemProps) => {
	const IconSVG = thread.forum.iconSvg;

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
				<span
					// TODO: Support changing text color based on forum
					class='inline-flex items-center px-1 align-[-0.125rem] text-white'
					style={{ backgroundColor: thread.forum.cssColor }}
				>
					<IconSVG class='h-3 mr-1 fill-current' />
					{thread.boardName ?? thread.forum.name}
				</span>{' '}
				<Timestamp date={thread.dateSubmitted} />{' '}
				({thread.score.toLocaleString('en-US')}{' '}
				{pluralize(thread.score, 'point', 'points')})
			</p>
		</div>
	);
};

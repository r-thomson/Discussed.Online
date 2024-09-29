import { DiscussionItem } from './DiscussionItem.tsx';
import { PageHeader } from './PageHeader.tsx';
import { pluralize } from '../utils.ts';
import type { Discussion } from '../discussions/types.ts';

interface ResultsPageProps {
	discussions: Discussion[];
	url: URL;
}

export const ResultsPage = ({ discussions, url }: ResultsPageProps) => (
	<>
		<PageHeader urlFormValue={url.href} />
		<main class='max-w-4xl mx-auto px-4 sm:px-8 py-4'>
			<p class='pb-4 text-sm text-center truncate'>
				{discussions.length}{' '}
				{pluralize(discussions.length, 'discussion', 'discussions')}
				{' for '}
				<a href={url.href} class='underline'>
					<strong>
						{url.hostname}
						{url.pathname}
						{url.search}
					</strong>
				</a>:
			</p>
			<ul class='divide-y divide-gray-200 '>
				{discussions.map((d) => (
					<li class='py-2'>
						<DiscussionItem discussion={d} />
					</li>
				))}
			</ul>
		</main>
	</>
);

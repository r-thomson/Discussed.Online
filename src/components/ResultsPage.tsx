import { UrlForm } from './UrlForm.tsx';
import { DiscussionItem } from './DiscussionItem.tsx';
import { pluralize } from '../utils.ts';
import type { Discussion } from '../discussions/types.ts';

interface ResultsPageProps {
	discussions: Discussion[];
	url: URL;
}

export const ResultsPage = ({ discussions, url }: ResultsPageProps) => (
	<>
		<header class='flex flex-col items-center px-4 sm:px-8 pt-12 pb-8 bg-gradient-to-b from-slate-50 to-slate-200'>
			<h1 class='mb-6 text-4xl font-semibold text-center whitespace-nowrap text-gray-800'>
				<a href='/'>
					Discussed.Online
				</a>
			</h1>
			<div class='max-w-2xl w-full'>
				<UrlForm value={url.href} />
			</div>
		</header>
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

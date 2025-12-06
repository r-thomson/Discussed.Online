import { html } from 'hono/html';
import { ThreadItem } from './ThreadItem.tsx';
import { Button, Select } from './forms.tsx';
import { PageHeader } from './PageHeader.tsx';
import * as forums from '../discussions/forums.ts';
import type { Thread, ThreadsOrdering } from '../discussions/types.ts';
import { RequestSettings } from '../middleware/settings.ts';
import { pluralize, toIntlSeparatedList } from '../utils.ts';

interface OrderingSelectProps {
	ordering: ThreadsOrdering;
}

const OrderingSelect = ({ ordering }: OrderingSelectProps) => (
	<Select name='ordering' required>
		<option value='popular' selected={ordering === 'popular'}>
			Most discussed
		</option>
		<option value='recent' selected={ordering === 'recent'}>
			Most recent
		</option>
	</Select>
);

interface ResultsFormProps {
	url: URL;
	ordering: ThreadsOrdering;
}

const ResultsForm = ({ url, ordering }: ResultsFormProps) => (
	<form class='flex flex-wrap justify-end gap-2.5'>
		<input type='hidden' name='url' value={url.href} />

		<label class='flex items-center gap-1.5'>
			<span class='text-label whitespace-nowrap'>
				Sort by
			</span>
			<OrderingSelect ordering={ordering} />
		</label>

		<noscript>
			<Button type='submit'>Submit</Button>
		</noscript>

		{html`
			<script>
			document.currentScript.parentElement.addEventListener('change', (event) => {
				event.currentTarget.requestSubmit();
			});
			</script>
		`}
	</form>
);

interface ResultsPageProps {
	threads: Thread[];
	url: URL;
	ordering: ThreadsOrdering;
	settings: RequestSettings;
}

export const ResultsPage = ({
	threads,
	url,
	ordering,
	settings,
}: ResultsPageProps) => (
	<>
		<PageHeader urlFormValue={url.href} />

		<main class='max-w-4xl mx-auto px-4 sm:px-8 py-4'>
			<div class='pb-2'>
				<ResultsForm url={url} ordering={ordering} />
			</div>

			<p class='pb-4 text-sm text-center truncate'>
				{threads.length}{' '}
				{pluralize(threads.length, 'discussion', 'discussions')}
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
				{threads.map((t) => (
					<li class='py-2'>
						<ThreadItem thread={t} />
					</li>
				))}
			</ul>

			<p class='pt-4 text-sm text-center'>
				Submit to: {toIntlSeparatedList(
					Object.values(forums).filter((forum) =>
						!!forum.getSubmitUrl
					).map((forum) => (
						<a
							href={forum.getSubmitUrl!(url.href, { settings })}
							target='_blank'
							class='text-blue-800 hover:underline'
						>
							{forum.name}
						</a>
					)),
					{ type: 'unit' },
				)}
			</p>
		</main>
	</>
);

import { html } from 'hono/html';
import { DiscussionItem } from './DiscussionItem.tsx';
import { Button, Select } from './forms.tsx';
import { PageHeader } from './PageHeader.tsx';
import type { Discussion, DiscussionsOrdering } from '../discussions/types.ts';
import { pluralize } from '../utils.ts';

interface OrderingSelectProps {
	ordering: DiscussionsOrdering;
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
	ordering: DiscussionsOrdering;
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
	discussions: Discussion[];
	url: URL;
	ordering: DiscussionsOrdering;
}

export const ResultsPage = ({
	discussions,
	url,
	ordering,
}: ResultsPageProps) => (
	<>
		<PageHeader urlFormValue={url.href} />

		<main class='max-w-4xl mx-auto px-4 sm:px-8 py-4'>
			<div class='pb-2'>
				<ResultsForm url={url} ordering={ordering} />
			</div>

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

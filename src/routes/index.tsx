import { type Context, Hono } from 'hono';
import { DiscussionItem } from '../components/DiscussionItem.tsx';
import { UrlForm } from '../components/UrlForm.tsx';
import { pluralize } from '../utils.ts';
import * as discussionSites from '../discussions/sites.ts';

const app = new Hono();

app.get('/', (c) => {
	let url;
	try {
		url = new URL(c.req.query('url') ?? '');
	} catch {
		return renderHomepage(c);
	}

	return renderDiscussions(url, c);
});

app.get(
	'/:url{https?://[a-zA-Z0-9:.@-]+\\.[a-zA-Z0-9]+\\b.*}',
	(c: Context) => {
		const reqUrl = new URL(c.req.url);
		const params = new URLSearchParams();
		params.set('url', reqUrl.pathname.slice(1) + reqUrl.search);
		return c.redirect('/?' + params.toString());
	},
);

function renderHomepage(c: Context) {
	return c.render(
		<div class='min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 py-32 flex flex-col px-4 sm:px-8 py-4 justify-center items-center'>
			<h1 class='pb-12 text-4xl sm:text-6xl font-semibold text-center whitespace-nowrap text-gray-800'>
				Discussed.Online
			</h1>
			<div class='w-full max-w-2xl pb-20'>
				<UrlForm />
			</div>
			<div class='pb-12 text-center'>
				<p class='text-gray-700'>Or try out one of these links:</p>
				<ul class='pt-2 space-y-1'>
					{[
						'moxie.org/2022/01/07/web3-first-impressions.html',
						'en.wikipedia.org/wiki/Zero_rupee_note',
						'www.youtube.com/watch?v=gm0b_ijaYMQ',
					].map((url) => (
						<li>
							<a
								href={`/?url=https://${url}`}
								class='text-blue-800 hover:underline'
							>
								{url}
							</a>
						</li>
					))}
				</ul>
			</div>
		</div>,
	);
}

async function renderDiscussions(url: URL, c: Context) {
	const discussions = (await Promise.allSettled(
		Object.values(discussionSites).map((discussionSite) =>
			discussionSite.getDiscussionsForUrl(url)
		),
	)).filter((result) => result.status === 'fulfilled')
		.flatMap((result) => result.value)
		.sort((a, b) => b.numComments - a.numComments);

	return c.render(
		<>
			<header class='flex flex-col items-center px-4 sm:px-8 pt-12 pb-8 bg-gradient-to-b from-slate-50 to-slate-200'>
				<h1 class='mb-6 text-4xl font-semibold text-center whitespace-nowrap text-gray-800'>
					<a href='/'>
						Discussed.Online
					</a>
				</h1>
				<div class='max-w-2xl w-full'>
					<UrlForm value={url.toString()} />
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
		</>,
	);
}

export default app;

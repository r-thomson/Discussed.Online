import { UrlForm } from './UrlForm.tsx';

export const HomePage = () => (
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
	</div>
);

import { UrlForm } from './UrlForm.tsx';

interface PageHeaderProps {
	urlFormValue?: string;
}

export const PageHeader = (props: PageHeaderProps) => (
	<header class='flex flex-col items-center px-4 sm:px-8 pt-12 pb-8 bg-gradient-to-b from-slate-50 to-slate-200'>
		<h1 class='mb-6 text-4xl font-semibold text-center whitespace-nowrap text-gray-800'>
			<a href='/'>
				Discussed.Online
			</a>
		</h1>
		<div class='max-w-2xl w-full'>
			<UrlForm value={props.urlFormValue} />
		</div>
	</header>
);

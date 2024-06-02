import { html } from 'hono/html';
import { memo } from 'hono/jsx';

interface InputProps {
	value?: string;
}

const Input = ({ value }: InputProps) => (
	<input
		type='url'
		value={value}
		name='url'
		required
		aria-label='URL'
		placeholder='Paste a URL here&hellip;'
		class='flex-1 appearance-none px-3 py-1.5 text-base sm:text-sm sm:leading-6 bg-white text-gray-800 placeholder:text-gray-400 rounded-l-md border border-gray-300 outline-none focus:outline-2 focus:outline-blue-800 focus:-outline-offset-2'
	/>
);

const ArrowRightIcon = (props: object) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 448 512'
		{...props}
	>
		{html`<!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->`}
		<path d='M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z' />
	</svg>
);

const Button = memo(() => (
	<button
		type='submit'
		class='flex-none flex items-center px-4 py-1.5 rounded-r-md border border-transparent bg-blue-950 hover:bg-blue-900 active:bg-blue-950'
		aria-label='Submit'
	>
		<ArrowRightIcon class='h-4 fill-white' aria-hidden='true' />
	</button>
));

interface UrlFormProps {
	value?: string;
}

export const UrlForm = ({ value }: UrlFormProps) => (
	<form action='/' autocomplete='off' class='flex rounded-md shadow-sm'>
		<Input value={value} />
		<Button />
	</form>
);

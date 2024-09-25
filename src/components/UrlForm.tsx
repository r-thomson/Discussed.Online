import { html } from 'hono/html';
import { type JSX, memo } from 'hono/jsx';
import { ArrowRightIcon } from './icons.tsx';

interface InputProps {
	value?: string;
}

const Input = (props: InputProps & JSX.IntrinsicElements['input']) => (
	<>
		<input
			type='url'
			name='url'
			required
			aria-label='URL'
			placeholder='Paste a URL here&hellip;'
			class='flex-1 appearance-none rounded-none rounded-l-md border border-gray-300 bg-white px-3 py-1.5 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-800 pointer-coarse:text-base'
			{...props}
		/>
		{html`
		<script>
			document.currentScript.previousElementSibling.addEventListener('change', (event) => {
				if (event.target.validity.typeMismatch) {
					event.target.value = 'https://' + event.target.value;
				}
			});
		</script>
		`}
	</>
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

import type { JSX, PropsWithChildren } from 'hono/jsx';
import { AngleUpDownIcon } from '../components/icons.tsx';
import tailwindTheme from '../tailwind_theme.ts';
import { dataUrlFromSvg } from '../utils.ts';

type ButtonProps = PropsWithChildren<JSX.IntrinsicElements['button']>;

export const Button = ({ children, ...attrs }: ButtonProps) => (
	<button
		{...attrs}
		type={attrs.type ?? 'button'}
		class='rounded border border-gray-300 bg-white px-2.5 py-1 text-sm font-medium text-gray-800 shadow-sm active:bg-gray-100'
	>
		{children}
	</button>
);

const selectArrows = <AngleUpDownIcon fill={tailwindTheme.colors.gray[500]} />;

type SelectProps = PropsWithChildren<JSX.IntrinsicElements['select']>;

export const Select = ({ children, ...attrs }: SelectProps) => (
	<select
		{...attrs}
		class='appearance-none rounded border border-gray-300 bg-white bg-no-repeat py-1 pl-2.5 pr-6 text-sm text-gray-800 shadow-sm'
		style={{
			backgroundImage: dataUrlFromSvg(selectArrows),
			backgroundPosition: 'right .375rem center',
			backgroundSize: '.75rem .75rem',
		}}
	>
		{children}
	</select>
);

const radioCircle = (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#fff'>
		<circle cx='8' cy='8' r='3' />
	</svg>
);

export const Radio = (attrs: JSX.IntrinsicElements['input']) => (
	<input
		{...attrs}
		type='radio'
		class='size-4 appearance-none rounded-full border border-gray-300 bg-white bg-center bg-origin-border -outline-offset-2 checked:border-transparent checked:bg-blue-600'
		style={{ backgroundImage: dataUrlFromSvg(radioCircle) }}
	/>
);

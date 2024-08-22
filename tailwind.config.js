export default {
	content: [
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			screens: {
				'pointer-coarse': { 'raw': '(pointer: coarse)' },
			},
		},
	},
	plugins: [],
};

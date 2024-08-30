import type { PropsWithChildren } from 'hono/jsx';
import { manifest } from '../assets.ts';

export default ({ children }: PropsWithChildren) => (
	<html lang='en-US'>
		<head>
			<meta charset='utf-8' />
			<meta
				name='viewport'
				content='width=device-width,initial-scale=1'
			/>
			<meta name='color-scheme' content='light dark' />
			<title>discussed.online</title>
			<link
				href={'/' + manifest['styles/tailwind.css']}
				rel='stylesheet'
			/>
			<meta name='description' content='Find discussions for any URL.' />
		</head>
		<body class='bg-white text-gray-900'>
			{children}
		</body>
	</html>
);

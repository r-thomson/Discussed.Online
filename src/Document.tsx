import type { PropsWithChildren } from 'hono/jsx';

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
			<link href='/styles/tailwind.css' rel='stylesheet' />
		</head>
		<body>
			{children}
		</body>
	</html>
);

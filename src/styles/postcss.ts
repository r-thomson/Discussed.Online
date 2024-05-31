import { AcceptedPlugin } from 'postcss/lib/postcss.js';
import { createMiddleware } from 'hono/factory';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss/mod.js';
import tailwindcss from 'tailwindcss';

const processor = postcss([
	tailwindcss,
	autoprefixer,
] as AcceptedPlugin[]);

export const postcssMiddleware = createMiddleware(async (c, next) => {
	await next();
	if (!c.res.headers.get('Content-Type')?.startsWith('text/css')) return;

	// TODO: cache the result instead of re-processing on every request
	const result = await processor.process(await c.res.text());
	c.res = new Response(result.css, c.res);
});

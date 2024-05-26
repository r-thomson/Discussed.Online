import { Hono, TrieRouter } from 'hono/mod.ts';

const app = new Hono({
	router: new TrieRouter(),
});

Deno.serve(app.fetch);

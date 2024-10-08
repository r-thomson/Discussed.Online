import app from './src/app.ts';

const hostname = Deno.env.get('HOSTNAME') || undefined;
const port = +(Deno.env.get('PORT') ?? '') || undefined;

Deno.serve({ hostname, port }, app.fetch);

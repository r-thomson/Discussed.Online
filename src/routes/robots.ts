import { AI_ROBOTS_TXT } from '@hono/ua-blocker/ai-bots';
import { type Context, Hono } from 'hono';

const app = new Hono();

const ROBOTS_TXT = `\
User-agent: *
Disallow: /?url=*
Disallow: /?*&url=*
${AI_ROBOTS_TXT}`;

app.get('/', (c: Context) => c.text(ROBOTS_TXT));

export default app;

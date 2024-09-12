import { type Context, Hono } from 'hono';

const app = new Hono();

app.get('/', (c: Context) => c.text("Damn... I'm looking good!"));

export default app;

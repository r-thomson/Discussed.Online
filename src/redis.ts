import { createClient } from 'redis';

const client = createClient({
	url: Deno.env.get('REDIS_URL'),
});

await client.connect();

export default client;

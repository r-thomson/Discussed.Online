import { deadline } from '@std/async';
import redis from './redis.ts';

const CACHE_TIMEOUT_MS = 500;

/** Cache the result of a function in Redis. */
export async function cacheResult<T>(
	cacheKey: string,
	expiresIn: number,
	callback: () => Promise<T>,
): Promise<T> {
	if (!cacheKey) throw TypeError('A cache key is required');

	try {
		const cached = await deadline(redis.GET(cacheKey), CACHE_TIMEOUT_MS);

		if (cached !== null) {
			return JSON.parse(cached) as T;
		}
	} catch (error) {
		console.error('Cache read error', error);
	}

	const result = await callback();

	try {
		await deadline(
			redis.SET(cacheKey, JSON.stringify(result), { EX: expiresIn }),
			CACHE_TIMEOUT_MS,
		);
	} catch (error) {
		console.error('Cache set error', error);
	}

	return result;
}

import {
	assert,
	assertEquals,
	assertFalse,
	assertRejects,
	assertStrictEquals,
} from '@std/assert/';
import { delay } from '@std/async';
import '@std/testing/time/';
import { AsyncLock, basicAuth, pick, pluralize } from './utils.ts';

Deno.test('AsyncLock.acquire() resolves when callback resolves', async () => {
	const lock = new AsyncLock();
	const result = await lock.acquire(() => Promise.resolve('Resolve!'));
	assertEquals(result, 'Resolve!');
});

Deno.test('AsyncLock.acquire() rejects when callback rejects', async () => {
	const lock = new AsyncLock();
	await assertRejects(async () => {
		await lock.acquire(() => Promise.reject(new Error('Reject!')));
	}, 'Reject!');
});

Deno.test('AsyncLock.acquire() does not synchronously execute callback', async () => {
	const lock = new AsyncLock();
	let called = false;

	const completion = lock.acquire(() => {
		called = true;
		return Promise.resolve();
	});

	assertFalse(called);

	await completion;
});

Deno.test('AsyncLock.acquire() waits for first callback to complete', async () => {
	const lock = new AsyncLock();
	const { promise, resolve } = Promise.withResolvers<void>();
	let called = false;

	lock.acquire(() => promise);
	const completion = lock.acquire(() => {
		called = true;
		return Promise.resolve();
	});
	await delay(0);

	assertFalse(called);
	resolve();
	await completion;
	assert(called);
});

Deno.test('AsyncLock.acquire() waits for previously scheduled callbacks to complete', async () => {
	const lock = new AsyncLock();
	const { promise, resolve } = Promise.withResolvers<void>();
	let called = false;

	lock.acquire(() => promise);
	await delay(0);
	const completion = lock.acquire(() => {
		called = true;
		return Promise.resolve();
	});
	await delay(0);

	assertFalse(called);
	resolve();
	await completion;
	assert(called);
});

Deno.test('AsyncLock.acquire() callback does not run until prior promise resolves', async () => {
	const lock = new AsyncLock();
	const { promise, resolve } = Promise.withResolvers<void>();
	let called = false;

	lock.acquire(() => promise);
	const completion = lock.acquire(() => {
		called = true;
		return Promise.resolve();
	});

	resolve();
	await promise;
	assertFalse(called);
	await completion;
	assert(called);
});

Deno.test('AsyncLock.acquire() executes callbacks in order', async () => {
	const lock = new AsyncLock();
	const results: number[] = [];

	for (let i = 0; i < 100; i++) {
		lock.acquire(async () => {
			await delay(Math.random() * 10);
			results.push(i);
			return i;
		}).then((value) => {
			assertEquals(value, i);
		});
	}

	// Wait for all current locks to complete
	await lock.acquire(() => Promise.resolve());

	assertFalse(lock.isAcquired);
	assertEquals(results, Array.from(Array(100), (_, i) => i));
});

Deno.test('AsyncLock.isAcquired is initially false', () => {
	const lock = new AsyncLock();
	assertFalse(lock.isAcquired);
});

Deno.test('AsyncLock.isAcquired is true while callback is running', async () => {
	const lock = new AsyncLock();
	const { promise, resolve } = Promise.withResolvers<void>();

	const completion = lock.acquire(() => promise);

	assert(lock.isAcquired);

	resolve();
	await completion;
});

Deno.test('AsyncLock.isAcquired is false when callback finishes', async () => {
	const lock = new AsyncLock();

	await lock.acquire(() => Promise.resolve());

	assertFalse(lock.isAcquired);
});

Deno.test('basicAuth()', () => {
	assertEquals(
		basicAuth('aladdin', 'opensesame'),
		'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
	);
});

Deno.test('pick() returns object with only provided keys', () => {
	const object = {
		foo: 'Hello',
		bar: 42,
		baz: [],
		qux: undefined,
	};
	const picked = pick(object, 'bar', 'qux');

	assertStrictEquals(Object.getPrototypeOf(picked), Object.prototype);
	assertEquals(picked, {
		bar: 42,
		qux: undefined,
	});

	// @ts-expect-error: assertion
	picked.foo;
	picked.bar;
	// @ts-expect-error: assertion
	picked.baz;
	picked.qux;
});

Deno.test('pick() with no keys returns empty object', () => {
	const object = {
		foo: 'Hello',
		bar: 42,
		baz: [],
		qux: undefined,
	};
	const picked = pick(object);

	assertEquals(picked, {});

	// @ts-expect-error: assertion
	picked.foo;
	// @ts-expect-error: assertion
	picked.bar;
	// @ts-expect-error: assertion
	picked.baz;
	// @ts-expect-error: assertion
	picked.qux;
});

Deno.test('pick() ignores keys not in object', () => {
	// @ts-expect-error: intentional misuse
	const picked = pick({}, 'blam');

	assertFalse('blam' in picked);
});

Deno.test('pick() preserves null prototype', () => {
	const picked = pick(Object.create(null));

	assertEquals(Object.getPrototypeOf(picked), null);
});

Deno.test('pluralize()', () => {
	assertEquals(pluralize(0, 'person', 'people'), 'people');
	assertEquals(pluralize(1, 'person', 'people'), 'person');
	assertEquals(pluralize(2, 'person', 'people'), 'people');
});

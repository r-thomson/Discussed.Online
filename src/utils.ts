import { encodeBase64 } from '@std/encoding/base64';

/**
 * Synchronization tool for ensuring that only one piece of asynchronous
 * code can run at a time.
 */
export class AsyncLock {
	// TypeScript doesn't seem support a heterogeneous array of generic objects
	private readonly queue: CallbackWithResolvers<any>[] = [];

	get isAcquired(): boolean {
		return this.queue.length > 0;
	}

	/**
	 * Wait for the lock to become available, then execute a callback when
	 * it's ready. Release the lock when the callback completes.
	 */
	acquire<T>(callback: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push({ callback, resolve, reject });

			if (this.queue.length === 1) {
				// Make sure we don't block here
				setTimeout(() => this.processNext());
			}
		});
	}

	private async processNext() {
		if (this.queue.length === 0) return;

		const { callback, resolve, reject } = this.queue[0];

		// Here it's important that we call the code in the finally block
		// synchronously after calling resolve() or reject().
		try {
			resolve(await callback());
		} catch (error) {
			reject(error);
		} finally {
			this.queue.shift();
			this.processNext();
		}
	}
}

interface CallbackWithResolvers<T> {
	callback: () => Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: any) => void;
}

export function basicAuth(userId: string, password: string): string {
	return 'Basic ' + encodeBase64(userId + ':' + password);
}

/** Return a new object with the chosen keys of the provided object. */
export function pick<T extends object, K extends keyof T = never>(
	object: T,
	...keys: readonly K[]
): Pick<T, K> {
	const newObj = (
		Object.getPrototypeOf(object) === null ? Object.create(null) : {}
	) as Pick<T, K>;

	keys.forEach((k) => {
		if (k in object) {
			newObj[k] = object[k];
		}
	});

	return newObj;
}

export function pluralize(
	quantity: number,
	singular: string,
	plural: string,
): string {
	return quantity === 1 ? singular : plural;
}

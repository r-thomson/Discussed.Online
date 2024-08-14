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
	return 'Basic ' + btoa(userId + ':' + password);
}

export function pluralize(
	quantity: number,
	singular: string,
	plural: string,
): string {
	return quantity === 1 ? singular : plural;
}

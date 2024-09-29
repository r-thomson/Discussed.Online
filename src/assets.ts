import { type MiddlewareHandler } from 'hono';
import { AcceptedPlugin } from 'postcss/lib/postcss.js';
import { ensureDir, expandGlob } from '@std/fs';
import * as path from '@std/path';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss/mod.js';
import tailwindcss from 'tailwindcss';
import { encodeHex } from '@std/encoding';
import { serveStatic } from 'hono/deno';
import { type ServeStaticOptions } from 'hono/serve-static';

interface MakeAssetsMiddlewareOptions {
	assetsDir: string;
	processors: AssetProcessor[];
	serveStaticOptions?: Omit<ServeStaticOptions, 'path' | 'root'>;
}

interface AssetProcessor {
	glob: string;
	process(data: Uint8Array): Promise<Uint8Array>;
}

interface AssetsMiddleware {
	/** Middleware to serve rendered assets */
	serveAssets: MiddlewareHandler;
	/** A mapping from the asset's original to new relative paths */
	manifest: Readonly<Record<string, string>>;
}

async function makeAssetsMiddleware(
	options: MakeAssetsMiddlewareOptions,
): Promise<AssetsMiddleware> {
	const srcPath = path.normalize(options.assetsDir);

	const distPath = await Deno.makeTempDir();
	globalThis.addEventListener('unload', () => {
		Deno.removeSync(distPath, { recursive: true });
	});

	const manifest: Record<string, string> = Object.create(null);

	for (const processor of options.processors) {
		const glob = path.joinGlobs([srcPath, processor.glob]);
		for await (const entry of expandGlob(glob)) {
			if (!entry.isFile) continue;

			const relativeSrcPath = path.relative(srcPath, entry.path);

			const data = await processor.process(
				await Deno.readFile(entry.path),
			);

			const digest = await crypto.subtle.digest('SHA-256', data);
			const outputPath = path.join(
				distPath,
				path.dirname(relativeSrcPath),
				appendHashToFilename(entry.name, digest),
			);

			await ensureDir(path.dirname(outputPath));
			await Deno.writeFile(outputPath, data, { createNew: true });

			manifest[relativeSrcPath] = path.relative(distPath, outputPath);
		}
	}

	return {
		serveAssets: serveStatic({
			...options.serveStaticOptions,
			root: distPath,
		}),
		manifest,
	};
}

function appendHashToFilename(filename: string, digest: ArrayBuffer) {
	const { name, ext } = path.parse(filename);
	const hash = encodeHex(digest).slice(0, 16);
	return name + '-' + hash + ext;
}

export const { serveAssets, manifest } = await makeAssetsMiddleware({
	assetsDir: './src/assets',
	processors: [
		{
			glob: 'styles/**/*.css',
			process: (() => {
				const processor = postcss([
					tailwindcss,
					autoprefixer,
				] as AcceptedPlugin[]);

				return async (data) => {
					const source = new TextDecoder().decode(data);
					const result = await processor.process(source, {
						from: undefined,
					});
					return new TextEncoder().encode(result.css);
				};
			})(),
		},
	],
});

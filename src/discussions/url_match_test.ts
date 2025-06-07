import { assertEquals } from '@std/assert/';
import { matchTtvClipUrl } from './url_match.ts';

Deno.test('Match clips.twitch.tv URL', () => {
	const testCases = [
		[
			'https://clips.twitch.tv/BashfulHelpfulSalamanderPrimeMe',
			'BashfulHelpfulSalamanderPrimeMe',
		],
		[
			'https://clips.twitch.tv/BlueTenuousSalsifyCmonBruh-Sk5s1SnWpWMBq6Po',
			'BlueTenuousSalsifyCmonBruh',
		],
		[
			'https://www.twitch.tv/harbleu/clip/PlumpEnthusiasticDiscPMSTwin',
			'PlumpEnthusiasticDiscPMSTwin',
		],
		[
			'https://www.twitch.tv/piratesoftware/clip/CuteEnchantingDunlinWTRuck-pcNk1MHB3fGxWKyw',
			'CuteEnchantingDunlinWTRuck',
		],
	];

	for (const [url, id] of testCases) {
		const match = matchTtvClipUrl(new URL(url));
		assertEquals(match?.id, id);
	}
});

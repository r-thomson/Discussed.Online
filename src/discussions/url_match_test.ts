import { assertEquals } from '@std/assert/';
import { matchSubstackPostUrl, matchTtvClipUrl } from './url_match.ts';

Deno.test('Match *.substack.com/p/ URL', () => {
	const testCases = [
		[
			'https://example.substack.com/p/lorem-ipsum-dolor-sit-amet?utm_source=post-email-title&publication_id=1234&post_id=56789',
			'https://example.substack.com/p/lorem-ipsum-dolor-sit-amet',
		],
	];

	for (const [url, cleanUrl] of testCases) {
		const match = matchSubstackPostUrl(new URL(url));
		assertEquals(match?.url?.href, cleanUrl);
	}
});

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

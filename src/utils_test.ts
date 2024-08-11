import { assertEquals } from '@std/assert/';
import { basicAuth, pluralize } from './utils.ts';

Deno.test('basicAuth', () => {
	assertEquals(
		basicAuth('aladdin', 'opensesame'),
		'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
	);
});

Deno.test('pluralize', () => {
	assertEquals(pluralize(0, 'person', 'people'), 'people');
	assertEquals(pluralize(1, 'person', 'people'), 'person');
	assertEquals(pluralize(2, 'person', 'people'), 'people');
});

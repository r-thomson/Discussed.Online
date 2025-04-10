import { Hono } from 'hono';
import { Settings } from '../components/SettingsPage.tsx';
import {
	parseSettingsCookie,
	type RequestSettings,
	setSettingsCookie,
} from '../middleware/settings.ts';

const settingsApp = new Hono();

settingsApp.get('', (c) => {
	const settings = c.get('settings');
	return c.render(Settings({ settings }));
});

settingsApp.post('', async (c) => {
	const formData = await c.req.formData();
	const parsedData = parseSettingsForm(formData);

	setSettingsCookie(c, parsedData);

	// A redirect prevents the "submit this form again" browser dialog
	return c.redirect(c.req.path);
});

function parseSettingsForm(formData: FormData): Partial<RequestSettings> {
	// The form has the same schema as the cookie so we can reuse that code
	const params = new URLSearchParams(formData as Iterable<[string, string]>);
	return parseSettingsCookie(params.toString());
}

export default settingsApp;

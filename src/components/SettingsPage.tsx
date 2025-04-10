import { PropsWithChildren } from 'hono/jsx';
import { PageHeader } from './PageHeader.tsx';
import { Button, Radio } from './forms.tsx';
import { type RequestSettings } from '../middleware/settings.ts';

type SettingsProps = {
	settings: RequestSettings;
};

export const Settings = (props: SettingsProps) => (
	<>
		<PageHeader />

		<main class='max-w-4xl mx-auto px-4 sm:px-8 py-4'>
			<h1 class='text-2xl font-semibold pb-6'>Settings</h1>

			<form method='post' class='space-y-4'>
				<FormGroup legend='Open Reddit Links In'>
					<div class='space-y-1'>
						{['reddit.com', 'old.reddit.com'].map((value) => (
							<label class='flex align-baseline gap-1.5 text-label'>
								<Radio
									name='reddit'
									value={value}
									checked={props.settings.reddit === value}
									required
								/>
								<span>{value}</span>
							</label>
						))}
					</div>
				</FormGroup>

				<FormGroup legend='Open Hacker News Links In'>
					<div class='space-y-1'>
						{['news.ycombinator.com', 'hackerneue.com'].map(
							(value) => (
								<label class='flex align-baseline gap-1.5 text-label'>
									<Radio
										name='hackerNews'
										value={value}
										checked={props.settings.hackerNews ===
											value}
										required
									/>
									<span>{value}</span>
								</label>
							),
						)}
					</div>
				</FormGroup>

				<Button type='submit'>Save Changes</Button>
			</form>
		</main>
	</>
);

type FormGroupProps = PropsWithChildren<{
	legend: string;
}>;

const FormGroup = ({ legend, children }: FormGroupProps) => (
	<fieldset class='sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4'>
		<legend class='contents'>
			<span class='text-label'>{legend}</span>
		</legend>

		<div class='sm:col-span-2 mt-2 sm:mt-0'>
			{children}
		</div>
	</fieldset>
);

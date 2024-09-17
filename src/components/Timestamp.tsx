import { formatISO, intlFormat, intlFormatDistance } from 'date-fns';

interface TimestampProps {
	date: Date;
}

export const Timestamp = ({ date }: TimestampProps) => {
	const title = intlFormat(date, { dateStyle: 'long', timeStyle: 'short' });

	return (
		<time datetime={formatISO(date)} title={title}>
			{intlFormatDistance(date, Date.now(), { numeric: 'always' })}
		</time>
	);
};

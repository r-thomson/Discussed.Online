export function pluralize(
	quantity: number,
	singular: string,
	plural: string,
): string {
	return quantity === 1 ? singular : plural;
}

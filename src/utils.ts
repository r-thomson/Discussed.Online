export function pluralize(
	quantity: number,
	singular: string,
	plural: string,
): string {
	return quantity === 1 ? singular : plural;
}

export function basicAuth(userId: string, password: string): string {
	return 'Basic ' + btoa(userId + ':' + password);
}

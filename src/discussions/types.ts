export interface DiscussionSite {
	name: string;
	getDiscussionsForUrl(url: URL): Promise<Discussion[]>;
}

export interface Discussion {
	siteName: string;
	title: string;
	url: string;
	score: number;
	numComments: number;
}

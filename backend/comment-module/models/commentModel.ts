export interface Comment {
	post_id: string;
	comment_id: string;
	owner_id: string;
	text: string;
	timestamp: number;
	last_edited_timestamp:number;
	like_count: number;
}

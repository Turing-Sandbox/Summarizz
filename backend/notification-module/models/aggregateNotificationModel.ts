export interface AggregateNotification {
	// User ID
	userIds: string[];
	// Type of notification (comment, like, share, follow, followedPost, followedShare)
	type: string;
	// Content ID, may be null if the notifications are follows
	contentId?: string;
	// Comment ID, only not null if the notifications are comments
	commentId?: string;
	// IDs of all the notifications, to all be looped over and marked as read when read.
	notifications: string[]
}

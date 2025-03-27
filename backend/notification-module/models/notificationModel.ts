export interface Notification {
	// User ID
	userId: string;
	// Type of notification (comment, like, share, follow, followedPost, followedShare)
	type: string;
	// Preview text for the notification (Comment/Content preview, just the first 30 or so characters.)
	textPreview?: string;
	// Content ID, may be null if the notification is a follow
	contentId?: string;
	// Comment ID, only not null if the notification is a comment
	commentId?: string;
	// Timestamp of the notification
	timestamp: number;
	// Read status
	read: boolean;
}

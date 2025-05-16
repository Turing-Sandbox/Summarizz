export interface PreferencesModel {
	// List of important notification types (like, follow, etc)
	important: string[];
	// Whether or not the user wishes to receive comment notifications.
	commentDisabled: boolean;
	// Whether or not the user wishes to receive like notifications.
	likeDisabled: boolean;
	// Whether or not the user wishes to receive share notifications.
	shareDisabled: boolean;
	// Whether or not the user wishes to receive follow notifications.
	followDisabled: boolean;
	// Whether or not the user wishes to receive post notifications from a user they follow.
	followedPostDisabled: boolean;
	// Whether or not the user wishes to receive share notifications from a user they follow.
	followedShareDisabled: boolean;
	// How often the client polls the backend to fetch notifications: 
	// (daily, never, hourly, immediately (on page load, or after clicking the notifications icon))
	pollPreferences: string;
	// settings for when to have quiet hours
	quietHours: {
		begin: string; // Start time for quiet hours
		end: string; // End time for quiet hours
	};
}

CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`agent` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);

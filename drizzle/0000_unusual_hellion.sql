CREATE TABLE `committees` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invites` (
	`id` integer PRIMARY KEY NOT NULL,
	`inviting_email` text NOT NULL,
	`from_member_id` integer NOT NULL,
	`accepted_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`from_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`committee_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`committee_id`) REFERENCES `committees`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`agent` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`user_id` integer NOT NULL,
	`values` text DEFAULT '{}',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
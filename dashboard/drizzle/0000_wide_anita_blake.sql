CREATE TABLE `progress_state` (
	`id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`progress_json` text NOT NULL,
	`updated_at` text NOT NULL
);

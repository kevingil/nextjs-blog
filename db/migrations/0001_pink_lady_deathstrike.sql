CREATE TABLE `image_generation` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prompt` text,
	`provider` text,
	`model` text,
	`request_id` text,
	`output_url` text,
	`storage_key` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `articles` ADD `image_generation_id` integer REFERENCES image_generation(id);
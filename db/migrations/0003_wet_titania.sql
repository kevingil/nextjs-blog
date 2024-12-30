DROP INDEX IF EXISTS "article_tags_article_id_tag_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "articles_slug_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "tags_tag_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
ALTER TABLE `about_page` ALTER COLUMN "title" TO "title" text;--> statement-breakpoint
CREATE UNIQUE INDEX `article_tags_article_id_tag_id_unique` ON `article_tags` (`article_id`,`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_tag_name_unique` ON `tags` (`tag_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `about_page` ALTER COLUMN "content" TO "content" text;--> statement-breakpoint
ALTER TABLE `about_page` ALTER COLUMN "last_updated" TO "last_updated" text;--> statement-breakpoint
ALTER TABLE `contact_page` ALTER COLUMN "title" TO "title" text;--> statement-breakpoint
ALTER TABLE `contact_page` ALTER COLUMN "content" TO "content" text;--> statement-breakpoint
ALTER TABLE `contact_page` ALTER COLUMN "email_address" TO "email_address" text;--> statement-breakpoint
ALTER TABLE `contact_page` ALTER COLUMN "last_updated" TO "last_updated" text;
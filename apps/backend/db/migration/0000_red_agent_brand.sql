CREATE TABLE `Accounts` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL,
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `Accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `JWKS` (
	`id` varchar(36) NOT NULL,
	`public_key` text NOT NULL,
	`private_key` text NOT NULL,
	`created_at` timestamp(3) NOT NULL,
	`expires_at` timestamp(3),
	CONSTRAINT `JWKS_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Sessions` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL,
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	CONSTRAINT `Sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `Sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL,
	`updated_at` timestamp(3) NOT NULL,
	`role` text,
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` timestamp(3),
	CONSTRAINT `Users_id` PRIMARY KEY(`id`),
	CONSTRAINT `Users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `Verifications` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL,
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `Verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`place` varchar(250),
	`organizer` varchar(100),
	`chief` varchar(100),
	`logo` boolean DEFAULT false,
	`label_id` varchar(30),
	`label_unit` varchar(30),
	CONSTRAINT `Configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`public_id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`place` varchar(250) NOT NULL,
	`organizer` varchar(100) NOT NULL,
	`chief` varchar(100) NOT NULL,
	`logo` boolean DEFAULT false,
	`is_datetime` boolean NOT NULL DEFAULT false,
	`enable_forms` boolean NOT NULL DEFAULT true,
	`label_id` varchar(30),
	`label_unit` varchar(30),
	CONSTRAINT `Events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_public_id_idx` UNIQUE(`public_id`)
);
--> statement-breakpoint
CREATE TABLE `Guests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`identity` varchar(20),
	`unit_id` int,
	`unit_name` varchar(100),
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `Guests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`sort_order` int NOT NULL,
	CONSTRAINT `Units_id` PRIMARY KEY(`id`),
	CONSTRAINT `units_name_idx` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `MicroserviceSecrets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(16) NOT NULL,
	`secret` char(64) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `MicroserviceSecrets_id` PRIMARY KEY(`id`),
	CONSTRAINT `MicroserviceSecrets_name_unique` UNIQUE(`name`),
	CONSTRAINT `MicroserviceSecrets_secret_unique` UNIQUE(`secret`)
);
--> statement-breakpoint
ALTER TABLE `Accounts` ADD CONSTRAINT `Accounts_user_id_Users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Sessions` ADD CONSTRAINT `Sessions_user_id_Users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Guests` ADD CONSTRAINT `Guests_event_id_Events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `Events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Guests` ADD CONSTRAINT `Guests_unit_id_Units_id_fk` FOREIGN KEY (`unit_id`) REFERENCES `Units`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `Accounts_userId_idx` ON `Accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `Sessions_userId_idx` ON `Sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `Verifications_identifier_idx` ON `Verifications` (`identifier`);--> statement-breakpoint
CREATE INDEX `guests_event_unit_idx` ON `Guests` (`event_id`,`unit_id`);--> statement-breakpoint
CREATE INDEX `guests_event_created_idx` ON `Guests` (`event_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `units_sort_order_idx` ON `Units` (`sort_order`);
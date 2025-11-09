CREATE TABLE `agent_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`agentType` enum('strategist','creator','engager') NOT NULL,
	`action` text NOT NULL,
	`details` text,
	`level` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agent_logs` ADD CONSTRAINT `agent_logs_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `draftingRequests` ADD `requiresPreGenerationApproval` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `draftingRequests` ADD `preGenerationApprovedBy` int;--> statement-breakpoint
ALTER TABLE `draftingRequests` ADD `preGenerationApprovedAt` timestamp;--> statement-breakpoint
ALTER TABLE `draftingRequests` ADD `preGenerationRationale` text;
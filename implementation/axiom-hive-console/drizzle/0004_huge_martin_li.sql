ALTER TABLE `auditEvents` ADD `eventOrder` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `auditEvents` ADD CONSTRAINT `audit_events_project_order_unique` UNIQUE(`projectId`,`eventOrder`);--> statement-breakpoint
CREATE INDEX `audit_events_project_created_idx` ON `auditEvents` (`projectId`,`eventOrder`);

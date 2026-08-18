CREATE TABLE `auditEvents` (
	`id` varchar(36) NOT NULL,
	`projectId` varchar(36) NOT NULL,
	`requestId` varchar(36),
	`actorUserId` int NOT NULL,
	`eventType` varchar(120) NOT NULL,
	`fromState` enum('DRAFT_REQUEST','INTAKE_VALIDATED','POLICY_DECIDED','DRAFT_GENERATED','OUTPUT_VALIDATED','AWAITING_HUMAN_REVIEW','APPROVED','REJECTED','RELEASED','VALIDATION_FAILED','CLARIFICATION_REQUIRED'),
	`toState` enum('DRAFT_REQUEST','INTAKE_VALIDATED','POLICY_DECIDED','DRAFT_GENERATED','OUTPUT_VALIDATED','AWAITING_HUMAN_REVIEW','APPROVED','REJECTED','RELEASED','VALIDATION_FAILED','CLARIFICATION_REQUIRED'),
	`payloadHash` varchar(64) NOT NULL,
	`previousHash` varchar(64) NOT NULL,
	`integrityHash` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `draftingRequests` (
	`id` varchar(36) NOT NULL,
	`projectId` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`intendedUse` text NOT NULL,
	`sensitivity` enum('public','internal','confidential','restricted') NOT NULL,
	`actionCategory` enum('internal_draft','external_release','high_impact','restricted') NOT NULL,
	`sourceInputs` text NOT NULL,
	`policyVersionId` varchar(36),
	`state` enum('DRAFT_REQUEST','INTAKE_VALIDATED','POLICY_DECIDED','DRAFT_GENERATED','OUTPUT_VALIDATED','AWAITING_HUMAN_REVIEW','APPROVED','REJECTED','RELEASED','VALIDATION_FAILED','CLARIFICATION_REQUIRED') NOT NULL DEFAULT 'DRAFT_REQUEST',
	`requiresHumanReview` boolean NOT NULL DEFAULT true,
	`submittedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `draftingRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policyVersions` (
	`id` varchar(36) NOT NULL,
	`projectId` varchar(36) NOT NULL,
	`version` varchar(48) NOT NULL,
	`name` varchar(160) NOT NULL,
	`policyJson` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `policyVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `policy_project_version_unique` UNIQUE(`projectId`,`version`)
);
--> statement-breakpoint
CREATE TABLE `projectMembers` (
	`id` varchar(36) NOT NULL,
	`projectId` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`role` enum('author','reviewer','admin') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `project_members_project_user_unique` UNIQUE(`projectId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `releasedArtifacts` (
	`id` varchar(36) NOT NULL,
	`requestId` varchar(36) NOT NULL,
	`version` varchar(48) NOT NULL,
	`format` enum('markdown','json') NOT NULL,
	`content` text NOT NULL,
	`evidenceState` enum('draft','source_backed_draft','human_reviewed','validated_against_defined_rules','released','superseded') NOT NULL DEFAULT 'released',
	`limitations` text NOT NULL,
	`digest` varchar(64) NOT NULL,
	`releasedBy` int NOT NULL,
	`releasedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `releasedArtifacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviewDecisions` (
	`id` varchar(36) NOT NULL,
	`requestId` varchar(36) NOT NULL,
	`reviewerId` int NOT NULL,
	`decision` enum('APPROVED','REJECTED') NOT NULL,
	`rationale` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviewDecisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflowExecutions` (
	`id` varchar(36) NOT NULL,
	`requestId` varchar(36) NOT NULL,
	`adapter` enum('deterministic_mock','invoke_llm') NOT NULL,
	`promptVersion` varchar(48) NOT NULL,
	`modelName` varchar(160),
	`draftText` text NOT NULL,
	`citedSources` text NOT NULL,
	`limitations` text NOT NULL,
	`uncertaintyFlags` text NOT NULL,
	`validationSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflowExecutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `audit_events_project_created_idx` ON `auditEvents` (`projectId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `drafting_requests_project_state_idx` ON `draftingRequests` (`projectId`,`state`);--> statement-breakpoint
CREATE INDEX `project_members_user_idx` ON `projectMembers` (`userId`);--> statement-breakpoint
CREATE INDEX `released_artifacts_request_idx` ON `releasedArtifacts` (`requestId`);--> statement-breakpoint
CREATE INDEX `review_decisions_request_idx` ON `reviewDecisions` (`requestId`);--> statement-breakpoint
CREATE INDEX `workflow_executions_request_idx` ON `workflowExecutions` (`requestId`);
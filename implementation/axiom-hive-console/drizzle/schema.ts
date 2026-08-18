/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { sql } from "drizzle-orm";
import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { actionCategoryValues, evidenceStateValues, sensitivityValues, workflowStateValues, workspaceRoles } from "../shared/governance";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectMembers = mysqlTable(
  "projectMembers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("projectId", { length: 36 }).notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", workspaceRoles).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    projectUserUnique: uniqueIndex("project_members_project_user_unique").on(table.projectId, table.userId),
    userIndex: index("project_members_user_idx").on(table.userId),
  }),
);

export const policyVersions = mysqlTable(
  "policyVersions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("projectId", { length: 36 }).notNull(),
    version: varchar("version", { length: 48 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    policyJson: text("policyJson").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ projectVersionUnique: uniqueIndex("policy_project_version_unique").on(table.projectId, table.version) }),
);

export const draftingRequests = mysqlTable(
  "draftingRequests",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("projectId", { length: 36 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    intendedUse: text("intendedUse").notNull(),
    sensitivity: mysqlEnum("sensitivity", sensitivityValues).notNull(),
    actionCategory: mysqlEnum("actionCategory", actionCategoryValues).notNull(),
    sourceInputs: text("sourceInputs").notNull(),
    policyVersionId: varchar("policyVersionId", { length: 36 }),
    state: mysqlEnum("state", workflowStateValues).default("DRAFT_REQUEST").notNull(),
    requiresHumanReview: boolean("requiresHumanReview").default(true).notNull(),
    requiresPreGenerationApproval: boolean("requiresPreGenerationApproval").default(false).notNull(),
    preGenerationApprovedBy: int("preGenerationApprovedBy"),
    preGenerationApprovedAt: timestamp("preGenerationApprovedAt"),
    preGenerationRationale: text("preGenerationRationale"),
    submittedBy: int("submittedBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ projectStateIndex: index("drafting_requests_project_state_idx").on(table.projectId, table.state) }),
);

export const workflowExecutions = mysqlTable(
  "workflowExecutions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    requestId: varchar("requestId", { length: 36 }).notNull(),
    adapter: mysqlEnum("adapter", ["deterministic_mock", "invoke_llm"]).notNull(),
    promptVersion: varchar("promptVersion", { length: 48 }).notNull(),
    modelName: varchar("modelName", { length: 160 }),
    draftText: text("draftText").notNull(),
    citedSources: text("citedSources").notNull(),
    limitations: text("limitations").notNull(),
    uncertaintyFlags: text("uncertaintyFlags").notNull(),
    validationSummary: text("validationSummary"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ requestIndex: index("workflow_executions_request_idx").on(table.requestId) }),
);

export const reviewDecisions = mysqlTable(
  "reviewDecisions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    requestId: varchar("requestId", { length: 36 }).notNull(),
    reviewerId: int("reviewerId").notNull(),
    decision: mysqlEnum("decision", ["APPROVED", "REJECTED"]).notNull(),
    rationale: text("rationale").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ requestIndex: index("review_decisions_request_idx").on(table.requestId) }),
);

export const releasedArtifacts = mysqlTable(
  "releasedArtifacts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    requestId: varchar("requestId", { length: 36 }).notNull(),
    version: varchar("version", { length: 48 }).notNull(),
    format: mysqlEnum("format", ["markdown", "json"]).notNull(),
    content: text("content").notNull(),
    evidenceState: mysqlEnum("evidenceState", evidenceStateValues).default("released").notNull(),
    limitations: text("limitations").notNull(),
    digest: varchar("digest", { length: 64 }).notNull(),
    releasedBy: int("releasedBy").notNull(),
    releasedAt: timestamp("releasedAt").defaultNow().notNull(),
  },
  table => ({ requestIndex: index("released_artifacts_request_idx").on(table.requestId) }),
);

export const auditEvents = mysqlTable(
  "auditEvents",
  {
    eventOrder: int("eventOrder").notNull(),
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("projectId", { length: 36 }).notNull(),
    requestId: varchar("requestId", { length: 36 }),
    actorUserId: int("actorUserId").notNull(),
    eventType: varchar("eventType", { length: 120 }).notNull(),
    fromState: mysqlEnum("fromState", workflowStateValues),
    toState: mysqlEnum("toState", workflowStateValues),
    payloadHash: varchar("payloadHash", { length: 64 }).notNull(),
    previousHash: varchar("previousHash", { length: 64 }).notNull(),
    integrityHash: varchar("integrityHash", { length: 64 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    projectEventOrderUnique: uniqueIndex("audit_events_project_order_unique").on(table.projectId, table.eventOrder),
    projectCreatedIndex: index("audit_events_project_created_idx").on(table.projectId, table.eventOrder),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

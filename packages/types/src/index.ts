// Shared wire types between extension, api, and web.
// Keep dependency-free — no Prisma imports.

export type EventType =
  | 'HEARTBEAT'
  | 'EDIT'
  | 'FOCUS'
  | 'BLUR'
  | 'IDLE'
  | 'RESUME'
  | 'PAUSE'
  | 'FILE_OPEN'
  | 'FILE_SAVE'
  | 'BRANCH_SWITCH'
  | 'COMMIT';

/**
 * Payload attached to a COMMIT event's `metadata.commit`. The extension reads it
 * from the VS Code git API right after HEAD changes; the API upserts a Commit row
 * and immediately links it to the most recent matching CodingSession.
 */
export interface CommitPayload {
  sha: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
  committedAt: string;
  parents?: string[];
  additions?: number;
  deletions?: number;
  filesChanged?: number;
}

export interface ActivityEventInput {
  /** ISO timestamp */
  timestamp: string;
  eventType: EventType;
  repositoryRemoteHash?: string;
  repositoryName?: string;
  branchName?: string;
  languageId?: string;
  /** seconds of active editor work this event covers */
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}

export interface ActivityBatch {
  clientId: string;
  events: ActivityEventInput[];
}

export interface CodingSessionDTO {
  id: string;
  startedAt: string;
  endedAt: string;
  activeSeconds: number;
  idleSeconds: number;
  repositoryId: string | null;
  branchName: string | null;
  primaryLanguage: string | null;
}

export interface TodayReportDTO {
  date: string;
  totalActiveSeconds: number;
  sessions: CodingSessionDTO[];
  repositories: Array<{ id: string; name: string; seconds: number }>;
  branches: Array<{ name: string; seconds: number }>;
  languages: Array<{ id: string; seconds: number }>;
  commits: Array<{ sha: string; message: string; committedAt: string }>;
  summary?: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  user: { id: string; email: string; name: string | null };
}

/** Confidence scoring for commit attribution (S3SSN.md §11). */
export const ATTRIBUTION = {
  SAME_REPO: 0.4,
  SAME_BRANCH: 0.25,
  SAME_AUTHOR: 0.2,
  WITHIN_2H: 0.1,
  MATCHING_LANG: 0.05,
  AUTO_LINK_THRESHOLD: 0.6,
} as const;

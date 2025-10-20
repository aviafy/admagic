export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
}

export enum SubmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FLAGGED = 'flagged',
  REJECTED = 'rejected',
}

export enum ModerationDecision {
  APPROVED = 'approved',
  FLAGGED = 'flagged',
  REJECTED = 'rejected',
}

export enum AuditLogAction {
  SUBMISSION_CREATED = 'submission_created',
  MODERATION_COMPLETED = 'moderation_completed',
  MODERATION_ERROR = 'moderation_error',
}

export const CONTENT_CONSTANTS = {
  MAX_TEXT_LENGTH: 10000,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

export declare enum ContentType {
    TEXT = "text",
    IMAGE = "image"
}
export declare enum SubmissionStatus {
    PENDING = "pending",
    APPROVED = "approved",
    FLAGGED = "flagged",
    REJECTED = "rejected"
}
export declare enum ModerationDecision {
    APPROVED = "approved",
    FLAGGED = "flagged",
    REJECTED = "rejected"
}
export declare enum AuditLogAction {
    SUBMISSION_CREATED = "submission_created",
    MODERATION_COMPLETED = "moderation_completed",
    MODERATION_ERROR = "moderation_error"
}
export declare const CONTENT_CONSTANTS: {
    readonly MAX_TEXT_LENGTH: 10000;
    readonly MAX_IMAGE_SIZE: number;
    readonly SUPPORTED_IMAGE_FORMATS: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
};

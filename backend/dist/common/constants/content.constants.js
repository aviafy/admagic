"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTENT_CONSTANTS = exports.AuditLogAction = exports.ModerationDecision = exports.SubmissionStatus = exports.ContentType = void 0;
var ContentType;
(function (ContentType) {
    ContentType["TEXT"] = "text";
    ContentType["IMAGE"] = "image";
})(ContentType || (exports.ContentType = ContentType = {}));
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["PENDING"] = "pending";
    SubmissionStatus["APPROVED"] = "approved";
    SubmissionStatus["FLAGGED"] = "flagged";
    SubmissionStatus["REJECTED"] = "rejected";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
var ModerationDecision;
(function (ModerationDecision) {
    ModerationDecision["APPROVED"] = "approved";
    ModerationDecision["FLAGGED"] = "flagged";
    ModerationDecision["REJECTED"] = "rejected";
})(ModerationDecision || (exports.ModerationDecision = ModerationDecision = {}));
var AuditLogAction;
(function (AuditLogAction) {
    AuditLogAction["SUBMISSION_CREATED"] = "submission_created";
    AuditLogAction["MODERATION_COMPLETED"] = "moderation_completed";
    AuditLogAction["MODERATION_ERROR"] = "moderation_error";
})(AuditLogAction || (exports.AuditLogAction = AuditLogAction = {}));
exports.CONTENT_CONSTANTS = {
    MAX_TEXT_LENGTH: 10000,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024,
    SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};
//# sourceMappingURL=content.constants.js.map
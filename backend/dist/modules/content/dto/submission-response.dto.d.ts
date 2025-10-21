import { SubmissionStatus, ContentType } from '../../../common/constants';
import { AIDecision } from '../../../common/interfaces';
export declare class SubmissionResponseDto {
    id: string;
    status: SubmissionStatus;
    contentType: ContentType;
    aiDecision?: AIDecision;
    createdAt: string;
    updatedAt: string;
}
export declare class SubmitResponseDto {
    submissionId: string;
    status: SubmissionStatus;
    message: string;
}

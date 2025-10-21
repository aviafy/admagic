import { SubmissionStatus, ContentType } from '../../../common/constants';
import { AIDecision } from '../../../common/interfaces';

export class SubmissionResponseDto {
  id!: string;
  status!: SubmissionStatus;
  contentType!: ContentType;
  aiDecision?: AIDecision;
  createdAt!: string;
  updatedAt!: string;
}

export class SubmitResponseDto {
  submissionId!: string;
  status!: SubmissionStatus;
  message!: string;
}

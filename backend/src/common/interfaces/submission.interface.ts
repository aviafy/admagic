import { ContentType, SubmissionStatus } from '../constants';
import { AIDecision } from './moderation-result.interface';

export interface Submission {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_text?: string;
  content_url?: string;
  status: SubmissionStatus;
  ai_decision?: AIDecision;
  created_at: string;
  updated_at: string;
}

export interface CreateSubmissionData {
  userId: string;
  contentType: ContentType;
  contentText?: string;
  contentUrl?: string;
}

export interface UpdateSubmissionData {
  status: SubmissionStatus;
  aiDecision: AIDecision;
}

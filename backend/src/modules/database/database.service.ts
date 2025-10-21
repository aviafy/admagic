import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CreateSubmissionData,
  UpdateSubmissionData,
  Submission,
} from '../../common/interfaces';
import { SubmissionStatus, AuditLogAction } from '../../common/constants';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.key');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Database service initialized');
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async createSubmission(data: CreateSubmissionData): Promise<Submission> {
    try {
      const { data: submission, error } = await this.supabase
        .from('content_submissions')
        .insert({
          user_id: data.userId,
          content_type: data.contentType,
          content_text: data.contentText,
          content_url: data.contentUrl,
          status: SubmissionStatus.PENDING,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating submission', error);
        throw error;
      }

      this.logger.log(`Submission created: ${submission.id}`);
      return submission;
    } catch (error) {
      this.logger.error('Failed to create submission', error);
      throw error;
    }
  }

  async updateSubmission(
    id: string,
    data: UpdateSubmissionData,
  ): Promise<Submission> {
    try {
      const { data: submission, error } = await this.supabase
        .from('content_submissions')
        .update({
          status: data.status,
          ai_decision: data.aiDecision,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error updating submission ${id}`, error);
        throw error;
      }

      this.logger.log(`Submission updated: ${id} - Status: ${data.status}`);
      return submission;
    } catch (error) {
      this.logger.error(`Failed to update submission ${id}`, error);
      throw error;
    }
  }

  async getSubmission(id: string): Promise<Submission> {
    try {
      const { data, error } = await this.supabase
        .from('content_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Error getting submission ${id}`, error);
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error(`Failed to get submission ${id}`, error);
      throw error;
    }
  }

  async createAuditLog(
    submissionId: string,
    action: AuditLogAction,
    details: any,
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('audit_logs').insert({
        submission_id: submissionId,
        action,
        details,
      });

      if (error) {
        this.logger.error(`Error creating audit log for ${submissionId}`, error);
        throw error;
      }

      this.logger.debug(`Audit log created: ${submissionId} - ${action}`);
    } catch (error) {
      this.logger.error(`Failed to create audit log for ${submissionId}`, error);
      // Don't throw - audit logs shouldn't break the main flow
    }
  }
}

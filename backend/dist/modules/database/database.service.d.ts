import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateSubmissionData, UpdateSubmissionData, Submission } from '../../common/interfaces';
import { AuditLogAction } from '../../common/constants';
export declare class DatabaseService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    getClient(): SupabaseClient;
    createSubmission(data: CreateSubmissionData): Promise<Submission>;
    updateSubmission(id: string, data: UpdateSubmissionData): Promise<Submission>;
    getSubmission(id: string): Promise<Submission>;
    createAuditLog(submissionId: string, action: AuditLogAction, details: any): Promise<void>;
}

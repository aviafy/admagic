"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const constants_1 = require("../../common/constants");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(DatabaseService_1.name);
        const supabaseUrl = this.configService.get('supabase.url');
        const supabaseKey = this.configService.get('supabase.key');
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and key are required');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.logger.log('Database service initialized');
    }
    getClient() {
        return this.supabase;
    }
    async createSubmission(data) {
        try {
            const { data: submission, error } = await this.supabase
                .from('content_submissions')
                .insert({
                user_id: data.userId,
                content_type: data.contentType,
                content_text: data.contentText,
                content_url: data.contentUrl,
                status: constants_1.SubmissionStatus.PENDING,
            })
                .select()
                .single();
            if (error) {
                this.logger.error('Error creating submission', error);
                throw error;
            }
            this.logger.log(`Submission created: ${submission.id}`);
            return submission;
        }
        catch (error) {
            this.logger.error('Failed to create submission', error);
            throw error;
        }
    }
    async updateSubmission(id, data) {
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
        }
        catch (error) {
            this.logger.error(`Failed to update submission ${id}`, error);
            throw error;
        }
    }
    async getSubmission(id) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get submission ${id}`, error);
            throw error;
        }
    }
    async createAuditLog(submissionId, action, details) {
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
        }
        catch (error) {
            this.logger.error(`Failed to create audit log for ${submissionId}`, error);
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map
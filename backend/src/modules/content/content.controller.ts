import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { ContentService } from './content.service';
import { SubmitContentDto, SubmitResponseDto, SubmissionResponseDto } from './dto';

@Controller('content')
@UseGuards(JwtAuthGuard) // Protect all content routes with JWT authentication
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(private readonly contentService: ContentService) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Stricter limit: 5 submissions per minute
  async submitContent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() submitDto: SubmitContentDto,
  ): Promise<SubmitResponseDto> {
    this.logger.log(`Received content submission from authenticated user: ${user.userId}`);
    // Use authenticated user ID instead of request body
    return await this.contentService.submitContent(user.userId, submitDto);
  }

  @Get('status/:id')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // More lenient: 30 status checks per minute
  async getStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<SubmissionResponseDto> {
    this.logger.log(`User ${user.userId} checking status for submission: ${id}`);
    return await this.contentService.getSubmissionStatus(id);
  }
}

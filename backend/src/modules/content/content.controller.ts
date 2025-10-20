import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { SubmitContentDto, SubmitResponseDto, SubmissionResponseDto } from './dto';

@Controller('content')
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(private readonly contentService: ContentService) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  async submitContent(
    @Body() submitDto: SubmitContentDto,
  ): Promise<SubmitResponseDto> {
    this.logger.log(`Received content submission from user: ${submitDto.userId}`);
    return await this.contentService.submitContent(submitDto);
  }

  @Get('status/:id')
  @HttpCode(HttpStatus.OK)
  async getStatus(@Param('id') id: string): Promise<SubmissionResponseDto> {
    this.logger.log(`Received status request for submission: ${id}`);
    return await this.contentService.getSubmissionStatus(id);
  }
}

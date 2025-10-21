import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  ValidateIf,
  MaxLength,
  IsUrl,
  Matches,
} from 'class-validator';
import { ContentType, AIProvider } from '../../../common/constants';

/**
 * DTO for content submission
 * Note: userId is now extracted from JWT token, not from request body
 */
export class SubmitContentDto {
  @IsEnum(ContentType, {
    message: 'Content type must be either text or image',
  })
  contentType!: ContentType;

  @ValidateIf((o) => o.contentType === ContentType.TEXT)
  @IsNotEmpty({ message: 'Content text is required for text submissions' })
  @IsString()
  @MaxLength(10000, { message: 'Text content cannot exceed 10000 characters' })
  contentText?: string;

  @ValidateIf((o) => o.contentType === ContentType.IMAGE)
  @IsNotEmpty({ message: 'Content URL is required for image submissions' })
  @IsString()
  @Matches(
    /^(https?:\/\/.+|data:image\/.+;base64,.+)$/,
    { message: 'Content URL must be a valid URL (http/https) or base64 data URL (data:image/...)' }
  )
  contentUrl?: string;

  @IsOptional()
  @IsEnum(AIProvider, {
    message: 'AI provider must be either openai or gemini',
  })
  aiProvider?: AIProvider;

  // userId is no longer in DTO - extracted from JWT token via @CurrentUser() decorator
}

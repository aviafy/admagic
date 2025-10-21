import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from "class-validator";

export class GenerateImageDto {
  @IsString()
  @MinLength(1, { message: "Prompt cannot be empty" })
  @MaxLength(1000, { message: "Prompt is too long (max 1000 characters)" })
  prompt!: string;

  @IsOptional()
  @IsEnum(["1024x1024", "1792x1024", "1024x1792"])
  size?: "1024x1024" | "1792x1024" | "1024x1792";

  @IsOptional()
  @IsEnum(["standard", "hd"])
  quality?: "standard" | "hd";
}

export class GenerateImageResponseDto {
  imageUrl!: string;
  revisedPrompt?: string;
}

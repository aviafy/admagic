import { Module } from "@nestjs/common";
import { ContentController } from "./content.controller";
import { ContentService } from "./content.service";
import { ImageGenerationService } from "./services/image-generation.service";
import { ModerationModule } from "../moderation/moderation.module";

@Module({
  imports: [ModerationModule],
  controllers: [ContentController],
  providers: [ContentService, ImageGenerationService],
})
export class ContentModule {}

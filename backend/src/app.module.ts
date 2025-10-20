import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration, validationSchema } from './config';
import { DatabaseModule } from './modules/database/database.module';
import { ContentModule } from './modules/content/content.module';
import { ModerationModule } from './modules/moderation/moderation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    DatabaseModule,
    ModerationModule,
    ContentModule,
  ],
})
export class AppModule {}

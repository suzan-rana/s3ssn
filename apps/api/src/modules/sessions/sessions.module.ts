import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SessionizerProcessor } from './sessionizer.processor';
import { SummariesModule } from '../summaries/summaries.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'sessionizer' }), SummariesModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionizerProcessor],
  exports: [SessionsService],
})
export class SessionsModule {}

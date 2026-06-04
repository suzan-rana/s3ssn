import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AttributionService } from './attribution.service';
import { AttributionController } from './attribution.controller';
import { AttributionProcessor } from './attribution.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'attribution' })],
  controllers: [AttributionController],
  providers: [AttributionService, AttributionProcessor],
  exports: [AttributionService],
})
export class AttributionModule {}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'sessionizer' }, { name: 'attribution' }),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}

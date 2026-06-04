import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

const url = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: url.hostname,
        port: Number(url.port || 6379),
        password: url.password || undefined,
      },
    }),
    BullModule.registerQueue(
      { name: 'sessionizer' },
      { name: 'attribution' },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}

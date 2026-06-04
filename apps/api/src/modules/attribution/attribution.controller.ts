import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

@UseGuards(AuthGuard('jwt'))
@Controller('attribution')
export class AttributionController {
  constructor(@InjectQueue('attribution') private readonly queue: Queue) {}

  @Post('repositories/:id/rescore')
  async rescore(@Param('id') id: string) {
    const job = await this.queue.add(
      'score',
      { repositoryId: id },
      { jobId: `score:${id}`, removeOnComplete: 100, removeOnFail: 100 },
    );
    return { jobId: job.id, queued: true };
  }
}

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SessionsService } from './sessions.service';

export interface SessionizerJob {
  userId: string;
  hours?: number;
}

@Processor('sessionizer')
export class SessionizerProcessor extends WorkerHost {
  private readonly logger = new Logger(SessionizerProcessor.name);

  constructor(private readonly sessions: SessionsService) {
    super();
  }

  async process(job: Job<SessionizerJob>): Promise<{ created: number }> {
    const { userId, hours = 24 } = job.data;
    this.logger.log(`sessionize user=${userId} hours=${hours}`);
    return this.sessions.rebuild(userId, hours);
  }
}

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AttributionService } from './attribution.service';

@Processor('attribution')
export class AttributionProcessor extends WorkerHost {
  constructor(private readonly svc: AttributionService) {
    super();
  }

  async process(job: Job<{ repositoryId: string }>): Promise<{ links: number }> {
    return this.svc.scoreRepo(job.data.repositoryId);
  }
}

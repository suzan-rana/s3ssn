import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionsService } from './sessions.service';
import { SummariesService } from '../summaries/summaries.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { SessionizerJob } from './sessionizer.processor';

@UseGuards(AuthGuard('jwt'))
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly svc: SessionsService,
    private readonly summaries: SummariesService,
    private readonly prisma: PrismaService,
    @InjectQueue('sessionizer') private readonly queue: Queue<SessionizerJob>,
  ) {}

  @Get()
  list(
    @CurrentUser() u: { sub: string },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.svc.list(u.sub, from, to);
  }

  @Post('rebuild')
  async rebuild(@CurrentUser() u: { sub: string }, @Query('hours') hours?: string) {
    const job = await this.queue.add(
      'rebuild',
      { userId: u.sub, hours: Number(hours ?? 24) },
      { removeOnComplete: 100, removeOnFail: 100 },
    );
    return { jobId: job.id, queued: true };
  }

  @Post(':id/summary')
  async generateSummary(@CurrentUser() u: { sub: string }, @Param('id') id: string) {
    const exists = await this.prisma.codingSession.findFirst({
      where: { id, userId: u.sub },
      select: { id: true },
    });
    if (!exists) throw new ForbiddenException();
    const { summary, source } = await this.summaries.forSession(u.sub, id);
    await this.prisma.codingSession.update({
      where: { id },
      data: { summary, summarySource: source, summaryEditedAt: null },
    });
    return { summary, source };
  }

  @Patch(':id/summary')
  async updateSummary(
    @CurrentUser() u: { sub: string },
    @Param('id') id: string,
    @Body() body: { summary: string },
  ) {
    const exists = await this.prisma.codingSession.findFirst({
      where: { id, userId: u.sub },
      select: { id: true },
    });
    if (!exists) throw new ForbiddenException();
    const summary = (body.summary ?? '').trim();
    return this.prisma.codingSession.update({
      where: { id },
      data: {
        summary: summary || null,
        summarySource: summary ? 'user' : null,
        summaryEditedAt: summary ? new Date() : null,
      },
    });
  }
}

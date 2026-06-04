import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { SummariesService } from './summaries.service';

@UseGuards(AuthGuard('jwt'))
@Controller('summaries')
export class SummariesController {
  constructor(private readonly svc: SummariesService) {}

  @Get('standup')
  standup(@CurrentUser() u: { sub: string }, @Query('date') date?: string) {
    return this.svc.standup(u.sub, date);
  }
}

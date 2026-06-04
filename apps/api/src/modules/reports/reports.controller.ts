import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReportsService } from './reports.service';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('today')
  today(@CurrentUser() u: { sub: string }, @Query('date') date?: string) {
    return this.svc.today(u.sub, date);
  }

  @Get('weekly')
  weekly(@CurrentUser() u: { sub: string }, @Query('weekOf') weekOf?: string) {
    return this.svc.weekly(u.sub, weekOf);
  }
}

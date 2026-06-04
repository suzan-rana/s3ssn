import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService, type Window } from './leaderboard.service';

const WINDOWS: Window[] = ['today', 'week', 'all'];

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly svc: LeaderboardService) {}

  @Get()
  list(@Query('window') window?: string) {
    const w: Window = (WINDOWS.includes(window as Window) ? window : 'week') as Window;
    return this.svc.list(w);
  }
}

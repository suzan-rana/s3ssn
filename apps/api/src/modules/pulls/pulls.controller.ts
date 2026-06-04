import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('pulls')
export class PullsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: { sub: string }) {
    return this.prisma.pullRequest.findMany({
      where: { repository: { workspace: { members: { some: { userId: u.sub } } } } },
      orderBy: { openedAt: 'desc' },
      take: 100,
    });
  }
}

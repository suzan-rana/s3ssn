import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('commits')
export class CommitsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(
    @CurrentUser() u: { sub: string },
    @Query('repositoryId') repositoryId?: string,
  ) {
    return this.prisma.commit.findMany({
      where: {
        repositoryId,
        repository: { workspace: { members: { some: { userId: u.sub } } } },
      },
      orderBy: { committedAt: 'desc' },
      take: 500,
      include: { sessions: true, repository: { select: { id: true, name: true } } },
    });
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: { sub: string }) {
    return this.prisma.integration.findMany({
      where: { userId: u.sub },
      select: { id: true, provider: true, workspaceId: true, scope: true, createdAt: true },
    });
  }
}

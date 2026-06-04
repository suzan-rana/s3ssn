import { Body, Controller, ForbiddenException, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: { sub: string }, @Query('workspaceId') workspaceId?: string) {
    return this.prisma.repository.findMany({
      where: {
        workspace: {
          members: { some: { userId: u.sub } },
          ...(workspaceId ? { id: workspaceId } : {}),
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  @Patch(':id')
  async update(
    @CurrentUser() u: { sub: string },
    @Param('id') id: string,
    @Body() body: { context?: string | null },
  ) {
    // Authorize: user must be a member of this repo's workspace
    const repo = await this.prisma.repository.findUnique({
      where: { id },
      select: { id: true, workspace: { select: { members: { where: { userId: u.sub }, select: { id: true } } } } },
    });
    if (!repo || repo.workspace.members.length === 0) {
      throw new ForbiddenException();
    }
    const context =
      typeof body.context === 'string' ? body.context.trim() || null : body.context ?? null;
    return this.prisma.repository.update({
      where: { id },
      data: { context },
    });
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';

class CreateProjectDto {
  @IsString() workspaceId!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @IsString() description?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('projects')
export class ProjectsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: { sub: string }) {
    return this.prisma.project.findMany({
      where: { workspace: { members: { some: { userId: u.sub } } } },
      include: { client: true },
    });
  }

  @Post()
  create(@Body() dto: CreateProjectDto): Promise<unknown> {
    return this.prisma.project.create({ data: dto });
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, MinLength } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { WorkspacesService } from './workspaces.service';

class CreateWorkspaceDto {
  @IsString() @MinLength(2) name!: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly svc: WorkspacesService) {}

  @Get()
  list(@CurrentUser() u: { sub: string }) {
    return this.svc.list(u.sub);
  }

  @Post()
  create(@CurrentUser() u: { sub: string }, @Body() dto: CreateWorkspaceDto) {
    return this.svc.create(u.sub, dto.name);
  }
}

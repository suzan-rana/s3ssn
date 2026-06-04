import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';

class CreateClientDto {
  @IsString() workspaceId!: string;
  @IsString() name!: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('clients')
export class ClientsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: { sub: string }) {
    return this.prisma.client.findMany({
      where: { workspace: { members: { some: { userId: u.sub } } } },
    });
  }

  @Post()
  create(@Body() dto: CreateClientDto): Promise<unknown> {
    return this.prisma.client.create({ data: dto });
  }
}

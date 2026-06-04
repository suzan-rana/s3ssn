import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, name: string) {
    return this.prisma.workspace.create({
      data: {
        name,
        ownerId: userId,
        members: { create: { userId, role: 'OWNER' } },
      },
    });
  }
}

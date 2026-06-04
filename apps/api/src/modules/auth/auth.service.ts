import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(email: string, password: string, name?: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        name: name ?? null,
        credential: { create: { passwordHash } },
      },
    });
    const workspaceName = name?.trim() ? `${name.trim()}'s workspace` : 'Personal workspace';
    await this.prisma.workspace.create({
      data: {
        name: workspaceName,
        ownerId: user.id,
        members: { create: { userId: user.id, role: 'OWNER' } },
      },
    });
    return this.issue(user.id, user.email, user.name);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { credential: true },
    });
    if (!user?.credential) throw new UnauthorizedException();
    const ok = await bcrypt.compare(password, user.credential.passwordHash);
    if (!ok) throw new UnauthorizedException();
    return this.issue(user.id, user.email, user.name);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
  }

  private async issue(sub: string, email: string, name: string | null) {
    const accessToken = await this.jwt.signAsync({ sub, email });
    return { accessToken, user: { id: sub, email, name } };
  }
}

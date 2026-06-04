import { BadRequestException, Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { GithubService } from './github.service';

@Controller('integrations/github')
export class GithubOauthController {
  constructor(private readonly gh: GithubService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('authorize-url')
  authorizeUrl(@CurrentUser() user: { sub: string }, @Query('workspaceId') workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('workspaceId required');
    return { url: this.gh.buildAuthorizeUrl(user.sub, workspaceId) };
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code || !state) throw new BadRequestException('missing code/state');
    await this.gh.completeOauth(code, state);
    const webOrigin = process.env.WEB_ORIGIN?.split(',')[0] ?? 'http://localhost:3000';
    return res.redirect(`${webOrigin}/settings?github=connected`);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sync')
  async sync(@CurrentUser() user: { sub: string }, @Query('workspaceId') workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('workspaceId required');
    return this.gh.syncAll(user.sub, workspaceId);
  }
}

import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { GithubWebhookController } from './github-webhook.controller';
import { GithubOauthController } from './github-oauth.controller';
import { GithubService } from './github.service';

@Module({
  controllers: [IntegrationsController, GithubWebhookController, GithubOauthController],
  providers: [GithubService],
  exports: [GithubService],
})
export class IntegrationsModule {}

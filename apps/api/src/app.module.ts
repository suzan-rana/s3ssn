import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { RepositoriesModule } from './modules/repositories/repositories.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ActivityModule } from './modules/activity/activity.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { CommitsModule } from './modules/commits/commits.module';
import { PullsModule } from './modules/pulls/pulls.module';
import { ReportsModule } from './modules/reports/reports.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AttributionModule } from './modules/attribution/attribution.module';
import { SummariesModule } from './modules/summaries/summaries.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 240 }]),
    PrismaModule,
    QueueModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    RepositoriesModule,
    ProjectsModule,
    ClientsModule,
    ActivityModule,
    SessionsModule,
    CommitsModule,
    PullsModule,
    ReportsModule,
    IntegrationsModule,
    AttributionModule,
    SummariesModule,
    LeaderboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

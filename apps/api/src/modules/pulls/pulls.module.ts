import { Module } from '@nestjs/common';
import { PullsController } from './pulls.controller';

@Module({ controllers: [PullsController] })
export class PullsModule {}

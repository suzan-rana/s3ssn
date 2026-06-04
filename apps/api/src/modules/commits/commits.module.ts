import { Module } from '@nestjs/common';
import { CommitsController } from './commits.controller';

@Module({ controllers: [CommitsController] })
export class CommitsModule {}

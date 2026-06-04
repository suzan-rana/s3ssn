import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Allow, ArrayMaxSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { EventType } from '@s3ssn/types';
import { ActivityService } from './activity.service';
import { CurrentUser } from '../auth/current-user.decorator';

class ActivityEventDto {
  @IsString() timestamp!: string;
  @IsString() eventType!: EventType;
  @IsOptional() @IsString() repositoryRemoteHash?: string;
  @IsOptional() @IsString() repositoryName?: string;
  @IsOptional() @IsString() branchName?: string;
  @IsOptional() @IsString() languageId?: string;
  @IsOptional() durationSeconds?: number;
  /** Free-form metadata bag; COMMIT events carry { commit: CommitPayload } here. */
  @Allow() metadata?: Record<string, unknown>;
}

class ActivityBatchDto {
  @IsString() clientId!: string;
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ActivityEventDto)
  events!: ActivityEventDto[];
}

@UseGuards(AuthGuard('jwt'))
@Controller('activity')
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Post('batch')
  ingest(@CurrentUser() user: { sub: string }, @Body() dto: ActivityBatchDto) {
    return this.activity.ingest(user.sub, dto);
  }
}

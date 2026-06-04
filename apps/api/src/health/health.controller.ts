import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { ok: true, service: 's3ssn-api', ts: new Date().toISOString() };
  }
}

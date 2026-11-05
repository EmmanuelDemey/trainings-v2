import { Controller, Get } from '@nestjs/common';

/** Hit every 10 s by the load balancer: nobody wants its traces. */
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}

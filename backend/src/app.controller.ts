import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({
    description: 'API health status',
    schema: {
      example: {
        app: 'LeaveApp API',
        status: 'ok',
        version: '0.1.0',
      },
    },
  })
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}

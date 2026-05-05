import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      app: 'LeaveApp API',
      status: 'ok',
      version: '0.1.0',
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { MailMessage } from './mail.types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  send(message: MailMessage): Promise<void> {
    this.logger.log(`Mock mail to ${message.to}: ${message.subject}`);
    return Promise.resolve();
  }
}

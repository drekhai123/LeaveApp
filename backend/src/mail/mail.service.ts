import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import { MailMessage } from './mail.types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string | null;
  private hasLoggedMissingSmtpConfig = false;
  private hasLoggedMissingFrom = false;

  constructor(private readonly configService: ConfigService) {
    const configuredFrom = this.configService.get<string>('MAIL_FROM')?.trim();
    const smtpUser = this.configService.get<string>('SMTP_USER')?.trim();
    this.from = configuredFrom || smtpUser || null;
    if (!configuredFrom && this.from) {
      this.logger.warn(
        'MAIL_FROM missing; using SMTP_USER as from address fallback',
      );
    }
    this.transporter = this.createSmtpTransporter();
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.transporter) {
      if (!this.hasLoggedMissingSmtpConfig) {
        this.logger.warn(
          'SMTP config missing; skipping all outgoing email until configured',
        );
        this.hasLoggedMissingSmtpConfig = true;
      }
      return;
    }
    if (!this.from) {
      if (!this.hasLoggedMissingFrom) {
        this.logger.warn(
          'MAIL_FROM missing and no SMTP_USER fallback; skipping outgoing email',
        );
        this.hasLoggedMissingFrom = true;
      }
      return;
    }

    const toList = Array.isArray(message.to) ? message.to : [message.to];
    this.logger.debug(
      `Sending email via SMTP to=${toList.join(',')} subject="${message.subject}"`,
    );

    await this.sendViaSmtp(message, toList, this.from);
  }

  private createSmtpTransporter(): Transporter | null {
    const host = this.configService.get<string>('SMTP_HOST')?.trim();
    const portValue = this.configService.get<string>('SMTP_PORT')?.trim();
    const user = this.configService.get<string>('SMTP_USER')?.trim();
    const pass = this.configService.get<string>('SMTP_PASS')?.trim();
    const secureValue = this.configService
      .get<string>('SMTP_SECURE')
      ?.trim()
      .toLowerCase();
    const secure = secureValue === 'true';

    if (!host || !portValue || !user || !pass) {
      return null;
    }

    const port = Number(portValue);
    if (!Number.isFinite(port) || port <= 0) {
      this.logger.warn(`SMTP_PORT invalid ("${portValue}"), skipping SMTP setup`);
      return null;
    }

    return createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  private async sendViaSmtp(
    message: MailMessage,
    toList: string[],
    from: string,
  ): Promise<void> {
    try {
      const info = await this.transporter!.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      this.logger.debug(
        `SMTP accepted email to=${toList.join(',')} messageId=${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `SMTP send failed to=${toList.join(',')} subject="${message.subject}"`,
        (error as Error)?.stack,
      );
    }
  }
}

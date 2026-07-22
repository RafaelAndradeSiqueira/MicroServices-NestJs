// src/mail/mail.service.ts

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UserCreatedEvent } from './dto/user-created.event';

@Injectable()
export class MailService {

  constructor(
    @InjectPinoLogger(MailService.name)
    private readonly logger: PinoLogger,
  ) {}

  async sendWelcomeEmail(user: UserCreatedEvent) {
    this.logger.info(
      {
        correlationId: user.correlationId,
        userId: user.id,
        to: user.email,
      },
      'sending welcome email',
    );

  }

}

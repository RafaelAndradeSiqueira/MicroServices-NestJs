// src/mail/mail.consumer.ts

import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { MailService } from './mail.service';
import { UserCreatedEvent } from './dto/user-created.event';

@Controller()
export class MailConsumer {

  constructor(
    private readonly mailService: MailService,
    @InjectPinoLogger(MailConsumer.name)
    private readonly logger: PinoLogger,
  ) {}

  @EventPattern('user.created')
  async handleUserCreated(
    @Payload() user: UserCreatedEvent,
  ) {


    const log = this.logger.logger.child({ correlationId: user.correlationId });

    log.info({ userId: user.id }, 'user.created event received');

    const startedAt = Date.now();
    try {
      await this.mailService.sendWelcomeEmail(user);
      log.info(
        { userId: user.id, durationMs: Date.now() - startedAt },
        'welcome email sent',
      );
    } catch (err) {

      log.error({ userId: user.id, err }, 'failed to send welcome email');
      throw err; 
    }
  }

}

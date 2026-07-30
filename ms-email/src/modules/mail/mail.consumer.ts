

import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Counter, Histogram } from 'prom-client';
import { MailService } from './mail.service';
import { UserCreatedEvent } from './dto/user-created.event';

@Controller()
export class MailConsumer {

  constructor(
    private readonly mailService: MailService,
    @InjectPinoLogger(MailConsumer.name)
    private readonly logger: PinoLogger,

    @InjectMetric('events_consumed_total')
    private readonly consumed: Counter<string>,

    @InjectMetric('event_processing_duration_seconds')
    private readonly duration: Histogram<string>,
  ) {}

  @EventPattern('user.created')
  async handleUserCreated(
    @Payload() user: UserCreatedEvent,
  ) {


    const log = this.logger.logger.child({ correlationId: user.correlationId });

    log.info({ userId: user.id }, 'evento user.created recebido');

    const stopTimer = this.duration.startTimer({ pattern: 'user.created' });
    const startedAt = Date.now();
    try {
      await this.mailService.sendWelcomeEmail(user);
      this.consumed.inc({ pattern: 'user.created', status: 'success' });
      log.info(
        { userId: user.id, durationMs: Date.now() - startedAt },
        'email de boas-vindas enviado',
      );
    } catch (err) {

      this.consumed.inc({ pattern: 'user.created', status: 'error' });
      log.error({ userId: user.id, err }, 'falha ao enviar email de boas-vindas');
      throw err;
    } finally {
      stopTimer();
    }
  }

}

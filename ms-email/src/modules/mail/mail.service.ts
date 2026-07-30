import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UserCreatedEvent } from './dto/user-created.event';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    @InjectPinoLogger(MailService.name)
    private readonly logger: PinoLogger,
    private readonly mailerService: MailerService,
  ) {}

  async sendWelcomeEmail(user: UserCreatedEvent) {
    this.logger.info(
      {
        correlationId: user.correlationId,
        userId: user.id,
        to: user.email,
      },
      'enviando email de boas-vindas',
    );

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Email de Boas-Vindas',
        html: `<h1>Seja bem-vindo, ${user.nome}</h1>`,
      });

      this.logger.info(
        {
          correlationId: user.correlationId,
          userId: user.id,
          to: user.email,
        },
        'email de boas-vindas enviado',
      );
    } catch (err) {
      this.logger.error(
        {
          err,
          correlationId: user.correlationId,
          userId: user.id,
          to: user.email,
        },
        'falha ao enviar email de boas-vindas',
      );

      throw new Error('Erro ao enviar email'); 
    }
  }
}
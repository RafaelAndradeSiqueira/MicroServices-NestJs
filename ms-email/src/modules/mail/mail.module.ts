

import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { MailConsumer } from './mail.consumer';
import { MailService } from './mail.service'
import { MailerModule } from '@nestjs-modules/mailer';


@Module({
  imports:[
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
    }),
  ],
  controllers: [
    MailConsumer,
  ],
  providers: [
    MailService,

    makeCounterProvider({
      name: 'events_consumed_total',
      help: 'Total de eventos consumidos do RabbitMQ',
      labelNames: ['pattern', 'status'],
    }),

    makeHistogramProvider({
      name: 'event_processing_duration_seconds',
      help: 'Duracao do processamento de um evento',
      labelNames: ['pattern'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    }),
  ],
})
export class MailModule {}
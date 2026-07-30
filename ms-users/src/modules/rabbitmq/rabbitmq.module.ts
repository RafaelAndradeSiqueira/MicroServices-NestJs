import { Module } from '@nestjs/common';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { RabbitMQProvider } from './rabbitmq.provider';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  providers: [
    RabbitMQProvider,
    RabbitMQService,

    makeCounterProvider({
      name: 'events_published_total',
      help: 'Total de eventos publicados no RabbitMQ',
      labelNames: ['pattern', 'status'],
    }),
  ],

  exports: [
    RabbitMQService,
  ],
})
export class RabbitMQModule {}
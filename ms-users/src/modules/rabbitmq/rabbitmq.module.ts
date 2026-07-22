// src/rabbitmq/rabbitmq.module.ts

import { Module } from '@nestjs/common';
import { RabbitMQProvider } from './rabbitmq.provider';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  providers: [
    RabbitMQProvider,
    RabbitMQService,
  ],

  exports: [
    RabbitMQService,
  ],
})
export class RabbitMQModule {}
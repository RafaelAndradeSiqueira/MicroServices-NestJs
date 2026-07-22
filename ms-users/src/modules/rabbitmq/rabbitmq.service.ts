// src/rabbitmq/rabbitmq.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {

  constructor(
    @Inject('RABBITMQ_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  async publish(pattern: string, data: any) {

    return this.client.emit(pattern, data);

  }

}
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService {

  constructor(
    @Inject('RABBITMQ_CLIENT')
    private readonly client: ClientProxy,

    @InjectMetric('events_published_total')
    private readonly published: Counter<string>,
  ) {}

  async publish(pattern: string, data: any) {

    try {
      const result = await lastValueFrom(this.client.emit(pattern, data), {
        defaultValue: undefined,
      });
      this.published.inc({ pattern, status: 'success' });
      return result;
    } catch (err) {
      this.published.inc({ pattern, status: 'error' });
      throw err;
    }

  }

}
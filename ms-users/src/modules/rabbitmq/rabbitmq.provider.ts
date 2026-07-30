import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const RabbitMQProvider = {
  provide: 'RABBITMQ_CLIENT',

  inject: [ConfigService],

  useFactory: (configService: ConfigService) => {
    const url = configService.get<string>('RABBITMQ_URL');
    const queue = configService.get<string>('RABBITMQ_QUEUE');

    if (!url || !queue) {
      throw new Error('RABBITMQ_URL e RABBITMQ_QUEUE devem estar definidos no .env');
    }

    return ClientProxyFactory.create({
      transport: Transport.RMQ,

      options: {
        urls: [url],

        queue: queue,

        queueOptions: {
          durable: true,
        },
      },
    });
  },
};

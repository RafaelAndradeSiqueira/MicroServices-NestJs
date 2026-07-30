import './config/tracing';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

async function bootstrap() {

      const url = process.env.RABBITMQ_URL;
      const queue = process.env.RABBITMQ_QUEUE;

      if (!url || !queue) {
        throw new Error('RABBITMQ_URL e RABBITMQ_QUEUE devem estar definidos no .env');
      }

      const app = await NestFactory.create(AppModule, { bufferLogs: true });

      app.useLogger(app.get(Logger));

      app.connectMicroservice<MicroserviceOptions>(
        {
          transport: Transport.RMQ,
          options: {
              urls: [url],
              queue: queue,
               queueOptions: {
                 durable: true,
               },
          }
        },
        { inheritAppConfig: true },
      )

      await app.startAllMicroservices();

      await app.listen(process.env.METRICS_PORT ?? 3002);

      app.get(Logger).log('Mail Service conectado ao RabbitMQ');


}
bootstrap();

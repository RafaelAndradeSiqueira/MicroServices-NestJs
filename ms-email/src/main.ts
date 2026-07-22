import 'dotenv/config';
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

      const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
          // bufferLogs: segura os logs do boot até o Pino estar pronto.
          bufferLogs: true,
          transport: Transport.RMQ,
          options: {
              urls: [url],
              queue: queue,
               queueOptions: {
                 durable: true,
               },
          }
        }
      )

      // Troca o logger nativo pelo Pino (mesma ideia do ms-users).
      app.useLogger(app.get(Logger));

      await app.listen();

      // Agora usamos o logger, não console.log — sai em JSON estruturado.
      app.get(Logger).log('Mail Service conectado ao RabbitMQ');


}
bootstrap();

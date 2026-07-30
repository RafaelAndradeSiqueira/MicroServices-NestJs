import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './modules/mail/mail.module';
import { loggerConfig } from './config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(loggerConfig),
    PrometheusModule.register({
      path: '/metrics',
      defaultLabels: { app: 'ms-email' },
      defaultMetrics: { enabled: true },
    }),
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { featureModules } from './modules';
import { globalModules } from './modules/global';
import { loggerConfig } from './config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(loggerConfig),
    PrometheusModule.register({
      path: '/metrics',
      defaultLabels: { app: 'ms-users' },
      defaultMetrics: { enabled: true },
    }),
    ...globalModules,
    ...featureModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

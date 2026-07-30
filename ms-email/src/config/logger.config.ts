import { IncomingMessage } from 'http';
import { Params } from 'nestjs-pino';

export const loggerConfig: Params = {
  pinoHttp: {
    base: { service: 'ms-email' },
    level: process.env.LOG_LEVEL ?? 'info',
    autoLogging: {
      ignore: (req: IncomingMessage) => req.url === '/metrics',
    },

    transport: {
      targets: [
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
              },
            }
          : {
              target: 'pino/file',
              options: { destination: 1 },
            },
        {
          target: 'pino/file',
          options: {
            destination: './logs/app.log',
            mkdir: true,
          },
        },
      ],
    },
  },
};

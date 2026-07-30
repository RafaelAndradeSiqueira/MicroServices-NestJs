import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';
import { Params } from 'nestjs-pino';

export const loggerConfig: Params = {
  pinoHttp: {

    base: { service: 'ms-users' },

    genReqId: (req: IncomingMessage, res: ServerResponse) => {
      const existing = req.headers['x-correlation-id'];
      const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
      res.setHeader('x-correlation-id', id);
      return id;
    },

    level: process.env.LOG_LEVEL ?? 'info',

    quietReqLogger: true,

    autoLogging: {
      ignore: (req: IncomingMessage) => req.url === '/metrics',
    },

    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', '*.password'],
      censor: '[REDACTED]',
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

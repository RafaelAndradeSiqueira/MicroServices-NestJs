import 'dotenv/config';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const otlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'ms-users',
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '0.0.1',
    'deployment.environment.name': process.env.NODE_ENV ?? 'development',
  }),

  traceExporter: new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
  }),

  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) =>
        req.url?.startsWith('/metrics') ?? false,
    }),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new AmqplibInstrumentation(),
    new PinoInstrumentation(),
    new PgInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

sdk.start();

const shutdown = () => {
  void sdk.shutdown().finally(() => process.exit(0));
};

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

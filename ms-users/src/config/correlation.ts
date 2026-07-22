import { storage } from 'nestjs-pino/storage';

export function getCorrelationId(): string | undefined {
  const store = storage.getStore();
  return store?.logger.bindings()?.reqId as string | undefined;
}

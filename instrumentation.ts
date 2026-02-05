import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const sdk = new NodeSDK({
  instrumentations: [new PrismaInstrumentation()],
});

sdk.start();

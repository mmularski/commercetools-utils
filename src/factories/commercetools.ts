import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { AuthMiddlewareOptions, ClientBuilder, HttpMiddlewareOptions, QueueMiddlewareOptions } from '@commercetools/sdk-client-v2';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { config } from '../common';
import { MissingConfigurationError } from '../errors';

let clientCache: undefined | ByProjectKeyRequestBuilder;

export const getClient = async () => {
  if (clientCache) {
    return clientCache;
  }

  if (!config) {
    throw new MissingConfigurationError();
  }

  const { authUri, baseUri, clientId, clientSecret, projectKey, scopes } = config.commercetools;
  const authMiddlewareOptions: AuthMiddlewareOptions = {
    host: authUri,
    projectKey: projectKey,
    credentials: {
      clientId,
      clientSecret,
    },
    scopes,
  };

  const httpMiddlewareOptions: HttpMiddlewareOptions = {
    host: baseUri,
    enableRetry: true,
    retryConfig: {
      maxRetries: 10,
      retryOnAbort: true,
      backoff: true,
      retryDelay: 500,
      maxDelay: 1000 * 60 * 5 // 5 minutes
    }
  };

  const queueMiddlewareOptions: QueueMiddlewareOptions = {
    concurrency: 1000
  };

  const ctpClient = new ClientBuilder()
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withQueueMiddleware(queueMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build();

  clientCache = createApiBuilderFromCtpClient(ctpClient).withProjectKey({ projectKey });

  return clientCache;
};

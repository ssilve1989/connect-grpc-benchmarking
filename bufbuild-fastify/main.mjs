import { EchoService } from '../gen/v1/echo_service_connect.mjs';
import { connectNodeAdapter } from '@connectrpc/connect-node';
import { createServer } from 'http2';
import { fastify } from 'fastify';
import { fastifyConnectPlugin } from '@bufbuild/connect-fastify';

function routes(router) {
  return router.service(EchoService, {
    echo({ message }) {
      return { message };
    },
  });
}

// const server = createServer(connectNodeAdapter({ routes }));
const server = fastify({ http2: true });
await server.register(fastifyConnectPlugin, { routes });
await server.listen({ host: '0.0.0.0', port: 5000 });
console.log(`server listenting at`, 'port 5000');

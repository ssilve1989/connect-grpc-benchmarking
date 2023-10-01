// @ts-check
import { fastifyConnectPlugin } from '@bufbuild/connect-fastify';
import { fastify } from 'fastify';
import { EchoService } from '../gen/v1/echo_service_connect.mjs';

function routes(router) {
  return router.service(EchoService, {
    echo({ message }) {
      return { message };
    },
  });
}

// const server = createServer(connectNodeAdapter({ routes }));
const server = fastify({ http2: true, logger: false });
await server.register(fastifyConnectPlugin, { routes });
await server.listen({ host: '0.0.0.0', port: 5000 });
console.log(`server listenting at`, 'port 5000');

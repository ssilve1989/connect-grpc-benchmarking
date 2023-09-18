import { EchoService } from './gen/echo_service_connect.mjs';
import { fastify } from 'fastify';
import { fastifyConnectPlugin } from '@bufbuild/connect-fastify';

function routes(router) {
  return router.service(EchoService, {
    echo({ message }) {
      return { message };
    },
  });
}

const server = fastify({ http2: true });
await server.register(fastifyConnectPlugin, { routes });

server.get('/', (_, reply) => {
  reply.type('text/plain').send('Hi!');
});

await server.listen({ host: '0.0.0.0', port: 5000 });
console.log(`server listenting at`, server.addresses());

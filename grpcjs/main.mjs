import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'node:path';
import * as url from 'url';
import { echo } from './handlers.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, '..', 'echo', 'v1', 'echo_service.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const serviceDefinition = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
server.addService(serviceDefinition.echo.v1.EchoService.service, {
  echo,
});

server.bindAsync(
  '0.0.0.0:5000',
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`server listenting on port: ${port}`);
    server.start();
  }
);

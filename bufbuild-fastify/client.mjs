import { createPromiseClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-node';
import { EchoService } from '../gen/v1/echo_service_connect.mjs';

const transport = createConnectTransport({
  httpVersion: '2',
  baseUrl: 'http://localhost:5000',
});

async function main() {
  const client = createPromiseClient(EchoService, transport);
  const res = await client.echo({
    message: 'I feel happy.',
  });
  console.log(res.message);
}
void main();

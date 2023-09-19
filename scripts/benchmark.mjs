#!/usr/bin/env node
import { createPromiseClient } from '@connectrpc/connect';
import * as url from 'url';
import path from 'node:path';
import protoLoader from '@grpc/proto-loader';
import grpc from '@grpc/grpc-js';
import {
  createConnectTransport,
  createGrpcTransport,
} from '@connectrpc/connect-node';
import { interval, mergeMap, reduce, repeat, takeUntil, timer } from 'rxjs';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { EchoService } from '../gen/v1/echo_service_connect.mjs';

/**
 * @type Record<string, any>
 */
const args = yargs(hideBin(process.argv)).argv;

const {
  concurrency = 50,
  duration = 30,
  type = 'connect',
  'connect-client': connectClient = 'connect',
} = args;

function grpcJsBenchmark() {
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

  const EchoService =
    grpc.loadPackageDefinition(packageDefinition).echo.v1.EchoService;

  const client = new EchoService(
    'localhost:5000',
    grpc.credentials.createInsecure()
  );

  const request = () => {
    return new Promise((resolve, reject) => {
      const start = process.hrtime();
      client.echo({ message: 'Hello' }, (err) => {
        if (err) {
          reject(err);
          return;
        }
        return resolve({ duration: process.hrtime(start) });
      });
    });
  };

  const duration$ = timer(duration * 1000);
  const work$ = interval().pipe(
    mergeMap(request, concurrency),
    repeat(),
    takeUntil(duration$)
  );

  return work$;
}

function connectBenchmark() {
  const transport =
    connectClient === 'connect'
      ? createConnectTransport({
          httpVersion: '2',
          baseUrl: 'http://localhost:5000',
        })
      : createGrpcTransport({
          baseUrl: 'http://localhost:5000',
          httpVersion: '2',
        });

  const client = createPromiseClient(EchoService, transport);

  const request = async () => {
    const start = process.hrtime();
    await client.echo({ message: 'Hello' });
    return { duration: process.hrtime(start) };
  };

  const duration$ = timer(duration * 1000);
  const work$ = interval().pipe(
    mergeMap(request, concurrency),
    repeat(),
    takeUntil(duration$)
  );

  return work$;
}

function onNext(values) {
  const durations = values.map(([s, ns]) => s * 1e9 + ns);
  const sum = durations.reduce((a, b) => a + b);
  const avg = sum / durations.length;
  const avgMs = avg / 1e6;
  console.log(`[${type}] avg: ${avgMs.toFixed(4)}ms.`);
  process.exit(0);
}

const benchmark$ = (() => {
  switch (type) {
    case 'connect':
      return connectBenchmark();
    case 'grpc':
      return grpcJsBenchmark();
  }
})();

console.log(
  `Starting benchmark test over ${duration}s with ${concurrency} concurrent requests using ${type}`
);

benchmark$
  .pipe(
    reduce((acc, { duration }) => {
      acc.push(duration);
      return acc;
    }, [])
  )
  .subscribe({
    next: onNext,
    error: console.error,
    complete: () => console.log('complete'),
  });

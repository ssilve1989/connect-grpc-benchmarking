#!/usr/bin/env bash

set -e

# run server in background
node ./bufbuild-fastify/main.mjs &
serverPid=$!

# run client benchmark script in foreground
./scripts/benchmark.mjs --type grpc "$@"

# when it exits exit the server
kill $serverPid

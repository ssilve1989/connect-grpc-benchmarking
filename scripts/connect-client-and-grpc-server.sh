#!/usr/bin/env bash

set -e

# run server in background
node ./grpcjs/main.mjs &
serverPid=$!

# run client benchmark script in foreground
./scripts/benchmark.mjs --type connect --connect-client grpc

# when it exits exit the server
kill $serverPid

#!/bin/bash

ghz --proto ./packages/echo/echo_service.proto \
--insecure \
-n 100000 \
--call echo.EchoService/Echo \
--async localhost:5000

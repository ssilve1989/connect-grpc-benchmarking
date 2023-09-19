#!/bin/bash

ghz --proto ./echo/v1/echo_service.proto \
--insecure \
-n 25000 \
-c 1000 \
--call echo.v1.EchoService/Echo \
--async localhost:5000

package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/http"
	"time"

	echov1 "foo/gen/v1"
	echoconnect "foo/gen/v1/echoconnect"

	"connectrpc.com/connect"
	"golang.org/x/net/http2"
)

func newInsecureClient() *http.Client {
	return &http.Client{
		Transport: &http2.Transport{
			AllowHTTP: true,
			DialTLS: func(network, addr string, _ *tls.Config) (net.Conn, error) {
				// If you're also using this client for non-h2c traffic, you may want
				// to delegate to tls.Dial if the network isn't TCP or the addr isn't
				// in an allowlist.
				return net.Dial(network, addr)
			},
			// Don't forget timeouts!
		},
	}
}

var client = echoconnect.NewEchoServiceClient(
	newInsecureClient(),
	"https://localhost:5000",
)

func run(channel chan int64) {
	start := time.Now()

	request := connect.NewRequest[echov1.EchoRequest](&echov1.EchoRequest{Message: "foo"})

	_, err := client.Echo(
		context.Background(),
		request,
	)

	end := time.Now()

	duration := end.Sub(start).Milliseconds()

	if err != nil {
		log.Println(err)
	}

	channel <- duration
}

func main() {
	n := 100000
	resultChan := make(chan int64)

	for i := 0; i < n; i++ {
		go run(resultChan)
	}

	results := []int64{}

	for {
		select {
		case duration := <-resultChan:
			results = append(results, duration)
		}

		if len(results) == n {
			break
		}
	}

	sum := int64(0)

	for _, duration := range results {
		sum += duration
	}

	avg := sum / int64(len(results))

	fmt.Println(avg)
}

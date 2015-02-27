#!/bin/bash
docker build -t "mtgserver" . && \
docker run -v $(pwd)/app/:/app -p 9090:9090 -ti mtgserver
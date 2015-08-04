#docker run -p 9000 -v $(pwd)/app/:/app -ti mtg python3 /app/server.py
FROM ubuntu:14.04

ADD bin/iojs-setup.sh /iojs.sh

RUN apt-get update && \
    apt-get -y install build-essential libssl-dev curl && \
    bash /iojs.sh 

EXPOSE 9090

ENTRYPOINT /app/start.sh
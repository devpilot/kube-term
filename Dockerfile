FROM ubuntu:20.04

ENV NODE_VERSION=16.14.0
ENV KUBECTL_VERSION=1.23.10

WORKDIR /app
RUN apt-get update && apt-get -y install rlwrap curl python3 build-essential && apt-get clean && rm -rf /var/lib/apt-get/lists/*
RUN curl -SLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" && tar -xf "node-v${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-component=1 && rm "node-v${NODE_VERSION}-linux-x64.tar.xz"
RUN curl -LO "https://dl.k8s.io/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl" && chmod +x kubectl && mkdir -p /.kube/cache && chown 65532:65532 /.kube/cache
COPY package*.json /app/
RUN npm ci --only=production
COPY ./ /app/
EXPOSE 3444
USER 65532:65532
CMD [ "npm", "start" ]

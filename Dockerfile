FROM debian:jessie

# Install node sources
RUN apt-get -qq update \
  && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash

# Install node and pygments (for syntax highlighting)
RUN apt-get -qq update \
  && DEBIAN_FRONTEND=noninteractive apt-get -qq install -y --no-install-recommends build-essential python-pygments git ca-certificates nodejs \
  && rm -rf /var/lib/apt/lists/*

# Download and install hugo
ENV HUGO_VERSION 0.20.7
ENV HUGO_BINARY hugo_${HUGO_VERSION}_Linux-64bit.deb

ADD https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/${HUGO_BINARY} /tmp/hugo.deb
RUN dpkg -i /tmp/hugo.deb \
  && rm /tmp/hugo.deb

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install --verbose
EXPOSE 3000

CMD [ "npm", "start"]

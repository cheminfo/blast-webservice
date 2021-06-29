ARG BLAST_VERSION=2.11.0

FROM node:14-alpine as builder


RUN mkdir /blast
ARG BLAST_VERSION
RUN wget -qO- "ftp://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/${BLAST_VERSION}/ncbi-blast-${BLAST_VERSION}+-x64-linux.tar.gz" | tar xvz -C /blast

WORKDIR /blast-webservice

COPY . .
RUN npm ci
RUN npm run build

FROM node:14
ARG BLAST_VERSION
ENV BLAST_DIRECTORY /blast/ncbi-blast-${BLAST_VERSION}+/bin
ENV NODE_ENV production

RUN npm ci

WORKDIR /blast-webservice-source

COPY --from=builder /blast /blast
COPY --from=builder /blast-webservice/lib ./lib

CMD ["npm", "start"]
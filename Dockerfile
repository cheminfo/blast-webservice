FROM node:14-alpine as builder

ARG BLAST_VERSION

WORKDIR /blast
RUN wget -qO- "ftp://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/${BLAST_VERSION}/ncbi-blast-${BLAST_VERSION}+-x64-linux.tar.gz" | tar xvz -C ./


WORKDIR /blast-webservice

COPY . .
RUN npm ci
RUN npm run build

FROM node:14
ARG BLAST_VERSION
ENV NODE_ENV production

WORKDIR /blast-webservice-source

COPY . .
RUN npm ci


COPY --from=builder /blast /blast
COPY --from=builder /blast-webservice/lib ./lib

ENV BLAST_DIRECTORY /blast/ncbi-blast-${BLAST_VERSION}+/bin
CMD ["npm", "start"]
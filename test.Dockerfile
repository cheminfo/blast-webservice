ARG BLAST_VERSION=2.11.0

FROM node:14


WORKDIR /blast
ARG BLAST_VERSION
RUN wget -qO- "ftp://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/${BLAST_VERSION}/ncbi-blast-${BLAST_VERSION}+-x64-linux.tar.gz" | tar xvz -C /blast
ENV BLAST_DIRECTORY_PATH /blast/ncbi-blast-${BLAST_VERSION}+/bin

WORKDIR /blast-webservice-source

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npm", "test"]
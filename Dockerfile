# base image for dev and prod release
FROM alpine:3.9 AS base
WORKDIR /opt/app
RUN apk add --no-cache nodejs npm
COPY .deps ./
RUN [ ! -s .deps ] || apk --no-cache add $(cat .deps)

# build dependancies
FROM base AS build
RUN apk add --no-cache build-base python bash git
COPY .build-deps ./
RUN [ ! -s .build-deps ] || apk --no-cache add $(cat .build-deps)
COPY package*.json ./
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production
RUN cp -R node_modules node_modules.prod
RUN npm install
COPY . .

FROM base AS release
COPY --from=build /opt/app/node_modules.prod ./node_modules
COPY . .

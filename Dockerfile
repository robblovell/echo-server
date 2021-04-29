FROM node:12-alpine as nodebuild
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm test

FROM node:10-alpine as noderun
WORKDIR /app
# The commented out lines below would be needed in the context 
# of an application that had production dependencies. They are 
# left here for reference.
#COPY package*.json ./
#RUN npm install --only=production
COPY --from=nodebuild /app/src/server.js ./
#RUN rm -rf package*.json
EXPOSE 8080
ENTRYPOINT node /app/server.js

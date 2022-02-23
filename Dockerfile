FROM alpine:3.15 AS client
RUN apk update && apk --no-cache upgrade && apk --no-cache add nodejs npm
WORKDIR /app
COPY client/package*.json client/jsconfig.json ./
RUN npm install ci --only=production
COPY client/public/ ./public/
COPY client/src/ ./src/
RUN npm run build

FROM alpine:3.15
RUN apk update && apk --no-cache upgrade && apk --no-cache add nodejs npm git
WORKDIR /app
COPY package*.json ./
RUN npm install ci --only=production
COPY . .
COPY --from=client /app/build /app/client/build

CMD [ "node", "index.js" ]

# docker build -t www.planetaguru.com.ar/navegador:1.0 .
# docker push www.planetaguru.com.ar/navegador:1.0
# docker run -p 6815:3000 -d --name navegador www.planetaguru.com.ar/navegador:1.0

## en caso que querer poner la imagen en el cluster
# kubectl -n fabricio rollout restart deployment navegador

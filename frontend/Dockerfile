FROM --platform=linux/arm64/v8 node:22.14.0-alpine3.21 as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build -- --configuration=production

FROM --platform=linux/arm64/v8 nginx:stable-alpine3.20

COPY --from=builder /app/dist/appbito /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

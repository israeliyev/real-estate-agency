# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build:prod

# Runtime stage
FROM nginx:alpine
COPY --from=build /app/dist/ngx-admin /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 0080
CMD ["nginx", "-g", "daemon off;"]

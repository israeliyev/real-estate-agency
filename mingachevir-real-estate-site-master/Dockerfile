# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build for production
RUN npm run build:prod

# Runtime stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist/mingachevir-real-estate-agency-fe/browser /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

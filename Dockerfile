# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Build produces static output in /app/dist

# ---- Runtime Stage (HTTP Server) ----
FROM httpd:2.4 AS runtime
COPY --from=builder /app/dist /usr/local/apache2/htdocs/
EXPOSE 80

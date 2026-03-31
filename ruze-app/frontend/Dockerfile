# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Install envsubst (comes with gettext)
RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html

# Store the template; entrypoint will render it with actual port
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Runtime: render template → real config, then start nginx
ARG BACKEND_PORT=8000
ENV BACKEND_PORT=${BACKEND_PORT}

CMD ["/bin/sh", "-c", \
  "envsubst '${BACKEND_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]


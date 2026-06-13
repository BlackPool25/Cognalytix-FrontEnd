FROM nginx:alpine
RUN apk add --no-cache curl
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD curl -sf http://localhost:80/ || exit 1
EXPOSE 80

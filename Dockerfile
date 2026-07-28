FROM nginx:alpine

COPY . /usr/share/nginx/html

RUN rm -f /usr/share/nginx/html/Dockerfile \
    && rm -f /usr/share/nginx/html/.gitignore \
    && rm -rf /usr/share/nginx/html/.git \
    && rm -f /usr/share/nginx/html/wd.zip

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

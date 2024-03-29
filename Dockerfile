FROM keymetrics/pm2:latest-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node
COPY --chown=node:node . .
EXPOSE 8080
CMD [ "pm2-runtime", "start", "ecosystem.docker.config.js", "--env", "production" ]

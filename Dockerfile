FROM node:8
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
WORKDIR /home/apps/
ADD package*.json ./
ADD ./node_modules ./node_modules/
ADD ./app.js ./
CMD [ "node", "app.js" ]
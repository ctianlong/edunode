FROM node:8
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
WORKDIR /home/apps/
COPY package*.json ./
RUN npm install
COPY ./app.js ./
CMD [ "node", "app.js" ]
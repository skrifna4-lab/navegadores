FROM node:20-slim

WORKDIR /app

COPY package.json .
RUN npm install

RUN npx playwright install chromium

COPY . .

EXPOSE 3000

CMD ["npm","start"]

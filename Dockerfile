FROM node:20-slim

WORKDIR /app

COPY package.json .
RUN npm install
RUN npx playwright install chromium

COPY . .

EXPOSE 6530

CMD ["npm","start"]

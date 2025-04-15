FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --no-optional --legacy-peer-deps
RUN npm install @rollup/rollup-linux-x64-gnu

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]

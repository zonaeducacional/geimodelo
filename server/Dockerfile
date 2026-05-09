FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Cria a pasta de uploads caso não exista
RUN mkdir -p uploads/profiles uploads/logos
EXPOSE 5000
CMD ["npm", "start"]

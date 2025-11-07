FROM node:18-alpine

# Installa dipendenze di sistema necessarie per Baileys
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Crea directory app
WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci --only=production

# Copia il resto dei file
COPY . .

# Crea directory per auth_info (persistente)
RUN mkdir -p /app/auth_info

# Espone porta
EXPOSE 3001

# Avvia il bot
CMD ["node", "whatsapp-service.js"]

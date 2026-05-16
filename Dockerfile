FROM node:20-alpine

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos TODAS las dependencias (incluyendo Vite en devDependencies)
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto por defecto de Vite en modo preview/dev (suele ser 5173 o 4173)
EXPOSE 5173

# Arrancamos la aplicación usando el servidor integrado de Vite mapeado a toda la red
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
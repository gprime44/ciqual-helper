# Étape 1 : Construction
FROM node:20 AS build
WORKDIR /app

# On vide tout et on repart de zéro
COPY package.json ./
RUN npm install --legacy-peer-deps

# On vérifie physiquement
RUN ls -l node_modules/.bin/react-scripts

# Copie
COPY . .

# Build
ENV SKIP_PREFLIGHT_CHECK=true
RUN ./node_modules/.bin/react-scripts build

# Étape 2 : Serveur
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

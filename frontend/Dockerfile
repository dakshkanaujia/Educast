# EduCast frontend — Expo (React Native) served as web
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# App source
COPY . .

# Expo web dev server
EXPOSE 8081

ENV EXPO_NO_TELEMETRY=1

# Bind to all interfaces so the container port is reachable from the host.
CMD ["npx", "expo", "start", "--web", "--port", "8081"]

# ---- Build stage ----
FROM golang:1.25-alpine AS build

WORKDIR /app

# Cache dependencies first
COPY go.mod go.sum ./
RUN go mod download

# Build the binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /educast .

# ---- Runtime stage ----
FROM alpine:3.20

WORKDIR /app

# wget is used by the compose healthcheck; ca-certs for good measure
RUN apk add --no-cache ca-certificates wget

COPY --from=build /educast /app/educast

EXPOSE 8080

CMD ["/app/educast"]

# Usa una imagen oficial de Go como base para la compilación
FROM golang:1.24.1 AS builder

# Configura el directorio de trabajo dentro del contenedor
# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY . .
RUN go mod download

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/reference/dockerfile/#copy

# Build
RUN go build -o build/bin/mines_microservice cmd/mines_microservice/main.go

# Optional:
# To bind to a TCP port, runtime parameters must be supplied to the docker command.
# But we can document in the Dockerfile what ports
# the application is going to listen on by default.
# https://docs.docker.com/reference/dockerfile/#expose
EXPOSE 8082

# Run
CMD ["build/bin/mines_microservice"]
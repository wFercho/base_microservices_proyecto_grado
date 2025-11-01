
build-docker:
	@echo "Building Docker images without cache..."
	@docker compose build --no-cache

run-docker: stop-docker build-docker
	@echo "Starting Docker containers for development..."
	@docker compose up -d
	
stop-docker-volumes:
	@echo "Stopping Docker containers and removing volumes..."
	@docker compose down -v || true

stop-docker:
	@echo "Stopping all Docker containers..."
	@docker compose down

reset-docker: stop-docker-volumes run-docker
	@echo "Docker Comopose has been reset!"

.PHONY: build-docker run-docker stop-docker-volumes stop-docker reset-docker
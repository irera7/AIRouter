.PHONY: help install dev build start stop clean db-migrate db-seed test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

dev: ## Start development server with Docker Compose
	docker-compose up -d postgres redis
	npm run dev

dev-docker: ## Start all services with Docker Compose
	docker-compose up

build: ## Build the application
	npm run build

start: ## Start production server
	docker-compose up -d

stop: ## Stop all services
	docker-compose down

clean: ## Clean up containers and volumes
	docker-compose down -v
	rm -rf node_modules dist

db-generate: ## Generate database migrations
	npm run db:generate

db-migrate: ## Run database migrations
	npm run db:migrate

db-seed: ## Seed the database
	npm run db:seed

db-studio: ## Open Drizzle Studio
	npm run db:studio

test: ## Run tests
	npm test

test-coverage: ## Run tests with coverage
	npm run test:coverage

logs: ## View logs
	docker-compose logs -f backend

ps: ## Show running containers
	docker-compose ps

shell: ## Open shell in backend container
	docker-compose exec backend sh


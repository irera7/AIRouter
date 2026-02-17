# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Provider connectors (OpenAI, Anthropic)
- Routing engine
- Response caching
- React dashboard
- SDKs (Node.js, Python)

## [0.1.0] - 2024-01-01

### Added
- Initial project setup with TypeScript and Fastify
- Database schema with Drizzle ORM
  - Users and organizations (multi-tenant)
  - API key management
  - Providers configuration
  - Request logging
  - Billing events
  - Routing policies
- Authentication system
  - User registration and login
  - JWT token authentication
  - API key generation and validation
  - Permission management
- Fastify plugins
  - JWT authentication
  - API key authentication
  - CORS support
  - Rate limiting
- Docker Compose setup
  - PostgreSQL database
  - Redis cache
  - Backend service
  - Prometheus (optional)
  - Grafana (optional)
- Database migrations and seed scripts
- Comprehensive test suite with Vitest
- Development tooling
  - ESLint configuration
  - Prettier formatting
  - Makefile for common tasks
- Documentation
  - README with quick start guide
  - Architecture documentation
  - Contributing guidelines
  - API documentation

### Security
- Password hashing with bcrypt
- API key hashing before storage
- JWT token expiration
- Rate limiting per API key
- Input validation with Zod

## [0.0.1] - 2024-01-01

### Added
- Project initialization
- Basic project structure
- Package.json with dependencies


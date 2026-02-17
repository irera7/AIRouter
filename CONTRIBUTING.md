# Contributing to AIRouter

Thank you for your interest in contributing to AIRouter! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/airouter.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `npm test`
6. Commit your changes: `git commit -m "feat: add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Start database services
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

## Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Format code
npm run format
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add OpenAI provider connector
fix: resolve rate limiting issue
docs: update API documentation
test: add tests for auth service
```

## Testing

- Write tests for all new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md with your changes
3. Ensure all tests pass
4. Request review from maintainers
5. Address any feedback
6. Once approved, your PR will be merged

## Code Review Guidelines

- Be respectful and constructive
- Focus on the code, not the person
- Explain your reasoning
- Be open to feedback

## Project Structure

```
AIRouter/
├── backend/
│   └── src/
│       ├── db/              # Database schemas and migrations
│       ├── modules/         # Feature modules
│       ├── plugins/         # Fastify plugins
│       └── utils/           # Utility functions
├── frontend/                # React dashboard (coming soon)
├── infra/                   # Infrastructure configs
└── tests/                   # Test files
```

## Module Structure

Each module should follow this structure:

```
modules/
└── feature-name/
    ├── feature.service.ts    # Business logic
    ├── feature.routes.ts     # API routes
    ├── feature.types.ts      # TypeScript types
    └── feature.spec.ts       # Tests
```

## Database Changes

1. Create migration: `npm run db:generate`
2. Review generated migration in `backend/src/db/migrations/`
3. Run migration: `npm run db:migrate`
4. Update seed data if needed

## Adding a New Provider

1. Create connector in `backend/src/modules/providers/connectors/`
2. Implement `ProviderConnector` interface
3. Add provider configuration to seed data
4. Write tests
5. Update documentation

## Questions?

- Open an issue for bugs or feature requests
- Join our Discord (coming soon)
- Email: dev@airouter.dev

## License

By contributing, you agree that your contributions will be licensed under the MIT License.


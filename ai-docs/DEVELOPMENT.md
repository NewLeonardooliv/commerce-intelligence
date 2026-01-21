# Development Guide

## Prerequisites

- Bun >= 1.0.0
- Node.js >= 18 (for compatibility checks)
- Git

## Setup

1. **Clone and Install**
```bash
bun install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your configuration values.

3. **Start Development Server**
```bash
bun dev
```

The server will start with hot-reload enabled at `http://localhost:3000`

## Available Scripts

- `bun dev` - Start development server with hot reload
- `bun start` - Start production server
- `bun test` - Run unit tests
- `bun build` - Build for production

## Project Architecture

### Modular Design

Each feature is organized as an independent module:

```
modules/
  feature-name/
    feature-name.controller.ts  # HTTP layer
    feature-name.service.ts     # Business logic
    feature-name.schema.ts      # Validation
```

### Layers

1. **Controller Layer** - HTTP request/response handling
2. **Service Layer** - Business logic and orchestration
3. **Infrastructure Layer** - External services (AI, database)
4. **Shared Layer** - Common utilities and types

## Adding New Features

### 1. Create Module Structure

```bash
mkdir -p src/modules/feature-name
touch src/modules/feature-name/feature-name.controller.ts
touch src/modules/feature-name/feature-name.service.ts
touch src/modules/feature-name/feature-name.schema.ts
```

### 2. Define Types

Add types to `src/shared/types/feature-name.types.ts`

### 3. Implement Service

```typescript
class FeatureService {
  async doSomething() {
    // Business logic
  }
}

export const featureService = new FeatureService();
```

### 4. Create Controller

```typescript
import { Elysia } from 'elysia';

export const featureController = new Elysia({ prefix: '/feature' })
  .get('/', async () => {
    // Handler
  });
```

### 5. Register in App

```typescript
// src/app.ts
import { featureController } from '@modules/feature/feature.controller';

app.group('/api/v1', (app) =>
  app.use(featureController)
);
```

## Testing

### Unit Tests

```bash
bun test
```

### Manual Testing

Use the examples in `examples/requests.http` with REST Client extension or:

```bash
curl http://localhost:3000/api/v1/health
```

## Code Style

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types**: PascalCase (`UserData`)

### Import Order

1. External dependencies
2. Internal modules (using aliases)
3. Types
4. Relative imports

```typescript
import { Elysia } from 'elysia';
import { env } from '@config/env';
import type { User } from '@shared/types/user.types';
import { userService } from './user.service';
```

### No Comments

Write self-documenting code. Function and variable names should explain their purpose.

**Bad:**
```typescript
// Get user by ID
function get(id: string) { }
```

**Good:**
```typescript
function getUserById(id: string) { }
```

## Error Handling

Always use custom error classes:

```typescript
import { NotFoundError, ValidationError } from '@shared/errors/app-error';

if (!user) {
  throw new NotFoundError('User');
}

if (!isValid) {
  throw new ValidationError('Invalid email format');
}
```

## Type Safety

Never use `any` type. Use `unknown` and type guards:

```typescript
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Process data
  }
}
```

## Performance

- Use in-memory storage for development
- Implement caching for expensive operations
- Use async/await for I/O operations
- Avoid N+1 queries

## Security

- Validate all inputs
- Use environment variables for secrets
- Implement rate limiting
- Add authentication/authorization as needed

## Deployment

See deployment guides for:
- Bun standalone
- Docker
- Kubernetes
- Cloud platforms (Vercel, Railway, Fly.io)

## Troubleshooting

### Port Already in Use

```bash
lsof -ti:3000 | xargs kill -9
```

### Clear Cache

```bash
rm -rf node_modules
bun install
```

### Type Errors

```bash
bun tsc --noEmit
```

## Resources

- [Elysia Documentation](https://elysiajs.com)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

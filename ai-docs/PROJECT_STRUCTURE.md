# Project Structure

## Overview

This project follows a modular, feature-based architecture with clear separation of concerns.

## Directory Structure

```
commerce-intelligence/
├── src/
│   ├── app.ts                          # Application entry point
│   ├── config/                         # Configuration files
│   │   ├── env.ts                      # Environment variables
│   │   └── swagger.ts                  # Swagger/OpenAPI configuration
│   │
│   ├── modules/                        # Feature modules (business logic)
│   │   ├── health/                     # Health check module
│   │   │   ├── health.controller.ts    # HTTP endpoints
│   │   │   └── health.service.ts       # Business logic
│   │   │
│   │   ├── agents/                     # AI agents module
│   │   │   ├── agents.controller.ts    # HTTP endpoints
│   │   │   ├── agents.service.ts       # Business logic
│   │   │   └── agents.schema.ts        # Validation schemas
│   │   │
│   │   └── analytics/                  # Analytics module
│   │       ├── analytics.controller.ts # HTTP endpoints
│   │       ├── analytics.service.ts    # Business logic
│   │       └── analytics.schema.ts     # Validation schemas
│   │
│   ├── shared/                         # Shared resources
│   │   ├── errors/                     # Error handling
│   │   │   ├── app-error.ts           # Custom error classes
│   │   │   └── error-handler.ts       # Global error handler
│   │   │
│   │   ├── middlewares/                # Middlewares
│   │   │   ├── logger.middleware.ts    # Request/response logging
│   │   │   └── request-id.middleware.ts # Request ID generation
│   │   │
│   │   ├── types/                      # Type definitions
│   │   │   ├── api.types.ts           # API types
│   │   │   ├── agent.types.ts         # Agent types
│   │   │   └── analytics.types.ts     # Analytics types
│   │   │
│   │   ├── utils/                      # Utility functions
│   │   │   ├── id.util.ts             # ID generation
│   │   │   ├── response.util.ts       # Response helpers
│   │   │   └── date.util.ts           # Date utilities
│   │   │
│   │   └── interfaces/                 # Public interfaces
│   │       └── index.ts               # Exported types
│   │
│   └── infrastructure/                 # Infrastructure layer
│       ├── ai/                         # AI integration
│       │   ├── ai-provider.interface.ts
│       │   ├── mock-ai-provider.ts
│       │   └── ai-service.ts
│       │
│       └── storage/                    # Data storage
│           └── in-memory-storage.ts
│
├── examples/                           # Usage examples
│   ├── client.example.ts              # Eden Treaty client example
│   └── requests.http                  # HTTP requests examples
│
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript configuration
└── README.md                           # Project documentation
```

## Architecture Principles

### 1. Modular Design
Each feature is self-contained in its own module with clear boundaries.

### 2. Separation of Concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Schemas**: Define validation rules
- **Infrastructure**: External integrations (AI, database, cache)

### 3. Type Safety
Strong TypeScript typing throughout the application with no `any` types in production code.

### 4. Clean Code
- No comments (self-documenting code)
- Clear naming conventions
- Single responsibility principle
- DRY (Don't Repeat Yourself)

### 5. Error Handling
Centralized error handling with custom error classes and proper HTTP status codes.

### 6. Scalability
Easy to add new modules, endpoints, and features without affecting existing code.

## Module Structure

Each module follows this pattern:

```
module-name/
├── module-name.controller.ts    # HTTP layer
├── module-name.service.ts       # Business logic
└── module-name.schema.ts        # Validation schemas
```

## Adding New Modules

1. Create module folder in `src/modules/`
2. Create controller, service, and schema files
3. Register controller in `src/app.ts`
4. Export types in `src/shared/interfaces/`

## Path Aliases

TypeScript path aliases are configured for cleaner imports:

- `@/*` → `./src/*`
- `@config/*` → `./src/config/*`
- `@modules/*` → `./src/modules/*`
- `@shared/*` → `./src/shared/*`
- `@infrastructure/*` → `./src/infrastructure/*`

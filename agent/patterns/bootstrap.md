# Multi-Tenant MCP Server Core Library Bootstrap Pattern

## Overview

This document describes how to bootstrap a **core MCP server library** that exports a server factory for multi-tenant usage. This is the base library that implements your MCP tools and business logic. It can be run locally with `npm run dev` for development, and is designed to be wrapped by a separate deployment project that handles authentication, Docker containerization, and Cloud Run deployment.

**Two-Project Architecture:**
1. **Core Library** (this document): Implements MCP server factory, tools, and business logic
2. **Wrapper Server** (separate project): Adds JWT auth, platform integration, Docker, and deployment

## Core Library Principles

1. **Server Factory Pattern**: Export a factory function that creates isolated server instances
2. **No Authentication**: Core library doesn't handle auth (wrapper server does)
3. **Credential Injection**: Accept access tokens via factory parameters
4. **Type Safety**: Strong TypeScript typing throughout
5. **Modular Tools**: Each tool is self-contained and testable
6. **Library Exports**: Designed to be imported by wrapper projects
7. **ESM-First**: Modern ES modules with proper `.js` extensions
8. **Local Development**: Can run standalone with `npm run dev` using environment credentials

## Architecture Overview

**Core Library (this project):**
```
Server Factory Function
  ↓
Creates MCP Server Instance (per user)
  ↓
Registers Tools
  ↓
External API Client (with user's access token)
```

**Wrapper Server (separate project):**
```
Client Request (JWT)
  ↓
JWT Auth Provider (validates JWT → userId)
  ↓
Platform Token Resolver (userId → API token)
  ↓
Core Library Server Factory (creates server with token)
  ↓
MCP Server executes tools
```

## Project Structure

```
mcp-core-library/
├── src/
│   ├── server.ts                   # Standalone server (for local dev)
│   ├── server-factory.ts           # Factory function (for wrapper projects)
│   ├── client.ts                   # External API client wrapper
│   ├── types.ts                    # Shared type definitions
│   │
│   ├── tools/                      # Tool definitions
│   │   ├── index.ts                # Tool exports
│   │   ├── tool-one.ts             # Individual tool (definition + handler)
│   │   └── tool-two.ts
│   │
│   └── utils/                      # Utilities
│       ├── logger.ts               # Logging (stdio-safe for MCP)
│       └── error-serializer.ts     # Error handling
│
├── agent/                          # Documentation & planning
│   ├── patterns/                   # Architecture patterns
│   │   └── bootstrap.md            # This document
│   ├── tasks/                      # Task tracking
│   └── progress.yaml               # Progress tracking
│
├── package.json                    # Package configuration
├── tsconfig.json                   # TypeScript configuration
├── esbuild.build.js                # Build script
├── esbuild.watch.js                # Watch mode script
├── .env.example                    # Environment template (for local dev)
├── .gitignore
└── README.md
```

**Note:** Authentication, Docker, and deployment configurations belong in the **wrapper server project**, not in this core library.

## Step-by-Step Bootstrap

### Step 1: Create Project Structure

Create the following directory structure:
- `src/tools/` - Tool definitions
- `src/utils/` - Utility functions
- `agent/patterns/` - Architecture patterns
- `agent/tasks/` - Task tracking

Initialize the project with `npm init -y`.

### Step 2: Install Dependencies

**Core dependencies:**
```bash
npm install @modelcontextprotocol/sdk
```

**Development dependencies:**
```bash
npm install --save-dev \
  typescript \
  @types/node \
  esbuild \
  tsx \
  dotenv
```

**Optional (for testing):**
```bash
npm install --save-dev jest ts-jest @types/jest
```

**Note:** JWT authentication and platform integration dependencies are installed in the **wrapper server project**, not here.

### Step 3: Configure package.json

```json
{
  "name": "@your-org/your-mcp-core",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/server-factory.js",
  "types": "dist/server-factory.d.ts",
  
  "exports": {
    ".": {
      "types": "./dist/server-factory.d.ts",
      "import": "./dist/server-factory.js"
    },
    "./server": {
      "types": "./dist/server.d.ts",
      "import": "./dist/server.js"
    },
    "./client": {
      "types": "./dist/client.d.ts",
      "import": "./dist/client.js"
    },
    "./tools": {
      "types": "./dist/tools/index.d.ts",
      "import": "./dist/tools/index.js"
    }
  },
  
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  
  "scripts": {
    "build": "node esbuild.build.js",
    "build:watch": "node esbuild.watch.js",
    "clean": "rm -rf dist",
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.js",
    "test": "jest --config jest.config.js",
    "test:watch": "jest --config jest.config.js --watch",
    "test:e2e": "jest --config jest.e2e.config.js",
    "prepublishOnly": "npm run clean && npm run build"
  },
  
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4"
  },
  
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/jest": "^29.0.0",
    "dotenv": "^16.0.0",
    "esbuild": "^0.25.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.7.2"
  },
  
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 4: Configure TypeScript

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "types": ["node"],
    
    "outDir": "./dist",
    "rootDir": "./src",
    
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 5: Configure Build Scripts

**esbuild.build.js**:

```javascript
import * as esbuild from 'esbuild';
import { execSync } from 'child_process';

// Build CLI entry point (bundled)
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  sourcemap: true,
  external: [
    '@modelcontextprotocol/sdk',
    '@prmichaelsen/mcp-auth',
    'firebase-auth-cloudflare-workers'
  ],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
  }
});

console.log('✓ JavaScript bundle built');

// Generate TypeScript declarations
console.log('Generating TypeScript declarations...');
try {
  execSync('tsc --emitDeclarationOnly --outDir dist', { stdio: 'inherit' });
  console.log('✓ TypeScript declarations generated');
} catch (error) {
  console.error('✗ Failed to generate TypeScript declarations');
  process.exit(1);
}

console.log('✓ Build complete');
```

**esbuild.watch.js**:

```javascript
import * as esbuild from 'esbuild';

const ctx = await esbuild.context({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  sourcemap: true,
  external: [
    '@modelcontextprotocol/sdk',
    '@prmichaelsen/mcp-auth',
    'jsonwebtoken'
  ],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
  }
});

await ctx.watch();
console.log('👀 Watching for changes...');
```

### Step 6: Configure Testing (Optional)

If you want to add testing to your project, configure Jest for TypeScript and ESM.

**Install test dependencies**:

```bash
npm install --save-dev jest ts-jest @types/jest
```

#### jest.config.js (Unit Tests)

For ESM projects with colocated tests (`.spec.ts` files):

```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e.ts',
    '!src/index.ts',
    '!src/types/**/*.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
```

#### jest.e2e.config.js (E2E Tests)

For end-to-end tests that make real API calls:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.e2e.ts'],
  testTimeout: 30000, // 30 seconds for real API calls
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e.ts',
    '!src/types/**/*.ts',
    '!src/index.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**Add test scripts to package.json**:

```json
{
  "scripts": {
    "test": "jest --config jest.config.js",
    "test:watch": "jest --config jest.config.js --watch",
    "test:e2e": "jest --config jest.e2e.config.js",
    "test:e2e:watch": "jest --config jest.e2e.config.js --watch",
    "test:all": "npm test && npm run test:e2e",
    "test:coverage": "jest --config jest.config.js --coverage"
  }
}
```

**Key Jest Configuration Options:**

- `preset`: Use `'ts-jest/presets/default-esm'` for ESM projects
- `testEnvironment`: `'node'` for Node.js environment
- `testMatch`: Patterns to match test files (`.spec.ts` vs `.e2e.ts`)
- `testTimeout`: Timeout for tests (longer for E2E)
- `extensionsToTreatAsEsm`: Treat `.ts` files as ESM
- `moduleNameMapper`: Map path aliases and handle `.js` imports in `.ts` files
- `collectCoverageFrom`: Files to include in coverage reports
- `transform`: Configure ts-jest with ESM support

### Step 7: Create JWT Auth Provider

**src/auth/jwt-provider.ts**:

```typescript
import type { AuthProvider, AuthResult, RequestContext } from '@prmichaelsen/mcp-auth';
import jwt from 'jsonwebtoken';

export interface JWTAuthProviderConfig {
  secret: string;
  algorithm?: jwt.Algorithm;
  cacheResults?: boolean;
  cacheTtl?: number;
}

export class JWTAuthProvider implements AuthProvider {
  private config: JWTAuthProviderConfig;
  private authCache = new Map<string, { result: AuthResult; expiresAt: number }>();
  
  constructor(config: JWTAuthProviderConfig) {
    this.config = {
      algorithm: 'HS256',
      ...config
    };
  }
  
  async initialize(): Promise<void> {
    console.log('JWT auth provider initialized');
  }
  
  async authenticate(context: RequestContext): Promise<AuthResult> {
    try {
      const authHeader = context.headers?.['authorization'];
      
      if (!authHeader || Array.isArray(authHeader)) {
        return { authenticated: false, error: 'No authorization header' };
      }
      
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return { authenticated: false, error: 'Invalid authorization format' };
      }
      
      const token = parts[1];
      
      // Check cache
      if (this.config.cacheResults) {
        const cached = this.authCache.get(token);
        if (cached && Date.now() < cached.expiresAt) {
          return cached.result;
        }
      }
      
      // Verify token
      const decoded = jwt.verify(token, this.config.secret, {
        algorithms: [this.config.algorithm!]
      }) as jwt.JwtPayload;
      
      if (!decoded.sub) {
        return { authenticated: false, error: 'Token missing sub claim' };
      }
      
      const result: AuthResult = {
        authenticated: true,
        userId: decoded.sub,
        metadata: {
          email: decoded.email,
          ...(decoded as any)
        }
      };
      
      // Cache result
      if (this.config.cacheResults) {
        const ttl = this.config.cacheTtl || 60000;
        this.authCache.set(token, {
          result,
          expiresAt: Date.now() + ttl
        });
      }
      
      return result;
    } catch (error) {
      return {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }
  
  async cleanup(): Promise<void> {
    this.authCache.clear();
  }
}
```

### Step 8: Create Platform Token Resolver

**src/auth/platform-token-resolver.ts**:

```typescript
import type {
  ResourceTokenResolver,
  CredentialsAPIResponse,
  CredentialsAPIHeaders,
  TenantAPIErrorResponse
} from '@prmichaelsen/mcp-auth';

export interface PlatformTokenResolverConfig {
  platformUrl: string;
  serviceToken: string;
  cacheTokens?: boolean;
  cacheTtl?: number;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

export class PlatformTokenResolver implements ResourceTokenResolver {
  private config: PlatformTokenResolverConfig;
  private tokenCache = new Map<string, CachedToken>();
  
  constructor(config: PlatformTokenResolverConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<void> {
    console.log('Platform token resolver initialized');
  }
  
  async resolveToken(userId: string, resourceType: string): Promise<string | null> {
    try {
      const cacheKey = `${userId}:${resourceType}`;
      
      // Check cache
      if (this.config.cacheTokens !== false) {
        const cached = this.tokenCache.get(cacheKey);
        if (cached && Date.now() < cached.expiresAt) {
          return cached.token;
        }
      }
      
      // Call platform API
      const url = `${this.config.platformUrl}/api/credentials/${resourceType}`;
      const headers: CredentialsAPIHeaders = {
        'Authorization': `Bearer ${this.config.serviceToken}`,
        'X-User-ID': userId
      };
      
      const response = await fetch(url, {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json() as TenantAPIErrorResponse;
        
        if (response.status === 404) {
          console.warn(`No ${resourceType} credentials for user ${userId}`);
          return null;
        }
        
        console.error('Platform API error:', errorData);
        throw new Error(`Platform API error: ${errorData.error || response.status}`);
      }
      
      const data = await response.json() as CredentialsAPIResponse;
      const token = data.access_token;
      
      if (!token) {
        console.warn('Token field missing');
        return null;
      }
      
      // Cache token
      if (this.config.cacheTokens !== false) {
        const ttl = this.config.cacheTtl || 300000;
        this.tokenCache.set(cacheKey, {
          token,
          expiresAt: Date.now() + ttl
        });
      }
      
      return token;
    } catch (error) {
      console.error('Failed to resolve token:', error);
      return null;
    }
  }
  
  async cleanup(): Promise<void> {
    this.tokenCache.clear();
  }
}
```

### Step 9: Create Client Wrapper

**src/client.ts**:

```typescript
export interface ClientConfig {
  accessToken: string;
  baseUrl?: string;
  timeout?: number;
}

export class ClientWrapper {
  private config: ClientConfig;
  private isConnected = false;

  constructor(accessToken: string, options?: Partial<ClientConfig>) {
    this.config = {
      accessToken,
      baseUrl: options?.baseUrl || 'https://api.example.com',
      timeout: options?.timeout || 30000
    };
  }

  async connect(): Promise<void> {
    // Initialize connection, validate credentials, etc.
    this.isConnected = true;
  }

  async doSomething(param: string): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Client not connected');
    }
    
    // Make API call
    const response = await fetch(`${this.config.baseUrl}/endpoint`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ param })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }
}
```

### Step 10: Create Tool Pattern

**src/tools/example-tool.ts**:

```typescript
import { ClientWrapper } from '../client.js';

export const exampleTool = {
  name: 'prefix_tool_name',
  description: 'Clear description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description'
      },
      param2: {
        type: 'number',
        description: 'Optional parameter',
        default: 10
      }
    },
    required: ['param1']
  }
};

export async function handleExampleTool(
  client: ClientWrapper,
  args: any
): Promise<string> {
  try {
    const result = await client.doSomething(args.param1);
    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(`Failed to execute: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

### Step 11: Create Server Factory

**src/server-factory.ts**:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ClientWrapper } from './client.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

// Import all tools
import { exampleTool, handleExampleTool } from './tools/example-tool.js';

export interface ServerOptions {
  name?: string;
  version?: string;
}

/**
 * Create a server instance for a specific user/tenant
 * 
 * @param accessToken - User's access token for external API
 * @param userId - User identifier
 * @param options - Optional server configuration
 * @returns Configured MCP Server instance
 */
export function createServer(
  accessToken: string,
  userId: string,
  options: ServerOptions = {}
): Server {
  if (!accessToken) {
    throw new Error('accessToken is required');
  }
  
  if (!userId) {
    throw new Error('userId is required');
  }
  
  // Initialize client with user's credentials
  const client = new ClientWrapper(accessToken);
  
  // Create MCP server
  const server = new Server(
    {
      name: options.name || 'mcp-server',
      version: options.version || '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );
  
  // Register list_tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        exampleTool,
        // ... all tool definitions
      ]
    };
  });
  
  // Register call_tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      let result: string;
      
      switch (name) {
        case 'prefix_tool_name':
          result = await handleExampleTool(client, args);
          break;
        
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
      
      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
  
  return server;
}
```

### Step 12: Create Main Server Entry Point

**src/index.ts**:

```typescript
#!/usr/bin/env node

import { wrapServer } from '@prmichaelsen/mcp-auth';
import { createServer } from './server-factory.js';
import { JWTAuthProvider } from './auth/jwt-provider.js';
import { PlatformTokenResolver } from './auth/platform-token-resolver.js';

// Configuration
const config = {
  jwt: {
    secret: process.env.JWT_SECRET!
  },
  platform: {
    url: process.env.PLATFORM_URL!,
    serviceToken: process.env.PLATFORM_SERVICE_TOKEN || 'dev-token'
  },
  server: {
    port: parseInt(process.env.PORT || '8080')
  }
};

// Validate
if (!config.jwt.secret) {
  console.error('Error: JWT_SECRET required');
  process.exit(1);
}

if (!config.platform.url) {
  console.error('Error: PLATFORM_URL required');
  process.exit(1);
}

// Create providers
const authProvider = new JWTAuthProvider({
  secret: config.jwt.secret,
  cacheResults: true,
  cacheTtl: 60000
});

const tokenResolver = new PlatformTokenResolver({
  platformUrl: config.platform.url,
  serviceToken: config.platform.serviceToken,
  cacheTokens: true,
  cacheTtl: 300000
});

// Wrap server
const wrappedServer = wrapServer({
  serverFactory: (accessToken: string, userId: string) => {
    return createServer(accessToken, userId);
  },
  authProvider,
  tokenResolver,
  resourceType: 'your-resource-type', // e.g., 'github', 'slack', etc.
  transport: {
    type: 'sse',
    port: config.server.port,
    host: '0.0.0.0',
    basePath: '/mcp'
  },
  middleware: {
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60 * 60 * 1000
    },
    logging: {
      enabled: true,
      level: 'info'
    }
  }
});

// Start
async function main() {
  await wrappedServer.start();
  console.log(`Server running on port ${config.server.port}`);
  console.log(`Endpoint: http://0.0.0.0:${config.server.port}/mcp`);
}

process.on('SIGINT', async () => {
  await wrappedServer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await wrappedServer.stop();
  process.exit(0);
});

main();
```

### Step 13: Create Environment Template

**.env.example**:

```env
# JWT (for authentication)
JWT_SECRET=your-jwt-secret-key

# Platform API (for token resolution)
PLATFORM_URL=https://your-platform.com
PLATFORM_SERVICE_TOKEN=your-service-token

# Server
PORT=8080
NODE_ENV=development
LOG_LEVEL=info
```

### Step 14: Create Dockerfile

**Dockerfile**:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies
RUN npm ci

# Copy source
COPY src ./src

# Build
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/mcp/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
```

### Step 15: Create .gitignore

**.gitignore**:

```
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
```

### Step 16: Create .dockerignore

**.dockerignore**:

```
dist/
build/
node_modules/
.env
.env.local
.git/
*.md
agent/
.vscode/
*.log
```

## Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start in watch mode
npm run build:watch

# In another terminal
npm start
```

### Cloud Run Deployment

```bash
# Build locally
npm run build
docker build -t gcr.io/YOUR_PROJECT/your-mcp-server:latest .

# Push to GCR
docker push gcr.io/YOUR_PROJECT/your-mcp-server:latest

# Generate service token
SERVICE_TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")

# Create secret
echo -n "$SERVICE_TOKEN" | gcloud secrets create platform-service-token --data-file=-

# Deploy
gcloud run deploy your-mcp-server \
  --image gcr.io/YOUR_PROJECT/your-mcp-server:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="FIREBASE_PROJECT_ID=your-project,PLATFORM_URL=https://your-platform.com,NODE_ENV=production" \
  --update-secrets=PLATFORM_SERVICE_TOKEN=platform-service-token:latest \
  --min-instances=0 \
  --max-instances=10 \
  --memory=512Mi \
  --cpu=1
```

## Platform API Requirements

The platform must implement the credentials API:

```typescript
// GET /api/credentials/:provider
// Headers: { Authorization: Bearer <service-token>, X-User-ID: <user-id> }

import type { CredentialsAPIResponse } from '@prmichaelsen/mcp-auth';

export async function GET(request: Request, { params }: { params: { provider: string } }) {
  // 1. Validate service token
  const serviceToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (serviceToken !== process.env.MCP_SERVER_SERVICE_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Get userId
  const userId = request.headers.get('X-User-ID');
  if (!userId) {
    return Response.json({ error: 'X-User-ID required' }, { status: 400 });
  }
  
  // 3. Query database
  const credentials = await db.query(
    'SELECT access_token FROM credentials WHERE user_id = $1 AND provider = $2',
    [userId, params.provider]
  );
  
  if (!credentials.rows[0]) {
    return Response.json({ error: 'Credentials not found' }, { status: 404 });
  }
  
  // 4. Return token
  const response: CredentialsAPIResponse = {
    access_token: credentials.rows[0].access_token,
    expires_at: credentials.rows[0].expires_at,
  };
  
  return Response.json(response);
}
```

## Testing

### Local Testing

```bash
# Start server
npm start

# Test health
curl http://localhost:8080/mcp/health

# Test with Firebase JWT
curl -X POST http://localhost:8080/mcp/message \
  -H "Authorization: Bearer <firebase-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Production Testing

```bash
# Get Firebase JWT from your platform
# Then test MCP endpoint
curl -X POST https://your-server.run.app/mcp/message \
  -H "Authorization: Bearer <firebase-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

## Key Benefits

**Core Library:**
1. **Reusable** - Publish once, use in multiple wrapper projects
2. **Testable** - Easy to test business logic in isolation
3. **Maintainable** - Clear separation of concerns
4. **Type-safe** - Strong TypeScript contracts

**Wrapper Server:**
5. **Zero modification** to core library
6. **Automatic multi-tenancy** via server wrapping
7. **JWT authentication** built-in
8. **Platform-managed credentials** (secure, centralized)
9. **Stateless** (no database needed in MCP server)
10. **Production-ready** with health checks and graceful shutdown
11. **Scalable** with Cloud Run auto-scaling

## Common Patterns

### Tool Organization
- One file per tool
- Export definition and handler separately
- Handler receives client and args
- Return JSON strings

### Server Patterns
- **Factory**: For multi-tenant (returns Server instance)
- **Wrapping**: Use `wrapServer` from mcp-auth
- No shared state between instances

### Client Pattern
- Wrapper class for external API
- Accept credentials in constructor
- Stateful connection management

### Logging Pattern
- No-op for stdio transport
- File or stderr for HTTP transports
- Never use console.log with stdio

### Error Handling
- Serialize errors for MCP responses
- Proper error types (McpError)
- Graceful degradation

## Compatibility Checklist

**Core Library:**
- ✅ Export a factory function that accepts `(accessToken, userId, options?)`
- ✅ Factory returns a configured `Server` instance
- ✅ No shared state between server instances
- ✅ Client wrapper accepts credentials in constructor
- ✅ Tools are stateless (receive client as parameter)
- ✅ Proper TypeScript types exported
- ✅ ESM with `.js` extensions in imports
- ✅ Can run standalone with `npm run dev`

**Wrapper Server:**
- ✅ JWT auth provider implemented
- ✅ Platform token resolver implemented
- ✅ Health check endpoint available
- ✅ Graceful shutdown handling
- ✅ Docker containerization
- ✅ Cloud Run deployment configuration

## Examples

**Core Libraries:**
- **Instagram**: [@prmichaelsen/instagram-mcp](https://github.com/prmichaelsen/instagram-mcp) (core library)
- **Eventbrite**: [@prmichaelsen/eventbrite-mcp](https://github.com/prmichaelsen/eventbrite-mcp) (core library)
- **Memory**: [@prmichaelsen/remember-mcp](https://github.com/prmichaelsen/remember-mcp) (core library)

**Wrapper Servers:**
- **Instagram Wrapper**: [@prmichaelsen/agentbase-mcp-server](https://github.com/prmichaelsen/agentbase-mcp-server) (wraps instagram-mcp)

## Summary

This pattern enables you to:

**Core Library:**
- ✅ Build reusable MCP server libraries with server factory pattern
- ✅ Export clean, typed interfaces for wrapper projects
- ✅ Develop and test locally with `npm run dev`
- ✅ Publish to npm for use in multiple wrapper projects

**Wrapper Server (separate project):**
- ✅ Add JWT authentication to any core library
- ✅ Integrate with platform-managed credentials
- ✅ Deploy as scalable Cloud Run services
- ✅ Maintain separation between business logic and infrastructure

**Total time**:
- Core library: ~2-4 hours
- Wrapper server: ~2-3 hours
- Total: ~4-7 hours for complete integration

**Result**: Production-ready multi-tenant MCP server with clean separation of concerns!

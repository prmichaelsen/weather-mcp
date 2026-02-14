# MCP Multi-Tenant Starter

A production-ready starter template for building multi-tenant Model Context Protocol (MCP) servers with built-in authentication, credential management, and deployment infrastructure.

## 🚀 Quick Start

> **Note**: This project is currently in initial setup phase. The implementation is in progress.

```bash
# Clone the repository
git clone <repository-url>
cd mcp-multitenant-starter

# Install dependencies (coming soon)
npm install

# Run in development mode (coming soon)
npm run dev

# Build for production (coming soon)
npm run build
```

## 📋 Project Status

**Current Phase**: Foundation (Milestone 1)  
**Progress**: 10% complete  
**Status**: In Progress

### Completed
- ✅ ACP (Agent Context Protocol) structure initialized
- ✅ Requirements document created
- ✅ Project milestones defined
- ✅ Bootstrap pattern documented

### In Progress
- 🔄 Project structure creation (Task 3)

### Next Steps
- Configure build system (esbuild, TypeScript)
- Implement server factory pattern
- Add JWT authentication
- Create example tools

See [`agent/progress.yaml`](agent/progress.yaml) for detailed progress tracking.

## 🎯 What This Starter Provides

This starter template eliminates the boilerplate needed for production-ready MCP servers:

- **🔐 Authentication**: JWT token validation and user identification
- **👥 Multi-Tenancy**: Complete isolation between users with per-user credentials
- **🏭 Server Factory Pattern**: Create isolated server instances for each user
- **🔌 Platform Integration**: Fetch user credentials from your platform API
- **🐳 Docker Ready**: Production-ready Dockerfile included
- **☁️ Cloud Run Deployment**: Scripts and configuration for GCP deployment
- **🧪 Testing Infrastructure**: Jest setup with unit and E2E test examples
- **📝 Comprehensive Documentation**: Clear setup and deployment guides

## 🏗️ Architecture

This project follows a **two-layer architecture**:

1. **Server Factory**: Creates isolated MCP server instances per user
2. **Authentication Layer**: Validates JWTs and resolves user credentials
3. **Tool Layer**: Your custom MCP tools (examples provided)
4. **Platform Integration**: Fetches user-specific credentials from your API

```
Client Request (JWT)
  ↓
JWT Auth Provider (validates JWT → userId)
  ↓
Platform Token Resolver (userId → API credentials)
  ↓
Server Factory (creates isolated server instance)
  ↓
MCP Tools (execute with user's credentials)
```

## 📁 Project Structure

```
mcp-multitenant-starter/
├── agent/                          # ACP documentation & planning
│   ├── design/                     # Design documents
│   │   ├── requirements.md         # Project requirements
│   │   └── *.md                    # Feature designs
│   ├── milestones/                 # Project milestones
│   │   ├── milestone-1-foundation.md
│   │   ├── milestone-2-core-implementation.md
│   │   └── milestone-3-deployment.md
│   ├── patterns/                   # Architecture patterns
│   │   └── bootstrap.md            # Bootstrap pattern guide
│   ├── tasks/                      # Task tracking
│   │   └── task-*.md               # Individual tasks
│   └── progress.yaml               # Progress tracking
│
├── src/                            # Source code (coming soon)
│   ├── index.ts                    # Main entry point
│   ├── server-factory.ts           # Server factory
│   ├── client.ts                   # External API client wrapper
│   ├── types.ts                    # Type definitions
│   ├── auth/                       # Authentication providers
│   │   ├── jwt-provider.ts         # JWT validation
│   │   └── platform-token-resolver.ts
│   ├── tools/                      # MCP tool definitions
│   │   └── *.ts                    # Individual tools
│   └── utils/                      # Utilities
│       ├── logger.ts               # Logging
│       └── error-serializer.ts     # Error handling
│
├── AGENT.md                        # ACP methodology documentation
├── package.json                    # (coming soon)
├── tsconfig.json                   # (coming soon)
├── Dockerfile                      # (coming soon)
└── README.md                       # This file
```

## 🛠️ Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+
- **Protocol**: Model Context Protocol (MCP) SDK v1.0.4+
- **Auth**: [@prmichaelsen/mcp-auth](https://github.com/prmichaelsen/mcp-auth)
- **Build**: esbuild (fast bundling)
- **Testing**: Jest with TypeScript support
- **Deployment**: Docker + Google Cloud Run

## 📚 Documentation

### For Developers
- [`agent/design/requirements.md`](agent/design/requirements.md) - Complete project requirements
- [`agent/patterns/bootstrap.md`](agent/patterns/bootstrap.md) - Architecture and bootstrap guide
- [`agent/progress.yaml`](agent/progress.yaml) - Current progress and status
- [`AGENT.md`](AGENT.md) - Agent Context Protocol methodology

### For Contributors
- [`agent/milestones/`](agent/milestones/) - Project milestones and phases
- [`agent/tasks/`](agent/tasks/) - Individual task breakdowns

## 🎓 Learning Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [@prmichaelsen/mcp-auth Documentation](https://github.com/prmichaelsen/mcp-auth)
- [Example: Instagram MCP](https://github.com/prmichaelsen/instagram-mcp)
- [Example: Eventbrite MCP](https://github.com/prmichaelsen/eventbrite-mcp)

## 🤝 Contributing

This project follows the [Agent Context Protocol (ACP)](AGENT.md) for development. To contribute:

1. Read [`AGENT.md`](AGENT.md) to understand the development methodology
2. Check [`agent/progress.yaml`](agent/progress.yaml) for current status
3. Review open tasks in [`agent/tasks/`](agent/tasks/)
4. Follow the patterns in [`agent/patterns/`](agent/patterns/)

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- Uses [@prmichaelsen/mcp-auth](https://github.com/prmichaelsen/mcp-auth) for multi-tenancy
- Follows the [Agent Context Protocol](https://github.com/prmichaelsen/agent-context-protocol)

---

**Status**: 🚧 In Development - Foundation Phase  
**Last Updated**: 2026-02-14  
**Next Milestone**: Complete project structure and build configuration

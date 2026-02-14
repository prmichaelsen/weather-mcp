# Milestone 2: Core Implementation

**Goal**: Implement the core multi-tenant server functionality with authentication and example tools
**Duration**: 1 week
**Dependencies**: Milestone 1 (Project Foundation)
**Status**: Not Started

---

## Overview

This milestone implements the core functionality of the multi-tenant MCP server. It includes the server factory pattern, JWT authentication provider, platform token resolver, and example tools. By the end of this milestone, the server should be fully functional and testable locally.

## Deliverables

- Server factory function that creates isolated server instances
- JWT authentication provider with token validation and caching
- Platform token resolver that fetches user credentials
- 2-3 example tools demonstrating the pattern
- Main server entry point that wires everything together
- Working local development environment

## Success Criteria

- [ ] Server factory creates isolated instances per user
- [ ] JWT authentication validates tokens correctly
- [ ] Platform token resolver fetches credentials from API
- [ ] Example tools execute successfully
- [ ] `npm run dev` starts the server locally
- [ ] Server responds to MCP protocol requests
- [ ] Multi-tenant isolation is verified
- [ ] No shared state between user sessions

## Key Files to Create

```
src/
├── server-factory.ts               # Core server factory implementation
├── auth/
│   ├── jwt-provider.ts            # JWT authentication provider
│   └── platform-token-resolver.ts # Platform credential resolver
├── tools/
│   ├── index.ts                   # Tool exports
│   ├── example-tool.ts            # Example tool 1
│   └── another-tool.ts            # Example tool 2
└── index.ts                       # Main entry point (complete)
```

## Tasks

1. **Task 8**: Implement Server Factory
2. **Task 9**: Implement JWT Auth Provider
3. **Task 10**: Implement Platform Token Resolver
4. **Task 11**: Create Example Tools
5. **Task 12**: Create Main Server Entry Point
6. **Task 13**: Test Local Development

---

**Previous Milestone**: [Milestone 1: Project Foundation](milestone-1-foundation.md)
**Next Milestone**: [Milestone 3: Development & Deployment](milestone-3-deployment.md)
**Blockers**: Requires Milestone 1 completion

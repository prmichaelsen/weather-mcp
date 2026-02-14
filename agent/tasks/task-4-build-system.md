# Task 4: Configure Build System

**Milestone**: Milestone 1 (Project Foundation)
**Estimated Time**: 2 hours
**Dependencies**: Task 3
**Status**: Not Started

---

## Objective

Configure TypeScript compilation and esbuild bundling system with watch mode for development and production builds.

## Steps

1. Create `tsconfig.json`:
   - Target ES2022
   - Module: Node16 (ESM)
   - Strict mode enabled
   - Declaration files generation
   - Source maps enabled

2. Create `esbuild.build.js`:
   - Bundle for production
   - Platform: node
   - Format: ESM
   - External: @modelcontextprotocol/sdk
   - Generate TypeScript declarations via tsc

3. Create `esbuild.watch.js`:
   - Watch mode for development
   - Same configuration as build
   - Auto-rebuild on file changes

4. Update package.json scripts:
   - `build`: Production build
   - `build:watch`: Development watch mode
   - `clean`: Remove dist directory

5. Test build system:
   - Run `npm run build`
   - Verify dist/ directory created
   - Verify .js and .d.ts files generated
   - Test watch mode

## Verification

- [ ] tsconfig.json created with correct settings
- [ ] esbuild.build.js created
- [ ] esbuild.watch.js created
- [ ] `npm run build` completes successfully
- [ ] dist/ directory contains compiled files
- [ ] TypeScript declarations (.d.ts) generated
- [ ] Source maps (.map) generated
- [ ] `npm run build:watch` works in development
- [ ] No TypeScript compilation errors

## Files to Create

- `tsconfig.json`
- `esbuild.build.js`
- `esbuild.watch.js`

## Configuration Details

### tsconfig.json
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

### esbuild Configuration
- Bundle: true
- Platform: node
- Target: node20
- Format: esm
- Sourcemap: true
- External: @modelcontextprotocol/sdk

## Notes

- Use esbuild for fast bundling
- TypeScript for type checking and declarations
- ESM modules with .js extensions in imports
- Watch mode for development efficiency
- Production builds are optimized and bundled

---

**Previous Task**: [Task 3: Create Project Structure](task-3-project-structure.md)
**Next Task**: [Task 5: Create Client Wrapper](task-5-client-wrapper.md)

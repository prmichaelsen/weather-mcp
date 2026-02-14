import * as esbuild from 'esbuild';
import { execSync } from 'child_process';

// Build main entry point (bundled)
await esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/server.js',
  sourcemap: true,
  external: [
    '@modelcontextprotocol/sdk',
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

#!/usr/bin/env node
// Lockstep guard: every Module-Federation `shared` singleton dependency MUST be
// declared at the SAME version across the host and every mini-app. If a mini on
// the CDN was built against a different react / react-native / reanimated /...
// than the host binary provides as a singleton, federation crashes at runtime.
//
// Run in CI before building/publishing. Exits non-zero on any drift.
//
// Usage: node scripts/check-shared-versions.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const MINI_ROOT = join(HERE, '..');
const HOST_PKG = join(MINI_ROOT, '../grow-host-app/package.json');

// The federation `shared` singletons (must match the `shared` blocks).
const SHARED = [
  'react',
  'react-native',
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-screens',
  'react-native-safe-area-context',
  'react-native-fast-image',
  'react-native-worklets',
  'react-native-nitro-modules',
  'react-native-mmkv',
  '@react-navigation/native',
  '@react-navigation/native-stack',
  'react-redux',
  '@reduxjs/toolkit',
  'redux-saga',
  '@supabase/supabase-js',
];

// Resolve the ACTUAL installed version of `dep` from the perspective of the
// package at `fromDir` (follows pnpm symlinks/hoisting). This is what loads at
// runtime — the meaningful lockstep check, not the package.json range string.
function resolvedVersion(fromDir, dep) {
  try {
    const req = createRequire(join(fromDir, 'package.json'));
    const pkgJson = req.resolve(`${dep}/package.json`);
    return JSON.parse(readFileSync(pkgJson, 'utf8')).version;
  } catch {
    return null;
  }
}

const sources = [];
sources.push({ label: 'host', dir: join(MINI_ROOT, '../grow-host-app') });

const pkgsDir = join(MINI_ROOT, 'packages');
for (const dir of readdirSync(pkgsDir)) {
  const pkgDir = join(pkgsDir, dir);
  // Only mini-apps (have rspack.config.mjs) participate in federation `shared`.
  if (!existsSync(join(pkgDir, 'rspack.config.mjs'))) continue;
  sources.push({ label: dir, dir: pkgDir });
}

let drift = 0;
for (const dep of SHARED) {
  const versions = new Map(); // resolved version -> [labels]
  for (const s of sources) {
    const v = resolvedVersion(s.dir, dep);
    if (!v) continue;
    if (!versions.has(v)) versions.set(v, []);
    versions.get(v).push(s.label);
  }
  if (versions.size > 1) {
    drift++;
    console.error(`✖ ${dep} INSTALLED version drift:`);
    for (const [v, labels] of versions) {
      console.error(`    ${v}  ←  ${labels.join(', ')}`);
    }
  }
}

if (drift > 0) {
  console.error(
    `\n${drift} shared-dependency version mismatch(es). Align them (host + all minis must match) before building/publishing.`,
  );
  process.exit(1);
}
console.log(`✓ All ${SHARED.length} federation shared deps are in lockstep across ${sources.length} packages.`);

#!/usr/bin/env node
/**
 * lint-all.js — Full quality gate runner
 *
 * Runs all three checks in sequence:
 *   1. dotnet format --verify-no-changes (C# API project)
 *   2. ESLint --max-warnings 0 (TypeScript frontend)
 *   3. Prettier --check (TS + CSS frontend)
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = one or more checks failed
 *
 * When --json flag is passed, prints a JSON summary to stdout
 * suitable for use in agentStop hook responses.
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WEB = path.join(ROOT, 'src', 'RecipeHub.Web');
const API = path.join(ROOT, 'src', 'RecipeHub.Api');

const JSON_MODE = process.argv.includes('--json');

const results = [];

function run(label, cmd, cwd = ROOT) {
  try {
    const output = execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    results.push({ label, passed: true, output: output.trim() });
    if (!JSON_MODE) process.stdout.write(`  ✅ ${label}\n`);
    return true;
  } catch (err) {
    const output = ((err.stdout || '') + (err.stderr || '')).trim();
    results.push({ label, passed: false, output });
    if (!JSON_MODE) {
      process.stdout.write(`  ❌ ${label}\n`);
      if (output) process.stdout.write(`     ${output.split('\n').join('\n     ')}\n`);
    }
    return false;
  }
}

if (!JSON_MODE) process.stdout.write('🔍 Running full lint suite...\n\n');

const checks = [
  () => run(
    'dotnet format (C# verify-no-changes)',
    'dotnet format src/RecipeHub.Api/ --verify-no-changes --severity error',
    ROOT
  ),
  () => run(
    'ESLint (TypeScript, zero warnings)',
    'npx eslint . --max-warnings 0',
    WEB
  ),
  () => run(
    'Prettier (TS + CSS check)',
    'npx prettier --check "src/**/*.{ts,tsx,css}"',
    WEB
  ),
];

const passed = checks.map((c) => c());
const allPassed = passed.every(Boolean);

if (JSON_MODE) {
  const failures = results.filter((r) => !r.passed);
  const summary = allPassed
    ? { decision: 'allow' }
    : {
        decision: 'block',
        reason:
          'Lint/format checks failed. Fix the following violations before stopping:\n\n' +
          failures.map((f) => `### ${f.label}\n${f.output}`).join('\n\n'),
      };
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
} else {
  process.stdout.write(allPassed ? '\n✅ All checks passed.\n' : '\n❌ Checks failed — see above.\n');
}

process.exit(allPassed ? 0 : 1);

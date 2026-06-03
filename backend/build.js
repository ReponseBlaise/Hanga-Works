#!/usr/bin/env node
const { spawnSync } = require('child_process');
const args = ['-p', '.'];

console.log('Running TypeScript build (ignoring extra npm args)...');
const res = spawnSync('npx', ['tsc', ...args], { stdio: 'inherit', shell: true });
process.exit(res.status ?? 1);

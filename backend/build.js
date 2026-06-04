#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isCI = process.env.CI === 'true';

function run(cmd, args, { failOk = false } = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (!failOk && res.status !== 0) process.exit(res.status ?? 1);
  return res.status;
}

run('npx', ['prisma', 'generate']);

if (!isCI) {
  // Resolve P3005: baseline all existing migration files so Prisma doesn't
  // try to apply them against a database that already has the schema.
  const migrationsDir = path.join(__dirname, 'prisma', 'migrations');
  if (fs.existsSync(migrationsDir)) {
    const migrations = fs
      .readdirSync(migrationsDir)
      .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory());

    for (const migration of migrations) {
      run(
        'npx',
        ['prisma', 'migrate', 'resolve', '--applied', migration],
        { failOk: true },
      );
    }
  }

  run('npx', ['prisma', 'migrate', 'deploy']);
}

run('npx', ['tsc', '-p', '.']);

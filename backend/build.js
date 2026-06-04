#!/usr/bin/env node
const { spawnSync } = require('child_process');

function run(cmd, args) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

run('npm', ['install', '--save-exact', 'prisma@5.22.0', '@prisma/client@5.22.0']);
run('npx', ['prisma', 'generate']);
run('npx', ['prisma', 'migrate', 'deploy']);
run('npx', ['tsc', '-p', '.']);

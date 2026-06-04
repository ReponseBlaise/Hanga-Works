const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Hanga-Works Backend Build Script
 * 
 * This script automates the build process for Render deployments.
 * It ensures Prisma is pinned, generates the client, and handles
 * the P3005 migration baseline error automatically.
 */

function run(cmd) {
  console.log(`> ${cmd}`);
  // Use spawnSync with shell: true for consistent cross-platform behavior
  const result = spawnSync(cmd, { 
    shell: true, 
    stdio: ['inherit', 'pipe', 'pipe'],
    cwd: __dirname
  });
  
  // Mirror output to console while capturing it
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    const error = new Error(`Command failed: ${cmd}`);
    error.status = result.status;
    error.stdout = result.stdout?.toString();
    error.stderr = result.stderr?.toString();
    throw error;
  }
  return result;
}

try {
  console.log('🚀 Starting Hanga-Works Backend Build...');

  // 1. Ensure Prisma versions are pinned to 5.22.0
  console.log('📌 Pinning Prisma versions...');
  run('npm install --save-exact prisma@5.22.0 @prisma/client@5.22.0');

  // 2. Generate Prisma Client
  console.log('⚙️ Generating Prisma Client...');
  run('npx prisma generate');

  // 3. Handle Database Migrations
  console.log('🐘 Handling database migrations...');
  try {
    run('npx prisma migrate deploy');
  } catch (err) {
    const combinedOutput = (err.stdout || '') + (err.stderr || '');
    
    // Check for P3005 error: Database not empty but no migration history
    if (combinedOutput.includes('P3005')) {
      console.warn('⚠️  P3005 detected. Database contains tables but lacks Prisma migration history.');
      
      // Programmatically find the first migration directory to baseline
      const migrationsPath = path.join(__dirname, 'prisma', 'migrations');
      if (fs.existsSync(migrationsPath)) {
        const migrations = fs.readdirSync(migrationsPath)
          .filter(file => fs.statSync(path.join(migrationsPath, file)).isDirectory())
          .sort();

        if (migrations.length > 0) {
          const firstMigration = migrations[0];
          console.log(`🔄 Attempting to baseline with migration: ${firstMigration}`);
          try {
            run(`npx prisma migrate resolve --applied ${firstMigration}`);
            console.log('✅ Baseline successful. Retrying migrate deploy...');
            run('npx prisma migrate deploy');
          } catch (resolveErr) {
            console.error('❌ Failed to baseline migrations automatically. Manual intervention required.');
            throw resolveErr;
          }
        } else {
          console.error('❌ P3005 detected but no migrations found in prisma/migrations directory.');
          throw err;
        }
      } else {
        console.error('❌ P3005 detected but prisma/migrations directory is missing.');
        throw err;
      }
    } else {
      // For any other error, just propagate it
      throw err;
    }
  }

  // 4. Compile TypeScript
  console.log('📦 Compiling TypeScript...');
  run('npm run build:tsc');

  console.log('✨ Build complete!');
} catch (error) {
  // Error already logged by run()
  process.exit(1);
}

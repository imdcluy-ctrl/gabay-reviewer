import fs from 'fs';
import path from 'path';

// Define the directory to scan (usually the 'dist' folder)
const scanDir = path.resolve(process.cwd(), 'dist');

// Define regex patterns that might indicate a secret leak
// PayMongo secret keys typically start with sk_test_ or sk_live_
const SECRET_PATTERNS = [
  /sk_test_[a-zA-Z0-9]+/,
  /sk_live_[a-zA-Z0-9]+/,
  /pk_test_[a-zA-Z0-9]+/, // Note: public keys might be okay to expose depending on the service, but it's safer to avoid hardcoding.
  /pk_live_[a-zA-Z0-9]+/
];

let hasError = false;

function scanDirectory(directory: string) {
  if (!fs.existsSync(directory)) {
    console.log(`Directory ${directory} does not exist. Skipping secret scan.`);
    return;
  }

  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.html') || fullPath.endsWith('.css'))) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');

  for (const pattern of SECRET_PATTERNS) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      console.error(`\n🚨 CRITICAL SECURITY ERROR 🚨`);
      console.error(`Found potential leaked secret in file: ${filePath}`);
      console.error(`Pattern matched: ${pattern}`);
      console.error(`This means a backend secret was bundled into the client code!`);
      console.error(`Build failed to prevent secret exposure.\n`);
      hasError = true;
    }
  }
}

console.log('Running secret scanner on build output...');
scanDirectory(scanDir);

if (hasError) {
  process.exit(1);
} else {
  console.log('✅ Secret scan passed. No leaked secrets found.');
}

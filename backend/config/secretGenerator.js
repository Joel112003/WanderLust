const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecret(length = process.env.SECRET || 64) {
  return crypto.randomBytes(Number(length)).toString('hex');
}

function ensureEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');

  let envContent = '';
  try {
    envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    envContent = '';
  }

  const envLines = envContent.split('\n');
  const envVars = {};
  const lineMap = {};

  envLines.forEach((line, index) => {
    const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2];
      envVars[key] = value;
      lineMap[key] = index;
    }
  });

  const requiredVars = {
    'NODE_ENV': 'development'
  };

  if (!envVars['JWT_SECRET']) {
    requiredVars['JWT_SECRET'] = generateSecret();
  }
  if (!envVars['SECRET']) {
    requiredVars['SECRET'] = generateSecret();
  }

  let updated = false;

  Object.keys(requiredVars).forEach(key => {
    if (!envVars[key] || envVars[key].trim() === '') {
      if (key in lineMap) {
        envLines[lineMap[key]] = `${key}=${requiredVars[key]}`;
      } else {
        envLines.push(`${key}=${requiredVars[key]}`);
      }
      updated = true;
    }
  });

  if (updated) {
    try {
      fs.writeFileSync(envPath, envLines.join('\n'));
      console.log('✅ Environment variables updated successfully');
    } catch (error) {
      console.error('❌ Error writing .env file:', error.message);
    }
  }
}

if (require.main === module) {
  ensureEnvFile();
}

module.exports = { ensureEnvFile, generateSecret };

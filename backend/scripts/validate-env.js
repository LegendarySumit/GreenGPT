#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * Verifies all required environment variables are set and valid
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define required and optional environment variables
const ENV_REQUIREMENTS = {
  required: [
    {
      key: 'NODE_ENV',
      description: 'Node environment',
      validator: (val) => ['production', 'development', 'staging', 'test'].includes(val),
      example: 'production'
    },
    {
      key: 'FIREBASE_PROJECT_ID',
      description: 'Firebase project ID',
      validator: (val) => val && val.length > 0 && !val.includes('your-'),
      example: 'greengpt-project-id'
    },
    {
      key: 'GEMINI_API_KEY',
      description: 'Google Gemini API key',
      validator: (val) => val && val.length > 20,
      example: 'AIz...'
    },
    {
      key: 'GEMINI_MODEL',
      description: 'Gemini model name',
      validator: (val) => val && val.includes('gemini'),
      example: 'gemini-2.5-flash'
    }
  ],
  optional: [
    {
      key: 'PORT',
      description: 'Server port',
      validator: (val) => val && /^\d+$/.test(val),
      example: '3000'
    },
    {
      key: 'UPSTASH_REDIS_REST_URL',
      description: 'Redis URL for caching',
      validator: (val) => !val || val.startsWith('https://'),
      example: 'https://your-redis.upstash.io'
    },
    {
      key: 'SENTRY_DSN',
      description: 'Sentry error tracking',
      validator: (val) => !val || val.startsWith('https://'),
      example: 'https://key@sentry.io/...'
    },
    {
      key: 'CORS_ALLOWED_ORIGINS',
      description: 'Allowed CORS origins',
      validator: (val) => !val || val.includes('https://'),
      example: 'https://greengpt.vercel.app'
    }
  ]
};

const FRONTEND_REQUIREMENTS = {
  required: [],
  optional: [
    {
      key: 'VITE_API_BASE_URL',
      description: 'Backend API URL',
      validator: (val) => !val || val.startsWith('https://'),
      example: 'https://greengpt-backend.onrender.com'
    },
    {
      key: 'VITE_FIREBASE_PROJECT_ID',
      description: 'Firebase project ID',
      validator: (val) => val && val.length > 0,
      example: 'greengpt-project-id'
    }
  ]
};

function validateEnv(requirements, isProduction = true) {
  let errors = [];
  let warnings = [];
  let success = [];

  console.log('\n📋 Validating Environment Variables\n');

  // Check required variables
  for (const req of requirements.required) {
    const value = process.env[req.key];

    if (!value) {
      const msg = `❌ REQUIRED: ${req.key} - ${req.description}`;
      console.log(msg);
      errors.push(msg);
    } else if (!req.validator(value)) {
      const msg = `❌ INVALID: ${req.key} - Invalid format (expected: ${req.example})`;
      console.log(msg);
      errors.push(msg);
    } else {
      const msg = `✅ ${req.key}`;
      console.log(msg);
      success.push(msg);
    }
  }

  // Check optional variables (warnings only if in production)
  for (const req of requirements.optional) {
    const value = process.env[req.key];

    if (!value) {
      const msg = `⚠️  OPTIONAL: ${req.key} - Not set (${req.description})`;
      if (isProduction) {
        console.log(msg);
        warnings.push(msg);
      }
    } else if (!req.validator(value)) {
      const msg = `⚠️  ${req.key} - Possibly invalid format`;
      console.log(msg);
      warnings.push(msg);
    } else {
      const msg = `✅ ${req.key}`;
      console.log(msg);
      success.push(msg);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${success.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log('='.repeat(50) + '\n');

  if (errors.length > 0) {
    console.error('🚨 Production environment validation FAILED\n');
    console.error('Required variables missing or invalid:');
    errors.forEach(e => console.error(`  ${e}`));
    console.error('\n❌ Cannot proceed with deployment\n');
    process.exit(1);
  }

  if (isProduction && warnings.length > 0) {
    console.warn('⚠️  Some optional features are not configured:');
    warnings.forEach(w => console.warn(`  ${w}`));
    console.warn('\n⚠️  This may affect functionality\n');
  }

  return {
    success: success.length,
    warnings: warnings.length,
    errors: errors.length,
    passed: errors.length === 0
  };
}

function checkFirebaseConnection() {
  console.log('\n🔐 Firebase Configuration Check\n');

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    console.log('⚠️  FIREBASE_SERVICE_ACCOUNT not found as env var');
    console.log('   (This is expected - will be injected by deployment platform)');
    return true;
  }

  try {
    const config = typeof serviceAccount === 'string' 
      ? JSON.parse(serviceAccount) 
      : serviceAccount;

    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missing = requiredFields.filter(f => !config[f]);

    if (missing.length > 0) {
      console.log(`❌ Missing fields in service account: ${missing.join(', ')}`);
      return false;
    }

    console.log(`✅ Firebase service account structure valid`);
    return true;
  } catch (err) {
    console.log(`⚠️  Could not parse FIREBASE_SERVICE_ACCOUNT: ${err.message}`);
    return false;
  }
}

function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const scriptPath = process.argv[1] || '';
  const isBackend = scriptPath.includes('backend');

  console.log(`${'='.repeat(50)}`);
  console.log(`🌍 GreenGPT Environment Validation`);
  console.log(`Environment: ${process.env.NODE_ENV?.toUpperCase() || 'NOT SET'}`);
  console.log(`Location: ${isBackend ? 'Backend' : 'Frontend'}`);
  console.log(`${'='.repeat(50)}`);

  // Validate requirements based on location
  const requirements = isBackend ? ENV_REQUIREMENTS : FRONTEND_REQUIREMENTS;
  const result = validateEnv(requirements, isProduction);

  // Additional checks
  if (isBackend && isProduction) {
    const firebaseOk = checkFirebaseConnection();
    if (!firebaseOk) {
      console.error('❌ Firebase configuration check failed\n');
      process.exit(1);
    }
  }

  // Final status
  console.log('\n' + '='.repeat(50));
  if (result.passed) {
    console.log('✅ All validations PASSED - Ready for deployment!');
  } else {
    console.log('❌ Validation FAILED - Fix errors before deploying');
    process.exit(1);
  }
  console.log('='.repeat(50) + '\n');
}

main();

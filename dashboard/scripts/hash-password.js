const crypto = require('crypto');

const password = process.argv[2];
const salt = process.argv[3] || '';

if (!password) {
    console.error('Usage: node scripts/hash-password.js <password> [salt]');
    process.exit(1);
}

const hash = crypto
    .createHash('sha256')
    .update(`${salt}:${password}`, 'utf8')
    .digest('hex');

console.log(hash);

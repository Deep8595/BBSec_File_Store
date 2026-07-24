const fs = require('fs');
const path = require('path');
const { encryptFile, decryptFile } = require('./services/fileService');

const src = path.join(__dirname, 'uploads', 'verify-decrypt.txt');
const enc = path.join(__dirname, '..', 'core', 'encrypted', 'verify-decrypt.txt.enc');
const out = path.join(__dirname, '..', 'core', 'decrypted', 'verify-decrypt.txt');

fs.mkdirSync(path.dirname(src), { recursive: true });
fs.writeFileSync(src, 'hello decrypt test');
encryptFile(src, enc);
decryptFile(enc, out);
console.log('exists=' + fs.existsSync(out));
console.log('content=' + fs.readFileSync(out, 'utf8'));

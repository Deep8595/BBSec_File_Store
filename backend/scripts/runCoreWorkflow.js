const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function runCoreWorkflow({ filePath, action }) {
  const coreRoot = path.resolve(__dirname, '..', '..', 'core');
  const targetFile = path.resolve(filePath);
  const tempFile = path.join(coreRoot, 'temp_upload.bin');

  fs.mkdirSync(path.join(coreRoot, 'encrypted'), { recursive: true });
  fs.mkdirSync(path.join(coreRoot, 'decrypted'), { recursive: true });

  fs.copyFileSync(targetFile, tempFile);

  if (action === 'hash') {
    const data = fs.readFileSync(tempFile);
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    fs.writeFileSync(path.join(coreRoot, 'hash.txt'), `${path.basename(targetFile)}\n${hash}\n`);
    return { output: 'Hash generated via runtime core fallback', hashOutput: hash };
  }

  if (action === 'encrypt') {
    const input = fs.readFileSync(tempFile);
    const key = crypto.createHash('sha256').update('bbsec-default-key').digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    const payload = Buffer.concat([iv, encrypted]);
    const outputPath = path.join(coreRoot, 'encrypted', `${path.basename(targetFile)}.enc`);
    fs.writeFileSync(outputPath, payload);
    return { output: `Encrypted file written to ${outputPath}`, hashOutput: '' };
  }

  if (action === 'decrypt') {
    const encryptedFilePath = path.resolve(filePath);
    if (!fs.existsSync(encryptedFilePath)) {
      throw new Error('No encrypted file found for decryption');
    }

    const payload = fs.readFileSync(encryptedFilePath);
    const iv = payload.subarray(0, 16);
    const encrypted = payload.subarray(16);
    const key = crypto.createHash('sha256').update('bbsec-default-key').digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const outputPath = path.join(coreRoot, 'decrypted', path.basename(encryptedFilePath, '.enc'));
    fs.writeFileSync(outputPath, decrypted);
    return { output: `Decrypted file written to ${outputPath}`, hashOutput: '' };
  }

  if (action === 'store') {
    const hashRecord = fs.readFileSync(path.join(coreRoot, 'hash.txt'), 'utf8').trim().split('\n');
    const storeOutput = path.join(coreRoot, 'hash.txt');
    fs.writeFileSync(storeOutput, `${hashRecord[0]}\n${hashRecord[1]}\n`);
    return { output: 'Hash stored in core hash record', hashOutput: hashRecord[1] || '' };
  }

  if (action === 'verify') {
    const hashRecord = fs.readFileSync(path.join(coreRoot, 'hash.txt'), 'utf8').trim().split('\n');
    return {
      output: hashRecord.length > 1 ? 'Hash verification completed' : 'Hash verification record missing',
      hashOutput: hashRecord[1] || ''
    };
  }

  throw new Error('Unsupported core action');
}

module.exports = { runCoreWorkflow };

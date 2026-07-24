const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { google } = require('googleapis');
const { execFileSync } = require('child_process');
const { runCoreWorkflow } = require('../scripts/runCoreWorkflow');

const uploadDir = path.join(__dirname, '..', 'uploads');
const encryptedDir = path.join(__dirname, '..', '..', 'core', 'encrypted');
const decryptedDir = path.join(__dirname, '..', '..', 'core', 'decrypted');
const hashFile = path.join(__dirname, '..', '..', 'core', 'hash.txt');
const blockchainMetadataFile = path.join(__dirname, '..', '..', 'core', 'blockchain', 'hash-records.json');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(encryptedDir)) fs.mkdirSync(encryptedDir, { recursive: true });
if (!fs.existsSync(decryptedDir)) fs.mkdirSync(decryptedDir, { recursive: true });

function createHash(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function runCoreAction(filePath, action) {
  return runCoreWorkflow({ filePath, action });
}

function encryptFile(filePath, outputPath) {
  const input = fs.readFileSync(filePath);
  const key = crypto.createHash('sha256').update('bbsec-default-key').digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
  const payload = Buffer.concat([iv, encrypted]);
  fs.writeFileSync(outputPath, payload);
  return payload.toString('hex');
}

function decryptFile(filePath, outputPath) {
  const payload = fs.readFileSync(filePath);
  const iv = payload.subarray(0, 16);
  const encrypted = payload.subarray(16);
  const key = crypto.createHash('sha256').update('bbsec-default-key').digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  fs.writeFileSync(outputPath, decrypted);
  return outputPath;
}

function buildHashRecordMetadata(fileName, hashValue, storedAt = new Date().toISOString()) {
  return {
    fileName,
    hash: hashValue,
    storedAt,
  };
}

function storeHashRecord(fileName, hashValue, storedAt = new Date().toISOString()) {
  const record = buildHashRecordMetadata(fileName, hashValue, storedAt);
  fs.writeFileSync(hashFile, `${record.fileName}\n${record.hash}\n`);

  const metadataDir = path.dirname(blockchainMetadataFile);
  fs.mkdirSync(metadataDir, { recursive: true });

  let metadata = {};
  if (fs.existsSync(blockchainMetadataFile)) {
    try {
      metadata = JSON.parse(fs.readFileSync(blockchainMetadataFile, 'utf8'));
    } catch (error) {
      metadata = {};
    }
  }

  metadata[record.fileName] = record;
  fs.writeFileSync(blockchainMetadataFile, JSON.stringify(metadata, null, 2));
  return record;
}

function verifyHashRecord(fileName, hashValue) {
  const existing = fs.readFileSync(hashFile, 'utf8').trim().split('\n');
  return existing[0] === fileName && existing[1] === hashValue;
}

function getStoredHashRecord(fileName) {
  if (!fs.existsSync(blockchainMetadataFile)) {
    return null;
  }

  try {
    const metadata = JSON.parse(fs.readFileSync(blockchainMetadataFile, 'utf8'));
    return metadata[fileName] || null;
  } catch (error) {
    return null;
  }
}

function listUploadedDocuments(directory = uploadDir) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const fullPath = path.join(directory, entry.name);
      const stats = fs.statSync(fullPath);

      return {
        name: entry.name,
        size: stats.size,
        uploadedAt: stats.mtime.toISOString(),
        url: `uploads/${entry.name}`
      };
    })
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

function getGoogleDriveCredentials() {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    return JSON.parse(rawJson);
  }

  const jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;
  if (jsonPath && fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  return null;
}

async function uploadToGoogleDrive(filePath, originalName, options = {}) {
  const credentials = getGoogleDriveCredentials();
  if (!credentials) {
    throw new Error('Google Drive credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_JSON_PATH.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });

  const drive = google.drive({ version: 'v3', auth });
  const fileMetadata = {
    name: originalName,
    parents: options.folderId ? [options.folderId] : []
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(filePath)
    },
    fields: 'id,name,webViewLink,webContentLink'
  });

  return response.data;
}

function invokeCoreCommand(command) {
  const corePath = path.join(__dirname, '..', '..', 'core');
  return execFileSync(command[0], command.slice(1), {
    cwd: corePath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

module.exports = {
  createHash,
  runCoreAction,
  encryptFile,
  decryptFile,
  buildHashRecordMetadata,
  storeHashRecord,
  verifyHashRecord,
  getStoredHashRecord,
  uploadToGoogleDrive,
  invokeCoreCommand,
  listUploadedDocuments,
  uploadDir,
  encryptedDir,
  decryptedDir,
  hashFile
};

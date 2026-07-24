const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createHash,
  runCoreAction,
  encryptFile,
  decryptFile,
  storeHashRecord,
  verifyHashRecord,
  getStoredHashRecord,
  uploadToGoogleDrive,
  invokeCoreCommand,
  listUploadedDocuments
} = require('../services/fileService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const sourcePath = req.file.path;
    const originalName = req.file.originalname;
    const savedPath = path.resolve(path.join(__dirname, '..', 'uploads', req.file.filename + path.extname(originalName)));
    fs.renameSync(sourcePath, savedPath);

    const hash = createHash(savedPath);
    const uploadToGoogle = req.body.uploadToGoogle === 'true' || req.body.uploadToGoogle === true;
    const folderId = req.body.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || '';

    let googleDriveResult = null;
    if (uploadToGoogle) {
      googleDriveResult = await uploadToGoogleDrive(savedPath, originalName, { folderId });
    }

    res.json({
      message: 'File uploaded successfully',
      fileName: originalName,
      storedPath: savedPath,
      hash,
      googleDrive: googleDriveResult
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

router.post('/hash', (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required' });
    }

    const fullPath = path.resolve(filePath);
    const hash = createHash(fullPath);
    const coreResult = runCoreAction(fullPath, 'hash');
    res.json({ hash, core: coreResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hash generation failed', error: error.message });
  }
});

router.post('/encrypt', (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required' });
    }

    const fullPath = path.resolve(filePath);
    const outputPath = path.join(__dirname, '..', '..', 'core', 'encrypted', path.basename(fullPath) + '.enc');
    encryptFile(fullPath, outputPath);
    const coreResult = runCoreAction(fullPath, 'encrypt');
    res.json({ message: 'File encrypted', outputPath, core: coreResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Encryption failed', error: error.message });
  }
});

router.post('/decrypt', (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required' });
    }

    const fullPath = path.resolve(filePath);
    const encryptedPath = path.join(__dirname, '..', '..', 'core', 'encrypted', path.basename(fullPath) + '.enc');
    const outputPath = path.join(__dirname, '..', '..', 'core', 'decrypted', path.basename(fullPath));

    if (!fs.existsSync(encryptedPath)) {
      return res.status(400).json({ message: 'No encrypted file found for decryption. Encrypt a file first.' });
    }

    decryptFile(encryptedPath, outputPath);
    const coreResult = runCoreAction(encryptedPath, 'decrypt');
    res.json({ message: 'File decrypted', outputPath, core: coreResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Decryption failed', error: error.message });
  }
});

router.post('/store-hash', (req, res) => {
  try {
    const { fileName, hash } = req.body;
    if (!fileName || !hash) {
      return res.status(400).json({ message: 'File name and hash are required' });
    }

    const record = storeHashRecord(fileName, hash);
    const coreResult = runCoreAction(path.join(__dirname, '..', '..', 'core', 'hash.txt'), 'store');
    res.json({
      message: 'Hash stored',
      fileName,
      hash,
      storedHash: record.hash,
      storedAt: record.storedAt,
      status: 'stored',
      core: coreResult
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hash storage failed', error: error.message });
  }
});

router.post('/verify-hash', (req, res) => {
  try {
    const { fileName, hash } = req.body;
    if (!fileName || !hash) {
      return res.status(400).json({ message: 'File name and hash are required' });
    }

    const verified = verifyHashRecord(fileName, hash);
    const storedRecord = getStoredHashRecord(fileName);
    const coreResult = runCoreAction(path.join(__dirname, '..', '..', 'core', 'hash.txt'), 'verify');
    res.json({
      verified,
      message: verified ? 'Integrity verified' : (storedRecord ? 'Integrity mismatch' : 'No blockchain record found'),
      fileName,
      currentHash: hash,
      storedHash: storedRecord?.hash || null,
      storedAt: storedRecord?.storedAt || null,
      status: verified ? 'verified' : (storedRecord ? 'mismatch' : 'missing'),
      core: coreResult
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/documents', (req, res) => {
  try {
    const documents = listUploadedDocuments();
    res.json({ documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load uploaded documents', error: error.message });
  }
});

module.exports = router;

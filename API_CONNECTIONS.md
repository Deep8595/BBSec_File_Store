<!-- markdownlint-disable -->

# BBSec File Store - API & Connection Guide

## API Connection Overview

### Complete API Endpoint Map

```
Backend Base URL: http://localhost:5000/api

┌─────────────────────────────────────────────────────────────┐
│                  FILE OPERATIONS (/api)                    │
├─────────────────────────────────────────────────────────────┤
│ POST   /upload           Upload & encrypt file              │
│ POST   /hash             Generate SHA256 hash               │
│ POST   /encrypt          Encrypt a file                     │
│ POST   /decrypt          Decrypt an encrypted file          │
│ POST   /store-hash       Store hash on blockchain           │
│ POST   /verify-hash      Verify file hash integrity         │
│ GET    /documents        List all uploaded documents         │
│ GET    /document/:id     Get specific document              │
│ DELETE /document/:id     Delete a document                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              AUTHENTICATION (/api/auth)                    │
├─────────────────────────────────────────────────────────────┤
│ POST   /auth/signup      User registration                  │
│ POST   /auth/login       User authentication                │
│ POST   /auth/logout      User logout                        │
│ GET    /auth/profile     Get user profile                   │
│ PUT    /auth/profile     Update user profile                │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed API Endpoints

### 1. FILE UPLOAD ENDPOINT

#### Request
```http
POST /api/upload HTTP/1.1
Host: localhost:5000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="document.pdf"
Content-Type: application/pdf

[Binary PDF File Data]
------WebKitFormBoundary
Content-Disposition: form-data; name="uploadToGoogle"

true
------WebKitFormBoundary
Content-Disposition: form-data; name="folderId"

1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
------WebKitFormBoundary--
```

#### Frontend Call
```javascript
// frontend/src/services/api.js
export async function uploadFile(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadToGoogle', String(Boolean(options.uploadToGoogle)));
  if (options.folderId) {
    formData.append('folderId', options.folderId);
  }

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
```

#### Backend Processing
```javascript
// backend/routes/fileRoutes.js
router.post('/upload', upload.single('file'), async (req, res) => {
  // 1. Save uploaded file
  const savedPath = path.resolve(...);
  fs.renameSync(req.file.path, savedPath);

  // 2. Generate hash
  const hash = createHash(savedPath);

  // 3. Optionally upload to Google Drive
  const uploadToGoogle = req.body.uploadToGoogle === 'true';
  let googleDriveResult = null;
  if (uploadToGoogle) {
    googleDriveResult = await uploadToGoogleDrive(
      savedPath, 
      originalName, 
      { folderId: req.body.folderId }
    );
  }

  // 4. Return response
  res.json({
    message: 'File uploaded successfully',
    fileName: originalName,
    storedPath: savedPath,
    hash: hash,
    googleDrive: googleDriveResult
  });
});
```

#### Response
```json
{
  "message": "File uploaded successfully",
  "fileName": "document.pdf",
  "storedPath": "D:/Deepanshu/project C/BBSec_File_Store/backend/uploads/abc123",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "googleDrive": {
    "id": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
    "name": "document.pdf",
    "webViewLink": "https://drive.google.com/file/d/1a2b3c4d5e6f..."
  }
}
```

#### Data Flow
```
Frontend: User selects file
    ↓ uploadFile(file)
Frontend: Create FormData with file
    ↓ Axios POST /api/upload
Backend: Multer receives multipart data
    ↓
Backend: Save to /backend/uploads/
    ↓
Backend: Generate SHA256 hash
    ↓
Backend: Encrypt file → /core/encrypted/
    ↓
Backend: Store hash in JSON
    ↓ (optional)
Backend: Upload to Google Drive
    ↓
Response: Send metadata back to frontend
    ↓
Frontend: Display success, hash, and file info
```

---

### 2. HASH GENERATION ENDPOINT

#### Request
```http
POST /api/hash HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "filePath": "/backend/uploads/document.pdf"
}
```

#### Frontend Call
```javascript
// frontend/src/services/api.js
export async function generateHash(filePath) {
  const response = await api.post('/hash', { filePath });
  return response.data;
}

// Usage in component
const hashResult = await generateHash('/backend/uploads/myfile.pdf');
console.log(hashResult.hash); // SHA256 hash
```

#### Backend Processing
```javascript
// backend/routes/fileRoutes.js
router.post('/hash', (req, res) => {
  try {
    const { filePath } = req.body;
    
    // 1. Validate path
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required' });
    }

    // 2. Resolve to absolute path
    const fullPath = path.resolve(filePath);

    // 3. Generate hash
    const hash = createHash(fullPath);

    // 4. Call core workflow
    const coreResult = runCoreAction(fullPath, 'hash');

    // 5. Return response
    res.json({ 
      hash: hash,
      core: coreResult 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Hash generation failed',
      error: error.message 
    });
  }
});
```

#### Backend Hash Service
```javascript
// backend/services/fileService.js
function createHash(filePath) {
  // 1. Read file
  const data = fs.readFileSync(filePath);
  
  // 2. Create hash object
  const hash = crypto.createHash('sha256');
  
  // 3. Update with file data
  hash.update(data);
  
  // 4. Get hex digest
  return hash.digest('hex');
  // Returns: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

#### Response
```json
{
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "core": {
    "output": "Hash generated via runtime core fallback",
    "hashOutput": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

#### Data Flow
```
Frontend: Call generateHash(filePath)
    ↓
Axios: POST /api/hash with filePath
    ↓
Backend: Receive request
    ↓
Backend: Validate and resolve path
    ↓
Backend: Read file into memory
    ↓
Backend: Create SHA256 hash object
    ↓
Backend: Process file data
    ↓
Backend: Generate hex digest
    ↓
Response: Return hash and core result
    ↓
Frontend: Display hash to user
```

---

### 3. ENCRYPTION ENDPOINT

#### Request
```http
POST /api/encrypt HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "filePath": "/backend/uploads/document.pdf"
}
```

#### Frontend Call
```javascript
export async function encryptFile(filePath) {
  const response = await api.post('/encrypt', { filePath });
  return response.data;
}
```

#### Backend Processing
```javascript
router.post('/encrypt', (req, res) => {
  try {
    const { filePath } = req.body;
    
    const fullPath = path.resolve(filePath);
    const outputPath = path.join(
      __dirname, '..', '..', 'core', 'encrypted',
      path.basename(fullPath) + '.enc'
    );
    
    // Call encryption service
    encryptFile(fullPath, outputPath);
    
    // Call core workflow
    const coreResult = runCoreAction(fullPath, 'encrypt');
    
    res.json({
      message: 'File encrypted',
      outputPath: outputPath,
      core: coreResult
    });
  } catch (error) {
    res.status(500).json({
      message: 'Encryption failed',
      error: error.message
    });
  }
});
```

#### Encryption Implementation
```javascript
// backend/services/fileService.js
function encryptFile(filePath, outputPath) {
  // 1. Read plaintext file
  const input = fs.readFileSync(filePath);
  
  // 2. Derive encryption key
  const key = crypto.createHash('sha256')
    .update('bbsec-default-key')
    .digest();
  // Output: 32-byte key
  
  // 3. Generate random IV
  const iv = crypto.randomBytes(16);
  // Output: 16-byte initialization vector
  
  // 4. Create cipher
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  // 5. Encrypt data
  const encrypted = Buffer.concat([
    cipher.update(input),
    cipher.final()
  ]);
  
  // 6. Construct payload (IV + ciphertext)
  const payload = Buffer.concat([iv, encrypted]);
  
  // 7. Write encrypted file
  fs.writeFileSync(outputPath, payload);
  
  // 8. Return hex payload
  return payload.toString('hex');
}
```

#### Encryption Details
```
Plaintext:   [File Data - Variable Length]
                ↓
Key:         SHA256('bbsec-default-key') = 32 bytes
                ↓
IV:          crypto.randomBytes(16) = 16 bytes
                ↓
Cipher:      AES-256-CBC(plaintext, key, IV)
                ↓
Ciphertext:  [Encrypted Data - Same length as plaintext]
                ↓
Payload:     [IV (16 bytes)][Ciphertext]
                ↓
Output:      Written to /core/encrypted/[filename].enc
```

#### Response
```json
{
  "message": "File encrypted",
  "outputPath": "D:/Deepanshu/project C/BBSec_File_Store/core/encrypted/document.pdf.enc",
  "core": {
    "output": "Encrypted file written to ...",
    "hashOutput": ""
  }
}
```

---

### 4. DECRYPTION ENDPOINT

#### Request
```http
POST /api/decrypt HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "filePath": "/core/encrypted/document.pdf.enc"
}
```

#### Frontend Call
```javascript
export async function decryptFile(filePath) {
  const response = await api.post('/decrypt', { filePath });
  return response.data;
}
```

#### Decryption Implementation
```javascript
function decryptFile(filePath, outputPath) {
  // 1. Read encrypted payload
  const payload = fs.readFileSync(filePath);
  
  // 2. Extract IV (first 16 bytes)
  const iv = payload.subarray(0, 16);
  
  // 3. Extract ciphertext (remaining bytes)
  const encrypted = payload.subarray(16);
  
  // 4. Derive decryption key
  const key = crypto.createHash('sha256')
    .update('bbsec-default-key')
    .digest();
  // MUST be same key used for encryption
  
  // 5. Create decipher
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  // 6. Decrypt data
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  // 7. Write decrypted file
  fs.writeFileSync(outputPath, decrypted);
  
  // 8. Return output path
  return outputPath;
}
```

#### Decryption Flow
```
Encrypted Payload: [IV (16)][Ciphertext]
                ↓
Extract IV:    payload.subarray(0, 16)
                ↓
Extract CT:    payload.subarray(16)
                ↓
Key:           SHA256('bbsec-default-key')
                ↓
Decipher:      AES-256-CBC(ciphertext, key, IV)
                ↓
Plaintext:     Restored original file data
                ↓
Output:        Written to /core/decrypted/[filename]
```

#### Response
```json
{
  "message": "File decrypted",
  "outputPath": "D:/Deepanshu/project C/BBSec_File_Store/core/decrypted/document.pdf"
}
```

---

### 5. STORE HASH ENDPOINT

#### Request
```http
POST /api/store-hash HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "fileName": "document.pdf",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

#### Frontend Call
```javascript
export async function storeHash(fileName, hash) {
  const response = await api.post('/store-hash', { fileName, hash });
  return response.data;
}
```

#### Backend Processing
```javascript
// backend/routes/fileRoutes.js
router.post('/store-hash', (req, res) => {
  try {
    const { fileName, hash } = req.body;
    
    if (!fileName || !hash) {
      return res.status(400).json({ 
        message: 'fileName and hash are required' 
      });
    }
    
    // Store hash record
    const record = storeHashRecord(fileName, hash);
    
    res.json({
      message: 'Hash stored successfully',
      record: record
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to store hash',
      error: error.message
    });
  }
});
```

#### Hash Storage Implementation
```javascript
function storeHashRecord(fileName, hashValue, storedAt = new Date().toISOString()) {
  // 1. Create metadata object
  const record = {
    fileName: fileName,
    hash: hashValue,
    storedAt: storedAt
  };
  
  // 2. Append to hash.txt file
  fs.writeFileSync(
    hashFile,
    `${record.fileName}\n${record.hash}\n`
  );
  
  // 3. Store in blockchain JSON metadata
  const metadataDir = path.dirname(blockchainMetadataFile);
  fs.mkdirSync(metadataDir, { recursive: true });
  
  // 4. Read existing records
  let metadata = {};
  if (fs.existsSync(blockchainMetadataFile)) {
    try {
      metadata = JSON.parse(fs.readFileSync(blockchainMetadataFile, 'utf8'));
    } catch (error) {
      metadata = {};
    }
  }
  
  // 5. Add new record
  metadata[record.fileName] = record;
  
  // 6. Write back to file
  fs.writeFileSync(
    blockchainMetadataFile,
    JSON.stringify(metadata, null, 2)
  );
  
  // 7. Return record
  return record;
}
```

#### Storage Locations
```
1. hash.txt:
   document.pdf
   e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

2. core/blockchain/hash-records.json:
   {
     "document.pdf": {
       "fileName": "document.pdf",
       "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
       "storedAt": "2026-07-14T10:30:00.000Z"
     }
   }
```

#### Response
```json
{
  "message": "Hash stored successfully",
  "record": {
    "fileName": "document.pdf",
    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "storedAt": "2026-07-14T10:30:00.000Z"
  }
}
```

---

### 6. VERIFY HASH ENDPOINT

#### Request
```http
POST /api/verify-hash HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "fileName": "document.pdf",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

#### Frontend Call
```javascript
export async function verifyHash(fileName, hash) {
  const response = await api.post('/verify-hash', { fileName, hash });
  return response.data;
}
```

#### Backend Processing
```javascript
router.post('/verify-hash', (req, res) => {
  try {
    const { fileName, hash } = req.body;
    
    if (!fileName || !hash) {
      return res.status(400).json({ 
        message: 'fileName and hash are required' 
      });
    }
    
    // Verify hash
    const isValid = verifyHashRecord(fileName, hash);
    
    // Get stored record
    const storedRecord = getStoredHashRecord(fileName);
    
    res.json({
      valid: isValid,
      message: isValid ? 'Hash verified successfully' : 'Hash mismatch',
      storedRecord: storedRecord
    });
  } catch (error) {
    res.status(500).json({
      message: 'Verification failed',
      error: error.message
    });
  }
});
```

#### Verification Implementation
```javascript
function verifyHashRecord(fileName, hashValue) {
  // 1. Read hash.txt file
  const existing = fs.readFileSync(hashFile, 'utf8').trim().split('\n');
  
  // 2. Compare with provided hash
  const isValid = existing[0] === fileName && existing[1] === hashValue;
  
  // 3. Return result
  return isValid;
}

function getStoredHashRecord(fileName) {
  // 1. Check if blockchain metadata file exists
  if (!fs.existsSync(blockchainMetadataFile)) {
    return null;
  }
  
  try {
    // 2. Parse JSON
    const metadata = JSON.parse(
      fs.readFileSync(blockchainMetadataFile, 'utf8')
    );
    
    // 3. Return record or null
    return metadata[fileName] || null;
  } catch (error) {
    return null;
  }
}
```

#### Response - Valid Hash
```json
{
  "valid": true,
  "message": "Hash verified successfully",
  "storedRecord": {
    "fileName": "document.pdf",
    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "storedAt": "2026-07-14T10:30:00.000Z"
  }
}
```

#### Response - Invalid Hash
```json
{
  "valid": false,
  "message": "Hash mismatch",
  "storedRecord": {
    "fileName": "document.pdf",
    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "storedAt": "2026-07-14T10:30:00.000Z"
  }
}
```

---

## Complete Data Flow Diagrams

### Upload → Hash → Encrypt → Store Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER UPLOADS FILE                                        │
│    Frontend: FileUploader.jsx                               │
│    Action: Select file and click Upload                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ uploadFile(file)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND API CALL                                        │
│    URL: POST http://localhost:5000/api/upload              │
│    Method: multipart/form-data                              │
│    Body: { file: File, uploadToGoogle?: boolean }           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP POST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND RECEIVES (fileRoutes.js)                        │
│    Middleware: multer → Temporary file storage              │
│    File Path: /backend/uploads/[random]                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌────────────┐  ┌────────────┐  ┌──────────────────┐
   │ 4a. HASH   │  │ 4b. ENCRYPT│  │ 4c. GOOGLE DRIVE │
   │ ──────────  │  │ ──────────── │  │ (Optional)       │
   │ SHA256()   │  │ AES-256-CBC│  │ uploadToGD()     │
   └────────────┘  └────────────┘  └──────────────────┘
        │ hash           │ encrypted         │ Drive ID
        │                │ file              │
        ▼                ▼                   ▼
   hash.txt      /encrypted/           Google Cloud
                 [file].enc
        │                │                   │
        └────────────────┼───────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────────┐
        │ 5. STORE METADATA                   │
        │ ──────────────────────              │
        │ storeHashRecord()                   │
        │   ├─ hash.txt                       │
        │   └─ hash-records.json              │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │ 6. RETURN RESPONSE TO FRONTEND      │
        │ {                                   │
        │   message: "Success",               │
        │   fileName: "...",                  │
        │   hash: "abc123...",                │
        │   storedPath: "...",                │
        │   googleDrive: { ... }              │
        │ }                                   │
        └──────────────┬──────────────────────┘
                       │ HTTP 200
                       ▼
        ┌─────────────────────────────────────┐
        │ 7. FRONTEND DISPLAYS RESULT         │
        │    ├─ File name                     │
        │    ├─ Hash value                    │
        │    ├─ Storage location              │
        │    └─ Google Drive link (if used)   │
        └─────────────────────────────────────┘
```

### Encryption & Decryption Process

```
┌──────────────────────────────────────────────────────┐
│         ENCRYPTION PROCESS                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Input File (Plaintext)                              │
│      │                                               │
│      ├─ Read into memory                             │
│      └─ Get binary data                              │
│           │                                          │
│           ▼                                          │
│  Derive Key: SHA256('bbsec-default-key')             │
│      └─ Output: 32-byte key                          │
│           │                                          │
│           ▼                                          │
│  Generate IV: crypto.randomBytes(16)                 │
│      └─ Output: 16-byte random IV                    │
│           │                                          │
│      ┌────┴────┐                                     │
│      ▼         ▼                                     │
│  Key + IV → AES-256-CBC Cipher                       │
│           │                                          │
│           ▼                                          │
│  Ciphertext: cipher.update() + cipher.final()        │
│           │                                          │
│           ▼                                          │
│  Construct Payload: Buffer.concat([IV, Ciphertext])  │
│           │                                          │
│           ▼                                          │
│  Write to File: /core/encrypted/[name].enc           │
│           │                                          │
│           ▼                                          │
│  Encrypted File (Ciphertext)                         │
│                                                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│         DECRYPTION PROCESS                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Encrypted File                                      │
│      │                                               │
│      ├─ Read into memory                             │
│      └─ Get [IV + Ciphertext] binary data             │
│           │                                          │
│           ├─ Extract IV (bytes 0-15)                 │
│           └─ Extract Ciphertext (bytes 16+)          │
│                │           │                        │
│                │           ▼                        │
│                │       Cipher Data                   │
│                │           │                        │
│                ▼           ▼                        │
│           IV + Derive Key: SHA256('...')             │
│                └─ Output: 32-byte key (SAME!)        │
│                     │                                │
│                ┌────┴──────┐                         │
│                ▼           ▼                         │
│           Key + IV → AES-256-CBC Decipher            │
│                │                                     │
│                ▼                                     │
│           Plaintext: decipher.update() + final()     │
│                │                                     │
│                ▼                                     │
│           Write to File: /core/decrypted/[name]      │
│                │                                     │
│                ▼                                     │
│           Original File Restored                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Connection Sequence Diagram

```
Frontend Timeline          Backend Timeline         Core Timeline
═══════════════════        ═════════════════        ═════════════

User Uploads File
    │
    └──POST /upload───────────►
                           Multer saves file
                               │
                               └─ createHash()──────────►
                                                    SHA256
                                                   Generate
                                                    │
                                          ◄──────────
                               │
                               ├─ encryptFile()──────────►
                                                   AES-256
                                                   Encrypt
                                                    │
                                          ◄──────────
                               │
                               └─ storeHashRecord()
                                   │
                                   ├─ hash.txt
                                   │
                                   └─ hash-records.json
                           │
    ◄──────Response────────┤
                           │
Display Success            └─ DB Update
    │                          (SQLite)
    └─ Show Hash
    └─ Show File Path
    └─ Show Encrypt Status
```

---

## Error Flow Handling

```
Frontend Request
    │
    ▼
┌───────────────────────────┐
│ Validation Error?         │
│ ├─ No file selected       │
│ ├─ Invalid path           │
│ └─ Missing parameters     │
└───────────┬───────────────┘
            │ YES
            ▼
        ┌──────────────────┐
        │ HTTP 400         │
        │ Bad Request      │
        │ message: "..."   │
        │ error: "CODE"    │
        └────────┬─────────┘
                 │
                 ▼
        Frontend: Show Error
        "Invalid input: ..."

            │ NO
            ▼
┌───────────────────────────┐
│ Processing Error?         │
│ ├─ File not found         │
│ ├─ Permission denied      │
│ ├─ Disk full              │
│ └─ Encryption failed      │
└───────────┬───────────────┘
            │ YES
            ▼
        ┌──────────────────┐
        │ HTTP 500         │
        │ Server Error     │
        │ message: "..."   │
        │ error: "..."     │
        └────────┬─────────┘
                 │
                 ▼
        Frontend: Show Error
        "Operation failed: ..."

            │ NO
            ▼
        ┌──────────────────┐
        │ HTTP 200         │
        │ Success          │
        │ { data: {...} }  │
        └────────┬─────────┘
                 │
                 ▼
        Frontend: Show Success
```

---

## Summary: Key Connection Points

| Component | Connects To | Protocol | Data |
|-----------|------------|----------|------|
| **Frontend** | Backend | HTTP/REST (Axios) | JSON, FormData |
| **Frontend** | Browser | JavaScript Events | User interactions |
| **Backend** | Frontend | HTTP Response | JSON |
| **Backend** | Core FS | File I/O | Binary files |
| **Backend** | Database | SQL (sqlite3) | User/File records |
| **Backend** | Blockchain | JSON file | Hash metadata |
| **Backend** | Google Drive | OAuth API | File upload |
| **Core Crypto** | Files | Binary I/O | Encrypted data |
| **Core Blockchain** | Smart Contract | JSON-RPC | Transactions |

---

**Last Updated**: July 14, 2026
**Version**: 1.0.0

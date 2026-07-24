<!-- markdownlint-disable -->

# BBSec File Store - Technical Architecture Guide

## Table of Contents
1. [System Architecture Diagram](#system-architecture-diagram)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Core System Architecture](#core-system-architecture)
5. [Data Models](#data-models)
6. [Communication Protocols](#communication-protocols)
7. [File Processing Pipeline](#file-processing-pipeline)
8. [Cryptographic Operations](#cryptographic-operations)
9. [Blockchain Integration](#blockchain-integration)
10. [Error Handling](#error-handling)

---

## System Architecture Diagram

### High-Level Component Interaction

```
┌─────────────────────────────────────────────────────────────────────┐
│                    User Interaction Layer                            │
│                   (React Components - Frontend)                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    HTTP/REST (Axios)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                                  │
│                 (Express.js - Backend)                              │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐           │
│  │ Auth Routes │  │ File Routes  │  │ Document Routes │           │
│  └─────────────┘  └──────────────┘  └─────────────────┘           │
└────────────────────┬──────────────┬─────────────────────────────────┘
                     │              │
        ┌────────────▼──┐  ┌────────▼──────────┐
        │   File        │  │   Database        │
        │   Service     │  │   (SQLite3)       │
        │   Layer       │  │                   │
        └────────┬───────┘  └───────────────────┘
                 │
        ┌────────▼────────────────────┐
        │  Core Workflow Orchestrator │
        │  (runCoreWorkflow.js)       │
        └────────┬────────────────────┘
                 │
      ┌──────────┴──────────┬──────────────┐
      │                     │              │
      ▼                     ▼              ▼
   Crypto              Hash           Blockchain
   Module              Module         Module
   (crypto.c)          (hash.c)       (blockchain.c)
      │                     │              │
      ▼                     ▼              ▼
  /encrypted/          /hash.txt/    Hardhat/Solidity
   directory           records        Smart Contracts
```

### Data Flow Architecture

```
File Upload
    │
    ├─→ [Multipart Form Data]
    │       │
    │       ▼
    │   Backend Multer
    │   (Temporary storage)
    │
    ├─→ Hash Generation
    │       │ createHash()
    │       ▼
    │   SHA256 Hash
    │       │
    │       ├─→ [Database Storage]
    │       ├─→ [Blockchain JSON]
    │       └─→ [Blockchain Smart Contract]
    │
    ├─→ Encryption
    │       │ encryptFile()
    │       ├─→ AES-256-CBC
    │       │   ├─ Key: SHA256('bbsec-default-key')
    │       │   ├─ IV: Random 16 bytes
    │       │   └─ Output: IV + Ciphertext
    │       │
    │       ▼
    │   /core/encrypted/
    │
    ├─→ Google Drive Upload (Optional)
    │       │ uploadToGoogleDrive()
    │       │
    │       ▼
    │   Google Cloud Storage
    │
    └─→ Response to Frontend
            {
              "fileName": "...",
              "hash": "...",
              "storedPath": "...",
              "googleDrive": { ... }
            }
```

---

## Frontend Architecture

### Component Hierarchy

```
App (root)
│
└── Dashboard (pages/Dashboard.jsx)
    │
    ├── Navbar
    │   └── Navigation links
    │
    ├── Sidebar
    │   └── Menu options
    │
    ├── Main Content
    │   ├── AuthPanel
    │   │   ├── Signup form
    │   │   └── Login form
    │   │
    │   ├── FileUploader
    │   │   ├── Drop zone
    │   │   ├── File input
    │   │   └── Progress indicator
    │   │
    │   ├── FeatureHighlights
    │   │   ├── Encryption feature
    │   │   ├── Hash feature
    │   │   └── Blockchain feature
    │   │
    │   ├── CryptoCard
    │   │   ├── Encrypt button
    │   │   └── Decrypt button
    │   │
    │   ├── HashCard
    │   │   ├── Generate hash button
    │   │   └── Display hash
    │   │
    │   ├── BlockchainCard
    │   │   ├── Store hash button
    │   │   └── Verify hash button
    │   │
    │   ├── StatusCard
    │   │   └── System status
    │   │
    │   └── UploadedDocumentsModal
    │       └── List of uploaded files
    │
    ├── Footer
    │
    └── Other Pages
        ├── History (pages/History.jsx)
        ├── Settings (pages/Settings.jsx)
        └── Upload (pages/Upload.jsx)
```

### API Service Module (`services/api.js`)

**Axios Instance Configuration**:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Export Functions**:
1. `uploadFile(file, options)` - Upload file with encryption
2. `generateHash(filePath)` - Generate SHA256 hash
3. `encryptFile(filePath)` - Encrypt existing file
4. `decryptFile(filePath)` - Decrypt file
5. `storeHash(fileName, hash)` - Store hash record
6. `verifyHash(fileName, hash)` - Verify file integrity
7. `signupUser(payload)` - User registration
8. `loginUser(payload)` - User authentication

---

## Backend Architecture

### Server Structure (`server.js`)

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Stack
app.use(cors());                              // Cross-Origin Resource Sharing
app.use(express.json());                      // JSON parser
app.use(express.urlencoded({ extended: true })); // URL-encoded parser
app.use('/uploads', express.static(...));    // Static file serving

// Route Handlers
app.use('/api', fileRoutes);                  // /api/upload, /api/hash, etc.
app.use('/api/auth', authRoutes);             // /api/auth/signup, /api/auth/login

// Initialize Database
initDb();

// Start Server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

### Routes Structure

**File Routes** (`routes/fileRoutes.js`):
```
POST   /upload        - Upload and process file
POST   /hash          - Generate file hash
POST   /encrypt       - Encrypt file
POST   /decrypt       - Decrypt file
POST   /store-hash    - Store hash on blockchain
POST   /verify-hash   - Verify hash integrity
GET    /documents     - List uploaded documents
GET    /document/:id  - Get specific document
DELETE /document/:id  - Delete document
```

**Auth Routes** (`routes/authRoutes.js`):
```
POST   /signup        - User registration
POST   /login         - User authentication
POST   /logout        - User logout
GET    /profile       - Get user profile
PUT    /profile       - Update profile
```

### Service Layer (`services/fileService.js`)

**Key Functions**:

```javascript
// 1. Hash Generation
function createHash(filePath)
  - Reads file from filePath
  - Generates SHA256 hash
  - Returns hex-encoded hash string
  - Output: "abcd1234..."

// 2. Encryption
function encryptFile(filePath, outputPath)
  - Reads file from filePath
  - Derives key: SHA256('bbsec-default-key')
  - Generates random IV (16 bytes)
  - Applies AES-256-CBC cipher
  - Prepends IV to ciphertext
  - Writes to outputPath
  - Returns hex-encoded payload

// 3. Decryption
function decryptFile(filePath, outputPath)
  - Reads encrypted file from filePath
  - Extracts IV (first 16 bytes)
  - Extracts ciphertext (remaining bytes)
  - Derives key: SHA256('bbsec-default-key')
  - Applies AES-256-CBC decipher
  - Writes decrypted data to outputPath
  - Returns outputPath

// 4. Hash Record Management
function storeHashRecord(fileName, hashValue, storedAt)
  - Creates metadata object
  - Appends to hash.txt file
  - Stores in blockchain JSON
  - Returns record object

function verifyHashRecord(fileName, hashValue)
  - Reads hash records
  - Compares with provided hash
  - Returns boolean

// 5. Blockchain Integration
function getStoredHashRecord(fileName)
  - Reads blockchain JSON
  - Retrieves hash record for file
  - Returns record object or null

// 6. Google Drive Integration
function uploadToGoogleDrive(path, name, options)
  - Initializes Google Drive API
  - Uploads file to specified folder
  - Returns file metadata
  - Returns: { id, name, webViewLink }

// 7. Document Listing
function listUploadedDocuments(directory)
  - Scans uploads directory
  - Returns array of files
  - Includes metadata (name, size, date)
```

### Database Layer (`db.js`)

**Tables**:

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  fullName TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Files Table
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  fileName TEXT NOT NULL,
  originalName TEXT,
  filePath TEXT,
  hash TEXT NOT NULL,
  encryptedPath TEXT,
  fileSize INTEGER,
  uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Hash Records Table
CREATE TABLE IF NOT EXISTS hashRecords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fileId INTEGER NOT NULL,
  hash TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  storedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fileId) REFERENCES files(id)
);
```

### Core Workflow Integration (`scripts/runCoreWorkflow.js`)

```javascript
function runCoreWorkflow({ filePath, action })
  // Actions: 'hash', 'encrypt', 'decrypt'
  
  // 1. Copy file to temp location
  fs.copyFileSync(targetFile, tempFile);
  
  // 2. Execute action based on type
  switch(action) {
    case 'hash':
      - Read temp file
      - Generate SHA256
      - Store in hash.txt
      - Return hash
      
    case 'encrypt':
      - Read temp file
      - Generate IV
      - Apply AES-256-CBC
      - Write to encrypted directory
      - Return output path
      
    case 'decrypt':
      - Read encrypted file
      - Extract IV
      - Apply AES-256-CBC decipher
      - Write to decrypted directory
      - Return output path
  }
  
  // 3. Return result object
  Return: {
    output: "descriptive message",
    hashOutput: "hash or empty string"
  }
```

---

## Core System Architecture

### C Program Structure

**Main Menu** (`src/main.c`):
```c
while(1) {
  Display menu:
  1. Read File
  2. Generate SHA256 Hash
  3. Encrypt File
  4. Decrypt File
  5. Store Hash on Blockchain
  6. Verify File Integrity
  7. Exit
  
  Get user choice
  Call appropriate function
  Display result
}
```

### Cryptography Module (`src/crypto.c`)

**Key Functions**:
```c
void derive_key(const char *password, unsigned char *key)
  - Input: password string
  - Process: SHA256 hash of password
  - Output: 32-byte key for AES-256
  
void encrypt_aes256_cbc(unsigned char *plaintext, int plaintext_len,
                        unsigned char *key, unsigned char *iv,
                        unsigned char *ciphertext)
  - Uses OpenSSL EVP functions
  - Input: plaintext, key, IV
  - Process: AES-256-CBC encryption
  - Output: ciphertext
  
void decrypt_aes256_cbc(unsigned char *ciphertext, int ciphertext_len,
                        unsigned char *key, unsigned char *iv,
                        unsigned char *plaintext)
  - Uses OpenSSL EVP functions
  - Input: ciphertext, key, IV
  - Process: AES-256-CBC decryption
  - Output: plaintext
  
void generate_iv(unsigned char *iv)
  - Generates 16 cryptographically random bytes
  - Output: IV for CBC mode
```

### Hash Module (`src/hash.c`)

**Key Functions**:
```c
void compute_sha256(const char *filename, char *hash_output)
  - Input: filename to hash
  - Process: 
    - Open file
    - Read in chunks (4KB blocks)
    - Update SHA256 context
    - Finalize hash
  - Output: hex-encoded SHA256 hash (64 chars)
  
void hash_string(const char *str, char *hash_output)
  - Input: string to hash
  - Process: SHA256 of string
  - Output: hex-encoded hash
```

### File Manager Module (`src/file_manager.c`)

**Key Functions**:
```c
int file_exists(const char *filepath)
  - Check if file exists
  - Return: 1 if exists, 0 if not
  
unsigned long get_file_size(const char *filepath)
  - Get file size in bytes
  - Return: file size or 0
  
void read_file(const char *filepath, unsigned char *buffer)
  - Read entire file into buffer
  - Handle error conditions
  
void write_file(const char *filepath, unsigned char *buffer, size_t size)
  - Write buffer to file
  - Handle error conditions
  
void list_files_in_directory(const char *directory)
  - Scan directory
  - Print file list
```

### Blockchain Module (`src/blockchain.c`)

**Key Functions**:
```c
void init_blockchain()
  - Initialize Hardhat connection
  - Load contract ABI
  - Connect to local/remote node
  
void store_hash_on_blockchain(const char *filename, const char *hash)
  - Input: filename, hash
  - Call FileStorage.sol storeHash()
  - Wait for transaction confirmation
  - Print transaction receipt
  
int verify_hash_on_blockchain(const char *filename, const char *hash)
  - Input: filename, hash
  - Call FileStorage.sol verifyHash()
  - Return verification result
  
void get_hash_from_blockchain(const char *filename)
  - Input: filename
  - Call FileStorage.sol getHash()
  - Return stored hash
```

---

## Data Models

### Frontend State Management

```javascript
// File Upload State
{
  file: File object,
  fileName: string,
  fileSize: number,
  uploadProgress: percentage,
  isUploading: boolean,
  error: string | null,
  success: boolean
}

// Hash State
{
  filePath: string,
  hash: string,
  isGenerating: boolean,
  error: string | null
}

// Encryption State
{
  filePath: string,
  encryptedPath: string,
  isEncrypting: boolean,
  error: string | null
}

// Blockchain State
{
  transactionHash: string,
  blockchainStatus: 'pending' | 'confirmed' | 'failed',
  contractAddress: string,
  error: string | null
}

// User State
{
  userId: number,
  username: string,
  isAuthenticated: boolean,
  token: string | null
}
```

### Backend Data Models

**User Model**:
```javascript
{
  id: Integer (primary key),
  username: String (unique),
  password: String (hashed),
  fullName: String,
  createdAt: DateTime
}
```

**File Model**:
```javascript
{
  id: Integer (primary key),
  userId: Integer (foreign key),
  fileName: String,
  originalName: String,
  filePath: String (absolute path),
  hash: String (SHA256),
  encryptedPath: String,
  fileSize: Integer (bytes),
  uploadedAt: DateTime
}
```

**Hash Record Model**:
```javascript
{
  id: Integer (primary key),
  fileId: Integer (foreign key),
  hash: String (SHA256),
  verified: Boolean,
  storedAt: DateTime
}
```

**Blockchain Metadata** (`hash-records.json`):
```json
{
  "filename1": {
    "fileName": "filename1",
    "hash": "abcd1234...",
    "storedAt": "2026-07-14T10:30:00Z"
  },
  "filename2": {
    "fileName": "filename2",
    "hash": "efgh5678...",
    "storedAt": "2026-07-14T10:35:00Z"
  }
}
```

---

## Communication Protocols

### Frontend ↔ Backend (HTTP REST)

**Protocol**: HTTP/1.1
**Port**: 5000 (default)
**Content-Type**: application/json or multipart/form-data

**Request Example**:
```
POST /api/upload HTTP/1.1
Host: localhost:5000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="test.pdf"
Content-Type: application/pdf

[binary file data]
------WebKitFormBoundary
Content-Disposition: form-data; name="uploadToGoogle"

true
------WebKitFormBoundary--
```

**Response Example**:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "File uploaded successfully",
  "fileName": "test.pdf",
  "storedPath": "/absolute/path/to/file",
  "hash": "abc123def456...",
  "googleDrive": {
    "id": "1abc123def456...",
    "name": "test.pdf",
    "webViewLink": "https://drive.google.com/file/d/1abc123..."
  }
}
```

### Backend ↔ Core (File I/O + Process Execution)

**Mechanism 1**: Node.js Crypto Module
```javascript
// Direct use of crypto module
const crypto = require('crypto');
const hash = crypto.createHash('sha256');
hash.update(fileData);
const digest = hash.digest('hex');
```

**Mechanism 2**: Child Process Execution (if C binary used)
```javascript
const { execFileSync } = require('child_process');
const result = execFileSync('./core/bin/bbsec', [action, filePath]);
```

**Mechanism 3**: File-Based Communication
```
1. Backend writes file to /core/temp_upload.bin
2. Core program reads file
3. Core program processes (encrypt/hash/etc)
4. Core program writes output to /core/encrypted/ or /core/decrypted/
5. Backend reads output file
6. Backend returns result to frontend
```

### Backend ↔ Blockchain

**Protocol**: JSON-RPC 2.0
**Connection**: Hardhat Node (default: http://127.0.0.1:8545)

**Store Hash on Blockchain**:
```javascript
// Using ethers.js via Hardhat
const contract = await ethers.getContractAt("FileStorage", contractAddress);
const tx = await contract.storeHash(fileName, hashValue);
const receipt = await tx.wait();

// Request:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendTransaction",
  "params": [{
    "to": "0xContractAddress",
    "data": "0xEncodedFunctionCall",
    "gas": "0x5208"
  }]
}

// Response:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0xTransactionHash"
}
```

---

## File Processing Pipeline

### Detailed Upload Flow

```
1. USER INITIATES UPLOAD
   └─ Frontend: FileUploader.jsx renders

2. FILE SELECTION
   └─ User clicks "Choose File" or drag-drops
   └─ File object created: { name, size, type, lastModified }

3. FRONTEND API CALL
   └─ uploadFile(file, { uploadToGoogle: boolean, folderId: string })
   └─ Create FormData
   └─ POST /api/upload

4. BACKEND RECEIVES REQUEST
   └─ Multer middleware processes multipart/form-data
   └─ Temporary file stored in /backend/uploads/[random]
   └─ File metadata: { file: { path, originalname, filename, size } }

5. BACKEND PROCESSING
   a) File Management:
      └─ Rename temp file with original name
      └─ Save path to database
      
   b) Hash Generation:
      └─ Read file contents
      └─ Generate SHA256 hash
      └─ Store in /core/hash.txt
      └─ Store in /core/blockchain/hash-records.json
      
   c) Encryption (Optional):
      └─ Read file contents
      └─ Generate AES-256 key from 'bbsec-default-key'
      └─ Generate random IV
      └─ Apply AES-256-CBC cipher
      └─ Prepend IV to ciphertext
      └─ Write to /core/encrypted/[filename].enc
      
   d) Google Drive Upload (Optional):
      └─ Initialize Google Drive API
      └─ Call files.create()
      └─ Upload file to specified folder
      └─ Get shared link
      
   e) Response Creation:
      └─ Compile response object
      └─ Include: fileName, storedPath, hash, googleDrive metadata

6. FRONTEND RECEIVES RESPONSE
   └─ Update UI with success message
   └─ Display file details and hash
   └─ Update documents list

7. DATA PERSISTENCE
   └─ SQLite: File record created
   └─ File System: Original and encrypted files stored
   └─ Blockchain JSON: Hash record persisted
```

### Detailed Encryption/Decryption Flow

**Encryption Process**:
```
Plaintext File
    │
    ├─ Read file into memory
    │
    ├─ Derive encryption key
    │   └─ SHA256('bbsec-default-key') → 32-byte key
    │
    ├─ Generate IV
    │   └─ crypto.randomBytes(16) → 16-byte IV
    │
    ├─ Apply AES-256-CBC
    │   ├─ Input: plaintext, key, IV
    │   ├─ Output: ciphertext
    │   └─ Length: same as plaintext
    │
    ├─ Construct encrypted payload
    │   └─ [16-byte IV][ciphertext]
    │
    ├─ Write to /core/encrypted/[filename].enc
    │
    └─ Return encrypted file path

Encrypted File
```

**Decryption Process**:
```
Encrypted File
    │
    ├─ Read file into memory
    │
    ├─ Extract IV (first 16 bytes)
    │   └─ payload.subarray(0, 16)
    │
    ├─ Extract ciphertext (remaining bytes)
    │   └─ payload.subarray(16)
    │
    ├─ Derive decryption key
    │   └─ SHA256('bbsec-default-key') → 32-byte key
    │   └─ MUST be same as encryption key
    │
    ├─ Apply AES-256-CBC decipher
    │   ├─ Input: ciphertext, key, IV
    │   ├─ Output: plaintext
    │   └─ Length: same as ciphertext
    │
    ├─ Write to /core/decrypted/[filename]
    │
    └─ Return decrypted file path

Plaintext File
```

---

## Cryptographic Operations

### AES-256-CBC Implementation

**Algorithm**: Advanced Encryption Standard (AES) with 256-bit key
**Mode**: Cipher Block Chaining (CBC)
**Block Size**: 128 bits (16 bytes)
**Key Size**: 256 bits (32 bytes)
**IV Size**: 128 bits (16 bytes)

**Key Derivation**:
```javascript
const keyString = 'bbsec-default-key';
const key = crypto.createHash('sha256')
                   .update(keyString)
                   .digest(); // 32 bytes
```

⚠️ **Security Note**: This is a default/static key. For production:
- Use per-file random keys
- Store keys securely (KMS, vault)
- Implement key rotation

**Encryption Operation**:
```javascript
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const encrypted = Buffer.concat([
  cipher.update(plaintext),
  cipher.final()
]);
const payload = Buffer.concat([iv, encrypted]);
```

**Decryption Operation**:
```javascript
const iv = payload.subarray(0, 16);
const encrypted = payload.subarray(16);
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
const plaintext = Buffer.concat([
  decipher.update(encrypted),
  decipher.final()
]);
```

### SHA256 Hash Implementation

**Algorithm**: SHA-2 family, 256-bit output
**Output**: 64 hexadecimal characters
**Use**: File integrity verification

**Hash Generation**:
```javascript
const hash = crypto.createHash('sha256');
hash.update(fileData);
const digest = hash.digest('hex'); // 64-char hex string
```

**Properties**:
- Deterministic: Same input → Same output
- One-way: Cannot reverse from hash to original
- Collision-resistant: Different inputs produce different hashes
- Fixed length: Always 256 bits (64 hex chars)

---

## Blockchain Integration

### Smart Contract (`FileStorage.sol`)

```solidity
pragma solidity ^0.8.20;

contract FileStorage {
  // Mapping: fileName → hash
  mapping(string => bytes32) public fileHashes;
  
  // Event: Hash stored
  event HashStored(string indexed fileName, bytes32 hash, uint256 timestamp);
  
  // Store hash
  function storeHash(string memory fileName, bytes32 hash) public {
    fileHashes[fileName] = hash;
    emit HashStored(fileName, hash, block.timestamp);
  }
  
  // Verify hash
  function verifyHash(string memory fileName, bytes32 hash) 
    public view returns (bool) {
    return fileHashes[fileName] == hash;
  }
  
  // Retrieve hash
  function getHash(string memory fileName) 
    public view returns (bytes32) {
    return fileHashes[fileName];
  }
}
```

### Deployment Process

1. **Compile Contract**:
   ```bash
   npx hardhat compile
   ```
   Outputs: `/core/blockchain/artifacts/contracts/FileStorage.sol/FileStorage.json`

2. **Deploy to Local Network**:
   ```bash
   npx hardhat run scripts/deploy.js --network hardhat
   ```
   Returns: Contract address (e.g., 0x5FbDB2315678afccb333f8a9c5662a4C34EA6d62)

3. **Store Hash on Blockchain**:
   ```bash
   npx hardhat run scripts/storeHash.js --network hardhat
   ```
   Calls: `contract.storeHash(fileName, hash)`

4. **Verify Hash on Blockchain**:
   ```bash
   npx hardhat run scripts/verifyHash.js --network hardhat
   ```
   Calls: `contract.verifyHash(fileName, hash)`

### Transaction Flow

```
Backend Request
    │
    ├─ Connect to Hardhat network
    │  └─ ethers.getContractAt(ABI, contractAddress)
    │
    ├─ Call contract method
    │  ├─ Serialize parameters
    │  ├─ Create transaction
    │  └─ Send to blockchain
    │
    ├─ Wait for confirmation
    │  └─ tx.wait(confirmations = 1)
    │
    ├─ Get receipt
    │  ├─ Transaction hash
    │  ├─ Block number
    │  ├─ Gas used
    │  └─ Status (success/failure)
    │
    └─ Return response to frontend
       {
         "transactionHash": "0x...",
         "blockNumber": 123,
         "gasUsed": "45000",
         "status": "success"
       }
```

---

## Error Handling

### Frontend Error Handling

```javascript
try {
  const response = await uploadFile(file);
  // Success: Update UI
} catch (error) {
  if (error.response?.status === 400) {
    // Validation error
    showError("Invalid input");
  } else if (error.response?.status === 500) {
    // Server error
    showError("Backend server error");
  } else if (error.code === 'ECONNREFUSED') {
    // Connection error
    showError("Cannot connect to backend");
  } else {
    // Unknown error
    showError(error.message);
  }
}
```

### Backend Error Handling

```javascript
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Validation
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded',
        error: 'FILE_NOT_PROVIDED'
      });
    }
    
    // Processing
    const hash = createHash(savedPath);
    
    // Response
    res.json({ message: 'Success', ...data });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Upload failed',
      error: error.message
    });
  }
});
```

### Common Error Scenarios

**1. File Upload Fails**
```
Error: ENOENT: no such file or directory
Cause: Upload directory doesn't exist
Fix: Ensure /backend/uploads/ directory exists and is writable
```

**2. Encryption Fails**
```
Error: TypeError: Cannot read property 'update' of undefined
Cause: crypto module not imported correctly
Fix: npm install crypto (usually built-in, check import)
```

**3. Backend Not Reachable**
```
Error: ECONNREFUSED 127.0.0.1:5000
Cause: Backend server not running
Fix: Start backend: npm start in /backend/
```

**4. CORS Error**
```
Error: Access to XMLHttpRequest blocked by CORS policy
Cause: Frontend and backend on different origins
Fix: Enable CORS: app.use(cors()) in server.js
```

**5. Hash Mismatch**
```
Error: Hash verification failed
Cause: File modified after upload/encryption
Fix: Re-generate hash or check file integrity
```

---

## Performance Considerations

### File Size Limits
- **Recommended Max**: 100MB (adjustable)
- **Buffer Approach**: Stream large files in chunks
- **Current Implementation**: Reads entire file into memory

### Encryption Performance
- **Small Files** (<10MB): <100ms
- **Medium Files** (10-50MB): 100-500ms
- **Large Files** (50-100MB): 500ms-2s
- **Optimization**: Use streams for large files

### Database Performance
- **Current**: SQLite (single-threaded)
- **Scaling**: Consider PostgreSQL for production
- **Indexing**: Add indexes on frequently queried columns

### Blockchain Operations
- **Confirmation Time**: ~12 seconds per block (Hardhat varies)
- **Gas Cost**: Variable based on network
- **Optimization**: Batch operations, use flashbots

---

## Security Hardening Checklist

- [ ] Change default encryption key
- [ ] Implement JWT authentication
- [ ] Add input validation and sanitization
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Add logging and monitoring
- [ ] Use environment variables for secrets
- [ ] Implement access control (roles/permissions)
- [ ] Add file type validation
- [ ] Implement virus scanning
- [ ] Use parameterized database queries
- [ ] Add CSRF protection
- [ ] Implement audit logging
- [ ] Use secure headers (CSP, X-Frame-Options, etc.)
- [ ] Regular security updates

---

**Last Updated**: July 14, 2026
**Version**: 1.0.0

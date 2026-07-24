<!-- markdownlint-disable -->

# BBSec File Store - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [System Connections](#system-connections)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Core System (C/Blockchain)](#core-system-cblockchain)
7. [Setup & Installation](#setup--installation)
8. [Important Instructions](#important-instructions)
9. [API Endpoints](#api-endpoints)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**BBSec File Store** is a secure file management system that combines:
- **Frontend**: React-based user interface with Vite and Tailwind CSS
- **Backend**: Node.js/Express REST API server
- **Core**: C-based cryptographic operations with Ethereum blockchain integration
- **Blockchain**: Smart contracts for hash storage and verification

### Key Features
- ✅ Secure file encryption/decryption using AES-256-CBC
- ✅ SHA256 hash generation and storage
- ✅ Blockchain integration for immutable hash records
- ✅ Google Drive integration for cloud storage
- ✅ Multi-format file support
- ✅ File integrity verification

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  Port: 5173 (Dev) / Built static files (Production)          │
│  ├── Dashboard Component                                     │
│  ├── File Upload/Management                                  │
│  ├── Authentication Panel                                    │
│  └── Blockchain Status Display                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST (Axios)
                       │ Base URL: http://localhost:5000/api
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js/Express)                       │
│  Port: 5000                                                  │
│  ├── File Routes (/upload, /encrypt, /decrypt, /hash)       │
│  ├── Auth Routes (/signup, /login)                           │
│  ├── File Service (Core orchestration)                       │
│  ├── Database (SQLite3)                                      │
│  └── Core Workflow Integration                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ Child Process Execution / File I/O
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           CORE SYSTEM (C/Blockchain)                         │
│  ├── Cryptography Module (crypto.c)                          │
│  │   ├── AES-256 Encryption/Decryption                       │
│  │   └── Key derivation                                      │
│  ├── Hash Module (hash.c)                                    │
│  │   └── SHA256 hash generation                              │
│  ├── File Manager (file_manager.c)                           │
│  │   ├── File reading/writing                                │
│  │   └── Directory management                                │
│  ├── Blockchain Module (blockchain.c)                        │
│  │   ├── Hardhat Integration                                 │
│  │   └── Smart Contract Interaction                          │
│  └── Directories:                                            │
│      ├── /encrypted/ - Encrypted files                       │
│      ├── /decrypted/ - Decrypted files                       │
│      ├── /hash.txt - Hash records                            │
│      └── /blockchain/ - Hardhat project & contracts          │
└─────────────────────────────────────────────────────────────┘
```

---

## System Connections

### 1. Frontend → Backend Connection

**Frontend Service** (`frontend/src/services/api.js`):
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 20000,
});
```

**Key API Calls**:
- `uploadFile(file, options)` → POST `/upload`
- `generateHash(filePath)` → POST `/hash`
- `encryptFile(filePath)` → POST `/encrypt`
- `decryptFile(filePath)` → POST `/decrypt`
- `storeHash(fileName, hash)` → POST `/store-hash`
- `verifyHash(fileName, hash)` → POST `/verify-hash`
- `signupUser(payload)` → POST `/auth/signup`

### 2. Backend → Core Connection

**Backend Service** (`backend/services/fileService.js`):
- **File Encryption**: Calls `encryptFile()` using Node.js crypto module
- **Hash Generation**: Calls `createHash()` using SHA256
- **Core Workflow**: Calls `runCoreWorkflow()` from `runCoreWorkflow.js`

**Connection Points**:
```javascript
// Direct Node.js crypto operations
const crypto = require('crypto');
const key = crypto.createHash('sha256').update('bbsec-default-key').digest();
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

// C Program invocation (for compiled binaries)
const { execFileSync } = require('child_process');
invokeCoreCommand(filePath, 'encrypt'); // Would call C executable
```

### 3. Backend → Blockchain Connection

**Hash Storage & Verification**:
- Hashes are stored in `core/blockchain/hash-records.json`
- File: `backend/services/fileService.js` manages:
  ```javascript
  const blockchainMetadataFile = path.join(
    __dirname, '..', '..', 'core', 'blockchain', 'hash-records.json'
  );
  ```

**Smart Contract Integration** (`core/blockchain/contracts/FileStorage.sol`):
- Stores file hashes on Ethereum blockchain
- Provides immutable proof of file integrity
- Deployed via Hardhat scripts

### 4. File Flow Architecture

```
USER UPLOAD
    ↓
Frontend: FileUploader.jsx
    ↓
API: POST /upload (with file)
    ↓
Backend: fileRoutes.js → upload handler
    ↓
Service: fileService.js
    ├─→ Create SHA256 hash
    ├─→ Encrypt file (AES-256-CBC)
    ├─→ Store hash record
    ├─→ Store metadata in blockchain JSON
    └─→ Upload to Google Drive (optional)
    ↓
Core: /encrypted/ directory
    ↓
Response: Return to frontend
    ↓
Frontend: Update UI with success message
```

---

## Frontend Architecture

### Location
`frontend/` - React + Vite + Tailwind CSS

### Key Components

**1. Dashboard** (`src/pages/Dashboard.jsx`)
- Main landing page
- Orchestrates all features
- Shows file statistics

**2. File Upload** (`src/components/FileUploader.jsx`)
- Handles file selection
- Sends to backend API
- Shows upload progress

**3. Authentication** (`src/components/AuthPanel.jsx`)
- User signup/login
- Manages user sessions

**4. Blockchain Status** (`src/components/BlockchainCard.jsx`)
- Displays hash records
- Shows blockchain transaction status

**5. Crypto Operations** (`src/components/CryptoCard.jsx`)
- Encryption/Decryption UI
- Hash generation interface

**6. Additional Components**:
- `Navbar.jsx` - Navigation
- `Sidebar.jsx` - Menu
- `StatusCard.jsx` - System status
- `HashCard.jsx` - Hash management
- `UploadedDocumentsModal.jsx` - File list
- `FeatureHighlights.jsx` - Features overview
- `Footer.jsx` - Footer

### Dependencies
```json
{
  "react": "^19.2.6",
  "react-dom": "^19.2.6",
  "axios": "^1.18.1",
  "react-icons": "^5.7.0",
  "tailwindcss": "^4.3.2"
}
```

### Scripts
```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

---

## Backend Architecture

### Location
`backend/` - Node.js/Express REST API

### Server Configuration
- **Port**: 5000 (configurable via PORT env)
- **Framework**: Express.js
- **Database**: SQLite3
- **File Upload**: Multer middleware

### Key Files

**1. server.js** - Main application
```javascript
const app = express();
app.use('/api', fileRoutes);      // File operations
app.use('/api/auth', authRoutes); // Authentication
app.listen(PORT);                  // Start server
```

**2. routes/fileRoutes.js** - API endpoints
- POST `/upload` - Upload file
- POST `/hash` - Generate hash
- POST `/encrypt` - Encrypt file
- POST `/decrypt` - Decrypt file
- POST `/store-hash` - Store hash record
- POST `/verify-hash` - Verify hash
- GET `/documents` - List documents

**3. routes/authRoutes.js** - Authentication
- POST `/signup` - User registration
- POST `/login` - User login

**4. services/fileService.js** - Core logic
```javascript
createHash(filePath)                    // Generate SHA256
encryptFile(filePath, outputPath)       // Encrypt with AES-256
decryptFile(filePath, outputPath)       // Decrypt file
storeHashRecord(fileName, hashValue)    // Store in blockchain JSON
verifyHashRecord(fileName, hashValue)   // Verify integrity
uploadToGoogleDrive(path, name, opts)   // Upload to Google Drive
listUploadedDocuments()                 // List all documents
```

**5. db.js** - Database initialization
- SQLite3 connection
- User and file record tables

**6. scripts/runCoreWorkflow.js** - Core integration
```javascript
runCoreWorkflow({ filePath, action })
// Actions: 'hash', 'encrypt', 'decrypt'
// Returns: { output, hashOutput }
```

### Directory Structure
```
backend/
├── uploads/          # Uploaded files
├── services/         # Business logic
├── routes/           # API routes
├── controllers/      # Request handlers
├── scripts/          # Utility scripts
├── db.js             # Database setup
├── server.js         # Main server
└── package.json      # Dependencies
```

### Dependencies
```json
{
  "cors": "^2.8.6",
  "express": "^5.2.1",
  "multer": "^2.2.0",
  "sqlite3": "^5.1.7",
  "googleapis": "^173.0.0"
}
```

### Scripts
```bash
npm start   # Start backend server
npm test    # Run tests
```

---

## Core System (C/Blockchain)

### Location
`core/` - C cryptographic operations and blockchain integration

### Core Modules

**1. crypto.c / crypto.h**
- AES-256-CBC encryption
- AES-256-CBC decryption
- Key derivation (SHA256)
- IV (Initialization Vector) handling

**2. hash.c / hash.h**
- SHA256 hash generation
- File reading for hash computation
- Hash output formatting

**3. file_manager.c / file_manager.h**
- File I/O operations
- Directory management
- Encrypted file handling
- Decrypted file storage

**4. blockchain.c / blockchain.h**
- Hardhat integration
- Smart contract calls
- Hash storage on blockchain
- Transaction verification

**5. window.c / window.h**
- UI elements (for standalone app)
- Menu interface
- File selection dialogs

**6. main.c**
- Main menu system
- Action routing:
  1. Read File
  2. Generate SHA256 Hash
  3. Encrypt File
  4. Decrypt File
  5. Store Hash on Blockchain
  6. Verify File Integrity
  7. Exit

### Directory Structure
```
core/
├── src/                    # C source files
│   ├── main.c
│   ├── crypto.c
│   ├── hash.c
│   ├── file_manager.c
│   ├── blockchain.c
│   └── window.c
├── include/                # Header files
│   ├── crypto.h
│   ├── hash.h
│   ├── file_manager.h
│   ├── blockchain.h
│   └── window.h
├── blockchain/             # Hardhat project
│   ├── contracts/
│   │   └── FileStorage.sol # Smart contract
│   ├── scripts/            # Deployment scripts
│   │   ├── deploy.js
│   │   ├── storeHash.js
│   │   ├── verifyHash.js
│   │   └── getHash.js
│   ├── artifacts/          # Compiled contracts
│   └── hardhat.config.js   # Hardhat configuration
├── encrypted/              # Encrypted files
├── decrypted/              # Decrypted files
├── hash.txt                # Hash records
├── Makefile                # Build configuration
└── package.json            # Blockchain dependencies
```

### Blockchain Smart Contract

**FileStorage.sol**:
```solidity
// Stores file hashes immutably on blockchain
contract FileStorage {
  mapping(bytes32 => bytes32) public fileHashes;
  
  function storeHash(string memory fileName, bytes32 hash) public
  function verifyHash(string memory fileName, bytes32 hash) public returns (bool)
  function getHash(string memory fileName) public view returns (bytes32)
}
```

### Hardhat Configuration (`blockchain/hardhat.config.js`)
```javascript
module.exports = {
  solidity: "0.8.20",
};
```

### Blockchain Scripts
- `deploy.js` - Deploy FileStorage contract
- `storeHash.js` - Store hash on blockchain
- `verifyHash.js` - Verify hash on blockchain
- `getHash.js` - Retrieve hash from blockchain

### Encryption Details
- **Algorithm**: AES-256-CBC
- **Key Derivation**: SHA256('bbsec-default-key')
- **IV**: Random 16 bytes (prepended to ciphertext)
- **Output Format**: [IV (16 bytes) + Encrypted Data]

### Dependencies
```json
{
  "hardhat": "^2.22.0",
  "ethers": "^5.8.0",
  "@nomiclabs/hardhat-ethers": "^2.2.3"
}
```

---

## Setup & Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- C compiler (gcc/clang) for core compilation
- Hardhat (for blockchain)

### Step 1: Clone Repository
```bash
cd d:/Deepanshu/project\ C/BBSec_File_Store
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd ../backend
npm install
```

### Step 4: Install Blockchain Dependencies
```bash
cd ../core/blockchain
npm install
```

### Step 5: Compile Core (Optional - if using C binaries)
```bash
cd ../
make clean
make
```

---

## Important Instructions

### ⚠️ CRITICAL: Starting the Application

**1. Start Backend First** (Port 5000)
```bash
cd backend
npm start
# Expected: Backend running on http://localhost:5000
```

**2. Start Frontend** (Port 5173)
```bash
cd frontend
npm run dev
# Expected: Frontend running on http://localhost:5173
```

**3. (Optional) Start Blockchain Node** (Separate terminal)
```bash
cd core/blockchain
npx hardhat node
# Keep running for blockchain operations
```

### 🔑 Important Configuration

**Default Encryption Key**:
```
bbsec-default-key
```
⚠️ **CHANGE THIS** in production! Modify in:
- `backend/services/fileService.js` (line with 'bbsec-default-key')
- `backend/scripts/runCoreWorkflow.js`
- `core/src/crypto.c`

**Database Location**:
- SQLite database: `backend/db.js` creates tables on startup

**File Paths** (Hardcoded):
- Uploads: `backend/uploads/`
- Encrypted: `core/encrypted/`
- Decrypted: `core/decrypted/`
- Hash records: `core/blockchain/hash-records.json`

### 📁 Directory Permissions

Ensure write permissions for:
```bash
backend/uploads/
core/encrypted/
core/decrypted/
core/blockchain/
```

### 🌐 CORS Configuration

**Frontend Origin**: `http://localhost:5173`
**Backend CORS**: Enabled by default in `backend/server.js`

If changing ports, update in `frontend/src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: 'http://NEW_BACKEND_URL:NEW_PORT/api',
  timeout: 20000,
});
```

### 🔐 Google Drive Integration

**Optional Setup**:
1. Create Google OAuth credentials
2. Set `GOOGLE_DRIVE_FOLDER_ID` environment variable
3. Pass folder ID in upload request

### 📦 Environment Variables

Create `backend/.env`:
```
PORT=5000
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
NODE_ENV=development
```

---

## API Endpoints

### File Operations

#### 1. Upload File
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File object
- uploadToGoogle: boolean (optional)
- folderId: string (optional, for Google Drive)

Response:
{
  "message": "File uploaded successfully",
  "fileName": "document.pdf",
  "storedPath": "/path/to/file",
  "hash": "sha256hash...",
  "googleDrive": { ... }
}
```

#### 2. Generate Hash
```
POST /api/hash
Content-Type: application/json

Body:
{
  "filePath": "/path/to/file"
}

Response:
{
  "hash": "sha256hash...",
  "core": { "output": "...", "hashOutput": "..." }
}
```

#### 3. Encrypt File
```
POST /api/encrypt
Content-Type: application/json

Body:
{
  "filePath": "/path/to/file"
}

Response:
{
  "message": "File encrypted",
  "outputPath": "/path/to/encrypted.enc",
  "core": { ... }
}
```

#### 4. Decrypt File
```
POST /api/decrypt
Content-Type: application/json

Body:
{
  "filePath": "/path/to/encrypted.enc"
}

Response:
{
  "message": "File decrypted",
  "outputPath": "/path/to/decrypted"
}
```

#### 5. Store Hash Record
```
POST /api/store-hash
Content-Type: application/json

Body:
{
  "fileName": "document.pdf",
  "hash": "sha256hash..."
}

Response:
{
  "fileName": "document.pdf",
  "hash": "sha256hash...",
  "storedAt": "2026-07-14T10:30:00Z"
}
```

#### 6. Verify Hash
```
POST /api/verify-hash
Content-Type: application/json

Body:
{
  "fileName": "document.pdf",
  "hash": "sha256hash..."
}

Response:
{
  "valid": true/false,
  "message": "Hash verified successfully"
}
```

#### 7. List Documents
```
GET /api/documents

Response:
{
  "documents": [
    {
      "name": "document1.pdf",
      "path": "/path/to/file",
      "size": 12345,
      "uploadedAt": "2026-07-14T10:30:00Z"
    }
  ]
}
```

### Authentication

#### 1. Signup
```
POST /api/auth/signup
Content-Type: application/json

Body:
{
  "username": "user@example.com",
  "password": "securepassword",
  "fullName": "User Name"
}

Response:
{
  "message": "User created successfully",
  "userId": 1,
  "username": "user@example.com"
}
```

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "username": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "token": "jwt_token...",
  "userId": 1,
  "username": "user@example.com"
}
```

---

## Troubleshooting

### ❌ Frontend Cannot Connect to Backend

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5000`

**Solution**:
1. Ensure backend is running: `npm start` in `backend/` folder
2. Check backend is on port 5000
3. Verify `api.js` has correct `baseURL`

### ❌ CORS Error

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Ensure CORS is enabled in `backend/server.js`:
   ```javascript
   app.use(cors());
   ```
2. Frontend URL should match origin
3. Clear browser cache and refresh

### ❌ File Upload Fails

**Error**: `Upload failed: No space or permission denied`

**Solution**:
1. Check `backend/uploads/` directory exists
2. Ensure write permissions: `chmod 755 backend/uploads/`
3. Check disk space
4. Verify file is not too large

### ❌ Encryption/Decryption Fails

**Error**: `Encryption failed: Cannot read property 'update' of undefined`

**Solution**:
1. Verify `crypto` module is installed: `npm list crypto`
2. Check file path is absolute
3. Ensure file exists and is readable

### ❌ Blockchain Operations Fail

**Error**: `Error: Cannot find compiled contract artifacts`

**Solution**:
1. Compile contracts: `npx hardhat compile`
2. Deploy contract: `npx hardhat run scripts/deploy.js`
3. Verify Hardhat node is running

### ❌ C Program Compilation Error

**Error**: `gcc: command not found`

**Solution**:
1. Install C compiler:
   - Windows: Install MinGW or MSVC
   - macOS: `xcode-select --install`
   - Linux: `sudo apt-get install build-essential`

---

## Data Flow Examples

### Example 1: File Upload with Encryption

```
1. User selects file in Frontend (FileUploader.jsx)
   ↓
2. Frontend calls: uploadFile(file) in api.js
   ↓
3. Backend receives: POST /upload with multipart/form-data
   ↓
4. fileService.js processes:
   - createHash(filePath)           → SHA256 hash
   - encryptFile(path, outputPath)  → AES-256 encrypted
   - storeHashRecord(name, hash)    → JSON file
   ↓
5. Response sent to Frontend:
   {
     "fileName": "...",
     "hash": "...",
     "storedPath": "..."
   }
   ↓
6. Frontend updates UI with success message
   and displays hash & file details
```

### Example 2: Hash Verification

```
1. User requests verification in Frontend
   ↓
2. Frontend calls: verifyHash(fileName, hash)
   ↓
3. Backend reads hash-records.json
   ↓
4. Compares stored hash with current file hash
   ↓
5. Returns verification result
   ↓
6. Frontend displays: ✓ Valid or ✗ Invalid
```

### Example 3: Blockchain Storage

```
1. File uploaded and encrypted
   ↓
2. storeHashRecord() in fileService:
   - Saves hash to core/blockchain/hash-records.json
   ↓
3. Hardhat script (storeHash.js) called:
   - Deploys/connects to FileStorage contract
   - Calls contract.storeHash(fileName, hash)
   ↓
4. Transaction sent to blockchain network
   ↓
5. Hash stored immutably on blockchain
   ↓
6. Transaction hash returned to frontend
```

---

## Security Considerations

### ⚠️ IMPORTANT SECURITY NOTES

1. **Encryption Key**: Change `bbsec-default-key` to a strong, random key
2. **API Authentication**: Implement JWT tokens in production
3. **HTTPS**: Use HTTPS in production (not HTTP)
4. **Database**: Secure SQLite database with proper permissions
5. **File Permissions**: Restrict access to encrypted files
6. **Input Validation**: Sanitize all file paths and inputs
7. **Error Messages**: Don't expose system paths in production
8. **Blockchain Network**: Use testnet in development, mainnet carefully in production

---

## Development Tips

### Hot Reload Development
```bash
# Frontend - Hot reload enabled
cd frontend && npm run dev

# Backend - Use nodemon for auto-restart
npm install -g nodemon
nodemon backend/server.js
```

### Debugging

**Frontend**:
- Browser DevTools (F12)
- React Developer Tools extension
- Vite HMR logs in console

**Backend**:
- Console logs: `console.log()`
- Error stack traces in response
- Check `backend/uploads/` for files

**Blockchain**:
- Hardhat console: `npx hardhat console`
- Contract logs and events
- Transaction receipts

---

## Additional Resources

- **React**: https://react.dev
- **Express.js**: https://expressjs.com
- **Hardhat**: https://hardhat.org
- **OpenSSL/Crypto**: Node.js crypto module docs
- **SQLite3**: https://www.sqlite.org

---

## License & Attribution

**BBSec File Store** - Secure File Management System

---

## Support & Contribution

For issues or contributions:
1. Check the Troubleshooting section
2. Verify all services are running
3. Check file paths and permissions
4. Review console logs for errors

---

**Last Updated**: July 14, 2026
**Version**: 1.0.0

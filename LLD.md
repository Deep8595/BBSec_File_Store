<!-- markdownlint-disable -->

# Low Level Design (LLD)

## Overview

This document describes the low-level design for the BBSec File Store application.
It covers components, data flow, modules, APIs, storage, cryptography, and blockchain interactions.

## Components

### Frontend
- React application built with Vite
- Key user-facing features:
  - File upload and management
  - File encryption/decryption controls
  - Hash generation
  - Blockchain hash storage and verification
  - User authentication
- Important directories:
  - `frontend/src/components`
  - `frontend/src/pages`
  - `frontend/src/services/api.js`

### Backend
- Node.js + Express REST API
- Exposes endpoints under `/api`
- Uses `multer` for file uploads
- Uses SQLite for user and audit storage
- Interacts with local file storage and optional Google Drive upload
- Important files:
  - `backend/server.js`
  - `backend/routes/fileRoutes.js`
  - `backend/routes/authRoutes.js`
  - `backend/services/fileService.js`
  - `backend/db.js`

### Core System
- C-based core modules for file crypto and hashing
- Includes an interactive CLI-oriented program in `core/src/main.c`
- Implements AES-256-CBC encryption/decryption with OpenSSL
- Implements SHA256 hash generation with OpenSSL
- Important files:
  - `core/src/crypto.c`
  - `core/src/hash.c`
  - `core/src/main.c`
  - `core/include/crypto.h`
  - `core/include/hash.h`

### Blockchain
- Ethereum smart contract for immutable file-hash storage
- Hardhat-compatible project under `core/blockchain`
- Important file:
  - `core/blockchain/contracts/FileStorage.sol`

## Data Flow

### Upload Flow
1. User selects a file in frontend
2. Frontend calls `POST /api/upload` via `frontend/src/services/api.js`
3. Backend receives file in `backend/routes/fileRoutes.js`
4. File is saved to `backend/uploads`
5. SHA256 hash is generated with `createHash()` in `backend/services/fileService.js`
6. Optional Google Drive upload is performed via `uploadToGoogleDrive()`
7. Backend returns file metadata and hash to frontend

### Hash Generation
- Endpoint: `POST /api/hash`
- Backend uses `createHash(filePath)` to compute SHA256 of the file contents
- Backend also calls `runCoreAction(filePath, 'hash')` for core workflow logging or additional processing
- Hash output is returned to frontend

### Encryption
- Endpoint: `POST /api/encrypt`
- Uses `encryptFile(fullPath, outputPath)` in `backend/services/fileService.js`
- AES-256-CBC encryption key is derived from `sha256('bbsec-default-key')`
- Encrypted file is stored under `core/encrypted`
- Backend also calls `runCoreAction(fullPath, 'encrypt')`

### Decryption
- Endpoint: `POST /api/decrypt`
- Uses `decryptFile(encryptedPath, outputPath)` in `backend/services/fileService.js`
- Reads IV from the encrypted file payload and decrypts with the same derived key
- Decrypted file is stored under `core/decrypted`
- Backend also calls `runCoreAction(encryptedPath, 'decrypt')`

### Blockchain Storage
- Endpoint: `POST /api/store-hash`
- Backend persists hash metadata to `core/hash.txt`
- Backend writes a record into `core/blockchain/hash-records.json`
- Smart contract interface exists in `core/blockchain/contracts/FileStorage.sol`
- While backend stores hashes locally, the smart contract is designed to support immutable on-chain hash storage

### Hash Verification
- Endpoint: `POST /api/verify-hash`
- Backend compares provided file name and hash against `core/hash.txt`
- Also reads stored metadata from `core/blockchain/hash-records.json`
- Returns verification result and stored record details

## Module Responsibilities

### `backend/services/fileService.js`
- File read/write operations
- Hash generation
- Encryption/decryption logic
- Hash record storage
- Google Drive upload support
- Core command invocation via `execFileSync`

### `backend/routes/fileRoutes.js`
- File-related API endpoints
- Validation of request payloads
- Delegation to service layer
- JSON response formatting

### `backend/routes/authRoutes.js`
- Signup and login endpoints
- Password hashing with SHA256
- SQLite user management
- Audit event logging

### `backend/db.js`
- SQLite connection and initialization
- User table and audit table creation
- Data access helpers: `run`, `get`, `addAuditEvent`

### `frontend/src/services/api.js`
- Axios instance configured to `http://localhost:5000/api`
- File upload API calls
- Hash, encrypt, decrypt, store, verify endpoints
- Authentication endpoints

### `core/src/crypto.c`
- AES-256-CBC encryption
- AES-256-CBC decryption
- Writes output to `encrypted/` and `decrypted/`

### `core/src/hash.c`
- SHA256 hash generation
- Writes filename and hash to `hash.txt`

### `core/src/main.c`
- CLI menu interface for the core C workflow
- Provides manual operations for read, hash, encrypt, decrypt, store hash, verify

## Storage and File Formats

### Local Files
- `backend/uploads/` - user-uploaded files
- `core/encrypted/` - encrypted file outputs
- `core/decrypted/` - decrypted file outputs
- `core/hash.txt` - latest file hash and filename
- `core/blockchain/hash-records.json` - JSON map of stored file hashes

### Database
- `data/bbsec.sqlite` - SQLite database for users and audit events

## Security Considerations

- AES-256 encryption uses a static demo key in backend and C core implementation
- The backend also derives its key from a fixed literal value
- In production, use a secure key derivation function and environment-managed secrets
- Passwords are hashed via SHA256 in auth, but a stronger password hashing algorithm is recommended for production

## API Endpoints

### File APIs
- `POST /api/upload`
- `POST /api/hash`
- `POST /api/encrypt`
- `POST /api/decrypt`
- `POST /api/store-hash`
- `POST /api/verify-hash`
- `GET /api/documents`
- `GET /api/health`

### Auth APIs
- `POST /api/auth/signup`
- `POST /api/auth/login`

## Notes

- The backend does not currently persist encrypted file metadata in a database.
- The C core program and Node backend have overlapping crypto/hash responsibilities.
- Blockchain smart contract integration is present but pinning actual on-chain interactions may require additional Hardhat scripts and deployment steps.

# BBSec File Store — Backend

This document explains how the backend works, how to run it locally, and the available API endpoints.

## Overview

- The backend is an Express.js server located in this folder. It handles file uploads, hashing, AES encryption/decryption, optional Google Drive uploads, and a lightweight "core" workflow under the `core/` directory.
- Key files:
  - `server.js` — Express server entrypoint and route mounting.
  - `routes/fileRoutes.js` — HTTP endpoints (upload, hash, encrypt, decrypt, store-hash, verify-hash, health).
  - `services/fileService.js` — Hashing, encryption/decryption, Google Drive upload, and core invocation.
  - `scripts/runCoreWorkflow.js` — Local core workflow runner; writes outputs to `core/`.

## Prerequisites

- Node.js (14+ recommended)
- npm
- If using Google Drive uploads: a Google Service Account JSON (see Environment Variables).

## Install

From the `backend` folder:

```bash
npm install
```

## Run

Start the server directly:

```bash
node server.js
```

The server listens on port `5000` by default or the port set in the `PORT` environment variable.

## Environment variables

- `PORT` — optional, server port.
- `GOOGLE_SERVICE_ACCOUNT_JSON` — optional, base64 or raw JSON string for Google service account credentials used for Drive uploads.
- `GOOGLE_SERVICE_ACCOUNT_JSON_PATH` — optional, path to a JSON credentials file (alternative to the above).
- `GOOGLE_DRIVE_FOLDER_ID` — optional, default folder ID to upload to.

Note: The code currently uses a hardcoded string `bbsec-default-key` to derive the AES encryption key. For production, replace this with a secure key management approach.

## API Endpoints

Base URL: `http://localhost:5000/api`

- POST `/upload`
  - multipart form: `file` — the file to upload
  - optional form fields: `uploadToGoogle` (`true`/`false`), `folderId`
  - Response: `{ message, fileName, storedPath, hash, googleDrive }`
  - Example:

    ```bash
    curl -X POST -F "file=@/path/to/file.jpg" -F "uploadToGoogle=true" -F "folderId=FOLDER_ID" http://localhost:5000/api/upload
    ```

- POST `/hash`
  - JSON body: `{ "filePath": "<absolute-or-relative-path>" }`
  - Computes SHA-256 and triggers the core `hash` action.
  - Example:

    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"filePath":"backend/uploads/yourfile.jpg"}' http://localhost:5000/api/hash
    ```

- POST `/encrypt`
  - JSON body: `{ "filePath": "<path-to-file>" }`
  - Produces an encrypted file under `core/encrypted/` and returns core action output.

- POST `/decrypt`
  - JSON body: `{ "filePath": "<path-to-encrypted-file.enc>" }`
  - Writes decrypted output to `core/decrypted/`.

- POST `/store-hash`
  - JSON body: `{ "fileName": "name", "hash": "sha256value" }`
  - Writes a simple record to `core/hash.txt` and triggers core `store`.

- POST `/verify-hash`
  - JSON body: `{ "fileName": "name", "hash": "sha256value" }`
  - Returns `{ verified: true|false, message }` and triggers core `verify`.

- GET `/health`
  - Returns `{ status: 'ok' }`.

## File locations

- Uploaded files (multer temporary): `backend/uploads/`
- Core outputs: `core/encrypted/`, `core/decrypted/`, `core/hash.txt`

## Notes & Troubleshooting

- Google Drive upload requires valid service account credentials through `GOOGLE_SERVICE_ACCOUNT_JSON` or `GOOGLE_SERVICE_ACCOUNT_JSON_PATH`.
- If the server fails to start, check that the chosen port is free and Node.js dependencies were installed.
- The AES key is derived from a hardcoded string — do not rely on this for production secrets.

## Next steps (suggested)

- Replace the hardcoded encryption key by reading a secure env var.
- Add `start` and `dev` scripts to `package.json` (e.g., `node server.js` and `nodemon server.js`).
- Add tests and request validation for routes.

---

If you'd like, I can add example Postman collections or convert the server start to an `npm start` script. Tell me which you prefer.

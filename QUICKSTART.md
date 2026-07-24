<!-- markdownlint-disable -->

# BBSec File Store - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Clone & Navigate
```bash
cd d:/Deepanshu/project\ C/BBSec_File_Store
```

### 2. Install All Dependencies (Run in 3 separate terminals)

**Terminal 1 - Backend**:
```bash
cd backend
npm install
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install
```

**Terminal 3 - Blockchain** (Optional):
```bash
cd core/blockchain
npm install
```

### 3. Start Services

**Terminal 1 - Start Backend** (Keep running):
```bash
cd backend
npm start
# Output: Backend running on http://localhost:5000
```

**Terminal 2 - Start Frontend** (Keep running):
```bash
cd frontend
npm run dev
# Output: VITE v8.0.12  ready in 123 ms
#         ➜  Local:   http://localhost:5173/
```

**Terminal 3 - Access Application**:
```
Open browser → http://localhost:5173/
```

---

## 📋 Component Checklist

### ✅ Frontend Running?
- [ ] See "BBSec File Store" in browser
- [ ] Dashboard loads
- [ ] Can upload files
- [ ] Buttons respond to clicks

### ✅ Backend Running?
- [ ] Terminal shows "Backend running on http://localhost:5000"
- [ ] Can POST to http://localhost:5000/api/upload
- [ ] No ECONNREFUSED errors in frontend console

### ✅ Files Being Processed?
- [ ] Check `/backend/uploads/` after upload
- [ ] Check `/core/encrypted/` after encryption
- [ ] Hash displayed in frontend response

---

## 🔌 Connection Points

### Frontend → Backend
```
Frontend sends HTTP request
    ↓
axios.create({ baseURL: 'http://localhost:5000/api' })
    ↓
Backend receives at: http://localhost:5000/api/[endpoint]
```

**Test Connection**:
```bash
# In terminal
curl http://localhost:5000/api/documents

# Expected response: { documents: [...] }
```

### Backend → Core
```
Backend calls:
    ├─ createHash(filePath)    → Node.js crypto
    ├─ encryptFile(file, out)  → Node.js crypto + AES-256
    ├─ decryptFile(file, out)  → Node.js crypto
    └─ runCoreWorkflow()       → File I/O operations
```

**Test Encryption**:
```javascript
// In backend console
const { encryptFile } = require('./services/fileService');
encryptFile('./test.txt', './test.txt.enc');
// Check ./test.txt.enc was created
```

### Backend → Blockchain
```
Backend stores:
    ├─ hash-records.json       → /core/blockchain/hash-records.json
    └─ Smart contract records  → Hardhat node (if running)
```

**Test Blockchain Storage**:
```bash
# In core/blockchain terminal
npx hardhat node
# Keep running in background

# In new terminal
npx hardhat run scripts/storeHash.js --network hardhat
```

---

## 🛠️ Common Tasks

### Task 1: Upload a File
1. Click "Choose File" in frontend
2. Select any file (PDF, image, text, etc.)
3. Click "Upload"
4. See hash generated and file encrypted
5. Check `/backend/uploads/` and `/core/encrypted/`

### Task 2: Generate Hash
1. Frontend → CryptoCard component
2. Enter file path (e.g., `/backend/uploads/myfile.pdf`)
3. Click "Generate Hash"
4. View SHA256 hash

### Task 3: Encrypt/Decrypt
1. Frontend → CryptoCard component
2. Click "Encrypt" → File encrypted to `/core/encrypted/`
3. Click "Decrypt" → File decrypted to `/core/decrypted/`
4. Verify original file restored

### Task 4: Store Hash on Blockchain
1. File must be uploaded first
2. Click "Store on Blockchain"
3. Hash stored in `/core/blockchain/hash-records.json`
4. (If Hardhat running) Also stored on smart contract

---

## 📱 API Quick Reference

### Upload File
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@/path/to/file"
```

### Generate Hash
```bash
curl -X POST http://localhost:5000/api/hash \
  -H "Content-Type: application/json" \
  -d '{"filePath": "/path/to/file"}'
```

### Encrypt File
```bash
curl -X POST http://localhost:5000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"filePath": "/path/to/file"}'
```

### Decrypt File
```bash
curl -X POST http://localhost:5000/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{"filePath": "/path/to/encrypted.enc"}'
```

### Store Hash
```bash
curl -X POST http://localhost:5000/api/store-hash \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.pdf", "hash": "abc123..."}'
```

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /api/documents"
```
✗ Backend not running
✓ Start backend: cd backend && npm start
```

### Issue: "CORS error in browser console"
```
✗ Backend doesn't have CORS enabled
✓ Check backend/server.js has: app.use(cors())
✓ Restart backend
```

### Issue: "No file uploaded"
```
✗ File not included in request
✓ Use multipart/form-data
✓ Include 'file' field
```

### Issue: "Cannot find crypto module"
```
✗ Dependencies not installed
✓ Run: npm install in backend directory
```

### Issue: Files not encrypting
```
✗ core/encrypted/ directory missing
✓ Create: mkdir -p core/encrypted
✓ Verify write permissions
```

---

## 📊 System Connection Map

```
┌─────────────────────────────────────────────────┐
│          Browser (http://localhost:5173)        │
│                 Frontend React                   │
│  ┌────────────────────────────────────────────┐ │
│  │ FileUploader | CryptoCard | HashCard | ... │ │
│  └────────────┬─────────────────────────────┬─┘ │
└───────────────┼─────────────────────────────┼───┘
                │ Axios HTTP/REST            │
                │ POST/GET http://localhost │
                │ :5000/api/*                │
                ▼                             │
    ┌─────────────────────────────────────────▼─┐
    │   Node.js/Express Server (Port 5000)     │
    │         backend/server.js                 │
    │  ┌─────────────────────────────────────┐ │
    │  │ Routes                              │ │
    │  │ ├─ /upload, /hash, /encrypt ...  │ │
    │  │ └─ /auth/signup, /auth/login     │ │
    │  └────────────┬────────────────────┬──┘ │
    │              │                    │     │
    │              ▼                    ▼     │
    │  ┌──────────────────┐  ┌────────────────┐│
    │  │File Service      │  │Database        ││
    │  │·createHash       │  │(SQLite3)       ││
    │  │·encryptFile      │  │                ││
    │  │·decryptFile      │  └────────────────┘│
    │  └──────────────────┘                    │
    └─────────────┬─────────────────────────────┘
                  │ File I/O
                  │ runCoreWorkflow()
                  ▼
    ┌─────────────────────────────────────────┐
    │   Core System (C + Blockchain)          │
    │   core/ directory                       │
    │  ┌─────────────────────────────────┐   │
    │  │ Crypto Module                   │   │
    │  │ ├─ AES-256-CBC Encryption       │   │
    │  │ └─ Key Derivation (SHA256)      │   │
    │  └─────────────────────────────────┘   │
    │  ┌─────────────────────────────────┐   │
    │  │ Hash Module                     │   │
    │  │ └─ SHA256 Hash Generation       │   │
    │  └─────────────────────────────────┘   │
    │  ┌─────────────────────────────────┐   │
    │  │ Blockchain Module               │   │
    │  │ ├─ Hardhat Integration          │   │
    │  │ └─ Smart Contract Calls         │   │
    │  └──────┬──────────────────┬───────┘   │
    │         │                  │           │
    │         ▼                  ▼           │
    │   /encrypted/         hash-records.    │
    │   /decrypted/         json             │
    │   /hash.txt/                          │
    └─────────────────────────────────────────┘
```

---

## 📚 File Locations Reference

| Component | File/Directory | Purpose |
|-----------|--------|---------|
| **Frontend** | `frontend/src/` | React components |
| **Backend** | `backend/server.js` | Main server |
| **Uploads** | `backend/uploads/` | Uploaded files |
| **Encrypted** | `core/encrypted/` | Encrypted files |
| **Decrypted** | `core/decrypted/` | Decrypted files |
| **Hashes** | `core/hash.txt` | Hash records |
| **Blockchain** | `core/blockchain/` | Smart contracts |
| **Database** | `backend/db.js` | SQLite setup |
| **API Service** | `frontend/src/services/api.js` | API calls |
| **File Service** | `backend/services/fileService.js` | Core logic |

---

## 🔐 Security Checklist

- [ ] Change default encryption key (`bbsec-default-key`)
- [ ] Enable HTTPS in production
- [ ] Implement JWT authentication
- [ ] Set proper file permissions (chmod 755)
- [ ] Use environment variables for secrets
- [ ] Validate all inputs
- [ ] Enable CORS only for trusted origins
- [ ] Use strong database passwords
- [ ] Implement rate limiting
- [ ] Add logging for audit trail

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Complete project documentation |
| **ARCHITECTURE.md** | Technical architecture & data flows |
| **QUICKSTART.md** | This file - Get up and running fast |

---

## ✨ Next Steps

1. **Get it running**: Follow "5-Minute Setup"
2. **Test components**: Use "Component Checklist"
3. **Try features**: Complete "Common Tasks"
4. **Understand flow**: Review "System Connection Map"
5. **Read details**: See README.md & ARCHITECTURE.md
6. **Secure it**: Complete "Security Checklist"

---

## 💡 Pro Tips

### Tip 1: Development Workflow
```bash
# Terminal 1: Backend with auto-restart
npm install -g nodemon
nodemon backend/server.js

# Terminal 2: Frontend with HMR
cd frontend && npm run dev

# Terminal 3: Commands/testing
curl http://localhost:5000/api/documents
```

### Tip 2: Quick Testing
```bash
# Create test file
echo "test content" > test.txt

# Test hash generation
curl -X POST http://localhost:5000/api/hash \
  -H "Content-Type: application/json" \
  -d '{"filePath": "test.txt"}'
```

### Tip 3: Database Inspection
```bash
# Install sqlite3 CLI
npm install -g sqlite3

# Inspect database
sqlite3 backend/db.js ".tables"
sqlite3 backend/db.js ".schema users"
sqlite3 backend/db.js "SELECT * FROM files;"
```

### Tip 4: Environment Variables
```bash
# Create .env file in backend
echo "PORT=5000" > backend/.env
echo "NODE_ENV=development" >> backend/.env

# Load in server.js
require('dotenv').config();
```

---

## 🆘 Get Help

1. Check **Troubleshooting** section above
2. Review **README.md** for detailed docs
3. See **ARCHITECTURE.md** for technical details
4. Check console/terminal for error messages
5. Verify all 3 services are running

---

**Ready to build secure file management? Start with the 5-Minute Setup above! 🚀**

**Last Updated**: July 14, 2026
**Version**: 1.0.0

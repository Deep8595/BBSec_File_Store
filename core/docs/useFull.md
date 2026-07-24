<!-- markdownlint-disable -->

## Building the Name is BBSec_File_Store new one but previous one is like this Blockchain-Based Secure File Storage.

* C
* Linux/System Programming concepts
* OpenSSL
* Solidity
* Hardhat
* Blockchain
* Git/GitHub

these are the commands you'll use repeatedly.

# 1. C Development Commands

## Compile

Single file:

```bash id="1i3sxv"
gcc main.c -o app
```

Multiple files:

```bash id="tr04ck"
gcc src/*.c -o bbsec.exe -lssl -lcrypto
```

---

## Warnings

Always compile with warnings:

```bash id="ix8y99"
gcc -Wall -Wextra src/*.c -o bbsec.exe -lssl -lcrypto
```

---

## Debug Build

```bash id="z46qqs"
gcc -g src/*.c -o bbsec.exe -lssl -lcrypto
```

---

## Run

MSYS2:

```bash id="31hcbf"
./bbsec.exe
```

---

# 2. Make Commands

Build:

```bash id="mjlwmm"
make
```

Clean:

```bash id="yk56ht"
make clean
```

Rebuild:

```bash id="k6px5h"
make clean
make
```

---

# 3. OpenSSL Commands

## Generate SHA256

```bash id="1xtd1m"
openssl dgst -sha256 sample.txt
```

---

## Random AES Key

```bash id="6s0v6p"
openssl rand -hex 32
```

---

## Random IV

```bash id="95kn0s"
openssl rand -hex 16
```

---

## View OpenSSL Version

```bash id="cg5ubn"
openssl version
```

---

# 4. Git Commands

Initialize:

```bash id="3r4tib"
git init
```

---

Check Status:

```bash id="llcfqf"
git status
```

---

Add Files:

```bash id="bxk5ly"
git add .
```

---

Commit:

```bash id="y7cmgs"
git commit -m "Added AES encryption"
```

---

View History:

```bash id="tyif6r"
git log --oneline
```

---

Push:

```bash id="5c41mg"
git push origin main
```

---

# 5. Hardhat Commands

Install:

```bash id="b5c45d"
npm install --save-dev hardhat
```

---

Check Version:

```bash id="a4oltp"
npx hardhat --version
```

---

Initialize:

```bash id="u1i9yz"
npx hardhat
```

---

Compile Contract:

```bash id="kzivtk"
npx hardhat compile
```

---

Run Local Blockchain:

```bash id="ehpxy8"
npx hardhat node
```

---

Deploy Contract:

```bash id="cvvvab"
npx hardhat run scripts/deploy.js --network localhost
```

---

# 6. Solidity Development

Compile:

```bash id="jn8i8i"
npx hardhat compile
```

---

Test:

```bash id="07oc4o"
npx hardhat test
```

---

Clean:

```bash id="n1xv6h"
npx hardhat clean
```

---

# 7. NPM Commands

Initialize Project:

```bash id="c4fl2m"
npm init -y
```

---

Install Package:

```bash id="e2qzmx"
npm install ethers
```

---

Install Dev Dependency:

```bash id="54epvl"
npm install --save-dev hardhat
```

---

List Packages:

```bash id="bvyw3z"
npm list
```

---

# 8. Linux Commands You'll Use

Even on Windows/MSYS2:

Current Directory:

```bash id="d6fhwi"
pwd
```

---

List Files:

```bash id="s80zyj"
ls
```

---

Create Folder:

```bash id="s24zrv"
mkdir encrypted
```

---

Create File:

```bash id="l38ynr"
touch sample.txt
```

---

Delete File:

```bash id="u3jvvk"
rm sample.txt
```

---

Copy File:

```bash id="6ptxgc"
cp sample.txt backup.txt
```

---

Move File:

```bash id="umvl5c"
mv old.txt new.txt
```

---

# 9. Debugging Commands

Run GDB:

```bash id="i2jafw"
gdb bbsec.exe
```

---

Run Valgrind (Linux)

```bash id="6z1f55"
valgrind ./bbsec.exe
```

---

# 10. Blockchain Verification Commands

Start Node:

```bash id="gt0f06"
npx hardhat node
```

---

Store Hash:

```bash id="h3h0n2"
node scripts/storeHash.js
```

---

Get Hash:

```bash id="fj68qa"
node scripts/getHash.js
```

---

# Commands You'll Use Most Often

For **BBSec_File_Store**, memorize these first:

```bash id="1fwl7k"
gcc src/*.c -o bbsec.exe -lssl -lcrypto

make

git status

git add .

git commit -m "message"

openssl dgst -sha256 file.txt

openssl rand -hex 32

npm init -y

npx hardhat compile

npx hardhat node

npx hardhat run scripts/deploy.js --network localhost
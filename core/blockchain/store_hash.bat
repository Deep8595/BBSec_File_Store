@echo off

set PATH=D:\Downloads;%PATH%

cd /d "D:\Deepanshu\project C\BBSec_File_Store\core\blockchain"

D:\Downloads\npx.cmd hardhat run scripts\storeHash.js --network localhost

pause
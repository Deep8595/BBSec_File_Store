const { ethers } = require("hardhat");
const fs = require("fs");

async function main(){
    const contractAddress = fs.readFileSync("ContractAddress.txt", "utf8").trim();
    
    //"0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address

    //const fileName = "sample.txt"; // Replace with the actual file name you want to verify

    const FileStorage = await ethers.getContractFactory("FileStorage");

    const contract = FileStorage.attach(contractAddress);

    const fileName = fs.readFileSync("../hash.txt","utf-8").split("\n")[0].trim();

    const currentHash = fs.readFileSync("../hash.txt","utf-8").split("\n")[1].trim();

    const blockchainHash = await contract.getHash(fileName);

    console.log("Current Hash :", currentHash);
    console.log("Blockchain Hash :", blockchainHash);

    if(currentHash == blockchainHash)
        console.log("Integrity Verified");
    else
        console.log("File Modified");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
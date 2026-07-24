const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {

    // Contract Address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // Read hash.txt
    const data = fs.readFileSync("../hash.txt", "utf8").trim().split("\n");

    const fileName = data[0].trim();
    const hashValue = data[1].trim();

    const contract = await ethers.getContractAt(
        "FileStorage",
        contractAddress
    );

    const tx = await contract.storeHash(fileName, hashValue);   

    await tx.wait();

    console.log("Hash Stored Successfully");
    console.log("File :", fileName);
    console.log("Hash :", hashValue);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
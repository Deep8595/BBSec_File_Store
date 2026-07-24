const { ethers } = require("hardhat");

async function main() {

    const contractAddress =
        "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const contract =
        await ethers.getContractAt(
            "FileStorage",
            contractAddress
        );

    const hash =
        await contract.getHash(
            "sample.txt"
        );

    console.log("Stored Hash:");
    console.log(hash);
}

main()
.catch((err) => {
    console.error(err);
    process.exit(1);
});
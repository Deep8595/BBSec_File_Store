const hre = require("hardhat");
const fs = require("fs");

async function main() {

    const FileStorage = await hre.ethers.getContractFactory("FileStorage");
    const fileStorage = await FileStorage.deploy();

    await fileStorage.deployed();

    console.log("Contract Deployed to:" , fileStorage.address);

    fs.writeFileSync("contractAddress.txt", fileStorage.address);

    console.log("Contract address saved.");

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
})
//SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

contract FileStorage
{
    struct FileRecord {
        string hash;
        uint256 timestamp;
    }
    mapping(string => FileRecord ) public fileHashes;
    string[] public fileNames;

    function storeHash(
        string memory fileName,
        string memory hashValue
    )
    public
    {
        if(bytes(fileHashes[fileName].hash).length == 0)
        {
            fileNames.push(fileName);
        }

        fileHashes[fileName] = FileRecord(
            {
                hash: hashValue,
                timestamp: block.timestamp
            }
        );
    }

    function getAllFiles() public view returns (string[] memory) 
    {
        return fileNames;
    }

    function getHash(
        string memory fileName
    )
    public view returns(string memory hash){
        
        return fileHashes[fileName].hash;

    }
}
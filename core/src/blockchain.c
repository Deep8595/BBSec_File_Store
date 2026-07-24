#include <stdio.h>
#include <stdlib.h>
#include "../include/blockchain.h"

void store_hash_on_chain()
{
    printf("Storing hash on blockchain...\n");

    int result = system("blockchain\\store_hash.bat");

    printf("Result=%d\n", result);

    if (result == 0)
    {
        printf("Hash Stored Successfully.\n");
    }
    else
    {
        printf("Failed to store hash.\n");
    }
}

void verify_hash_on_chain()
{
    printf("Verifying hash on blockchain...\n");

    int result = system("blockchain\\verify_hash.bat");

    printf("Result=%d\n", result);

    if (result == 0)
    {
        printf("Hash Verified Successfully.\n");
    }
    else
    {
        printf("Failed to verify hash.\n");
    }
}
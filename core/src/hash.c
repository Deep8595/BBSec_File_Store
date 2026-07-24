#include <stdio.h>
#include <openssl/sha.h>
#include "../include/hash.h"

void generate_hash(const char *filename)
{
    FILE *file = fopen(filename, "rb");

    if (!file)
    {
        printf("Cannot open file\n");
        return;
    }

    SHA256_CTX sha256;
    SHA256_Init(&sha256);

    unsigned char buffer[1024];
    size_t bytesRead;

    while ((bytesRead = fread(buffer, 1, sizeof(buffer), file)))
    {
        SHA256_Update(&sha256, buffer, bytesRead);
    }

    unsigned char hash[SHA256_DIGEST_LENGTH];

    SHA256_Final(hash, &sha256);

    printf("\nSHA256:\n");

    FILE *fp = fopen("hash.txt", "w");

    fprintf(fp, "%s\n", filename);

    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++)
    {
        printf("%02x", hash[i]);
        fprintf(fp, "%02x", hash[i]);
    }

    printf("\n");

    fclose(fp);
    fclose(file);
}
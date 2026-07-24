#include <stdio.h>
#include <string.h>
#include <stdint.h>
#include <stdlib.h>

#include <openssl/evp.h>
#include <openssl/rand.h>

#include "../include/crypto.h"

#define KEY_SIZE 32
#define IV_SIZE 16
#define BUFFER_SIZE 4096

/*
    Demo key
    in Production this should be generated
    from a password using PBKDF2
*/

static const unsigned char AES_KEY[KEY_SIZE] = {
    0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08,
    0x09, 0x0A, 0x0B, 0x0C,
    0x0D, 0x0E, 0x0F, 0x10,
    0x11, 0x12, 0x13, 0x14,
    0x15, 0x16, 0x17, 0x18,
    0x19, 0x1A, 0x1B, 0x1C,
    0x1D, 0x1E, 0x1F, 0x20};

int encrypt_file(const char *input, const char *output)
{
    FILE *fin = fopen(input, "rb");
    if (!fin)
    {
        perror("Failed to open input file");
        return -1;
    }
    FILE *fout = fopen(output, "wb");
    if (!fout)
    {
        perror("Failed to open output file");
        fclose(fin);
        return -1;
    }

    unsigned char iv[IV_SIZE];
    RAND_bytes(iv, IV_SIZE);

    /*
    Save Original File Name
    */

    const char *filename = strrchr(input, '\\');

    if (filename)
    {
        filename++; // Move past the backslash
    }
    else
    {
        filename = input; // No backslash found, use the whole input as filename
    }

    uint32_t nameLength = strlen(filename);

    // Save File Name size

    fwrite(&nameLength,
           sizeof(nameLength),
           1,
           fout);

    // Save the original filename
    fwrite(filename, 1, nameLength, fout);

    // Save IV
    fwrite(iv, 1, IV_SIZE, fout);

    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();

    EVP_EncryptInit_ex(
        ctx,
        EVP_aes_256_cbc(),
        NULL,
        AES_KEY,
        iv);

    unsigned char inbuf[BUFFER_SIZE];
    unsigned char outbuf[BUFFER_SIZE + EVP_CIPHER_block_size(EVP_aes_256_cbc())];

    int outlen;

    size_t bytesRead;

    while ((bytesRead = fread(inbuf, 1, BUFFER_SIZE, fin)) > 0)
    {
        EVP_EncryptUpdate(ctx, outbuf, &outlen, inbuf, bytesRead);
        fwrite(outbuf, 1, outlen, fout);
    }

    EVP_EncryptFinal_ex(ctx, outbuf, &outlen);
    fwrite(outbuf, 1, outlen, fout);

    EVP_CIPHER_CTX_free(ctx);
    fclose(fin);
    fclose(fout);

    printf("file Encrypted successfully\n");

    return 1;
}

int decrypt_file(const char *input, const char *output)
{
    FILE *fin = fopen(input, "rb");
    if (!fin)
    {
        perror("Failed to open input file");
        return 0;
    }

    FILE *fout = fopen(output, "wb");
    if (!fout)
    {
        fclose(fin);
        printf("Cannot open output file\n");
        return 0;
    }

    uint32_t nameLength;

    fread(&nameLength, sizeof(nameLength), 1, fin);

    char filename[256];

    fread(filename, 1, nameLength, fin);

    filename[nameLength] = '\0';

    char finalOutput[300];

    sprintf(finalOutput, "decrypted/%s", filename);

    fclose(fout);

    fout = fopen(finalOutput, "wb");

    if (!fout)
    {
        printf("Cannot create decrypted file\n");
        fclose(fin);
        return 0;
    }

    unsigned char iv[IV_SIZE];
    fread(iv, 1, IV_SIZE, fin);

    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    EVP_DecryptInit_ex(
        ctx,
        EVP_aes_256_cbc(),
        NULL,
        AES_KEY,
        iv);

    unsigned char inbuf[BUFFER_SIZE];
    unsigned char outbuf[BUFFER_SIZE + EVP_CIPHER_block_size(EVP_aes_256_cbc())];

    int outlen;

    size_t bytesRead;

    while ((bytesRead = fread(inbuf, 1, BUFFER_SIZE, fin)) > 0)
    {
        EVP_DecryptUpdate(ctx, outbuf, &outlen, inbuf, bytesRead);
        fwrite(outbuf, 1, outlen, fout);
    }

    if (!EVP_DecryptFinal_ex(ctx, outbuf, &outlen))
    {
        EVP_CIPHER_CTX_free(ctx);
        fclose(fin);
        fclose(fout);
        printf("Decryption failed. Possible wrong key or corrupted file.\n");
        return 0;
    }
    EVP_CIPHER_CTX_free(ctx);
    fclose(fin);
    fclose(fout);
    printf("File decrypted successfully.\n");
    return 1;
}
#include <stdio.h>
#include <stdlib.h>

#include "../include/file_manager.h"
#include "../include/hash.h"
#include "../include/crypto.h"
#include "../include/blockchain.h"
#include "../include/window.h"

int main()
{
    int choice;
    char filename[256];
    char output[256];

    while (1)
    {
        printf("\n");
        printf("===============================\n");
        printf("BBSec File Store\n");
        printf("===============================\n");
        printf("1. Read File\n");
        printf("2. Generate SHA256 Hash\n");
        printf("3. Encrypt File\n");
        printf("4. Decrypt File\n");
        printf("5. Store Hash on Blockchain\n");
        printf("6. Verify File Integrity\n");
        printf("7. Exit\n");

        printf("Enter your choice: ");

        if (scanf("%d", &choice) != 1)
        {
            printf("Invalid input! \n");

            while (getchar() != '\n')
                ;
            continue;
        }

        switch (choice)
        {
        case 1:

            // char filename[256];
            // if (select_file(filename))
            // {
            //     read_file(filename);
            // }
            // else
            // {
            //     printf("File selection canceled.\n");
            // }

            read_file();

            break;

        case 2:
            printf("Filename: ");
            scanf("%s", filename);

            generate_hash(filename);
            break;

        case 3:
        {
            char output[300];
            char file[260];

            if (select_file(file))
            {
                encrypt_file(file, "encrypted/output.enc");
            }

            sprintf(
                output,
                "encrypted/%s",
                filename);

            encrypt_file(
                filename,
                output);

            printf(
                "Encrypted file saved to: %s\n",
                output);

            break;
        }

        case 4:
        {
            char input[260];

            if (select_file(input))
            {
                decrypt_file(
                    input,
                    "decrypted/output.txt");

                printf("Decrypted file saved to: decrypted/output.txt\n");
            }

            break;
        }

        case 5:
        {
            store_hash_on_chain();
            break;
        }

        case 6:
        {
            verify_hash_on_chain();
            break;
        }

        case 7:
        {
            printf("Exiting program...\n");
            return 0;
            break;
        }

        default:
            printf("Invalid choice. Please try again.\n");
        }
    }
}
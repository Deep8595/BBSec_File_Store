#include <windows.h>
#include <stdio.h>

#include "../include/file_manager.h"

void read_file()
{
    char filename[260];

    OPENFILENAME ofn;

    ZeroMemory(&ofn, sizeof(ofn));

    ofn.lStructSize = sizeof(ofn);
    ofn.lpstrFile = filename;
    ofn.hwndOwner = NULL;

    ofn.lpstrFilter = "All Files\0*.*\0";
    ofn.nMaxFile = sizeof(filename);
    ofn.lpstrFile[0] = '\0';

    ofn.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST | OFN_NOCHANGEDIR;

    if (GetOpenFileName(&ofn))
    {
        FILE *file = fopen(filename, "r");
        if (file == NULL)
        {
            printf("Failed to open the file.\n");
            return;
        }
        char ch;
        while ((ch = fgetc(file)) != EOF)
        {
            putchar(ch);
        }
        fclose(file);
    }
    else
    {
        printf("Failed to open the file.\n");
    }
}
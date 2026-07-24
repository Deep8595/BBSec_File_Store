CC=gcc

CFLAGS=-Wall
CFLAGS = -Wno-deprecated-declarations

LIBS=-lssl -lcrypto -lcomdlg32

SRC=src/main.c \
	src/file_manager.c \
	src/hash.c \
	src/crypto.c \
	src/blockchain.c\
	src/window.c

TARGET=vault.exe

all:
	$(CC) $(SRC) -o $(TARGET) $(LIBS)

clean:
	rm -f $(TARGET)
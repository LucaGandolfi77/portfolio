# Pocket Walker - GBA homebrew (bare metal, no libgba)
# Builds pocket-walker.gba and deploys it to ../../assets/games/ for the
# site's GBA emulator page (EmulatorJS / mGBA).
#
# Requires an ARM EABI toolchain (e.g. xPack GNU Arm Embedded GCC or
# devkitARM). Point TOOLCHAIN at the install dir:
#   make TOOLCHAIN=/path/to/arm-none-eabi-gcc  (a dir containing bin/)

TOOLCHAIN ?= /tmp/gba-tc
CROSS     := $(TOOLCHAIN)/bin/arm-none-eabi-
CC        := $(CROSS)gcc
LD        := $(CROSS)gcc
OBJCOPY   := $(CROSS)objcopy
OBJDUMP   := $(CROSS)objdump
SIZE      := $(CROSS)size

TARGET := pocket-walker
ROM    := $(TARGET).gba
ELF    := build/$(TARGET).elf
DEPLOY := ../../assets/games/$(TARGET).gba

CFLAGS  := -mcpu=arm7tdmi -mthumb -O2 -Wall -Wextra -ffreestanding \
           -nostdlib -fno-builtin -fno-exceptions -I src
ASFLAGS := -mcpu=arm7tdmi -mthumb -I src
LDFLAGS := -T linker.ld -nostdlib -Wl,--gc-sections

SRCS := src/crt0.s src/main.c src/gfx_data.c
OBJS := $(patsubst src/%.s,build/%.o,$(patsubst src/%.c,build/%.o,$(SRCS)))

.PHONY: all clean gfx header deploy test

all: $(ROM)

gfx: tools/gfx.py art/tiles.txt art/hero.txt art/font.txt art/maps.txt
	python3 tools/gfx.py

header: tools/gen_header.py
	python3 tools/gen_header.py

builddir:
	mkdir -p build

build/%.o: src/%.s src/header_inc.s | gfx header builddir
	$(CC) $(ASFLAGS) -c $< -o $@

build/%.o: src/%.c src/gfx_data.h src/map_data.h | builddir
	$(CC) $(CFLAGS) -c $< -o $@

$(ROM): $(OBJS) linker.ld
	$(LD) $(LDFLAGS) -o $(ELF) $(OBJS)
	$(OBJCOPY) -O binary $(ELF) $(ROM)
	$(SIZE) $(ELF)

deploy: $(ROM)
	cp $(ROM) $(DEPLOY)

test: $(ROM)
	bash tools/test_game.sh $(ROM)

clean:
	rm -rf build $(ROM)

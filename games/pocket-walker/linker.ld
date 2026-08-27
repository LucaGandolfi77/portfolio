/* linker.ld - GBA memory layout */
ENTRY(start)

MEMORY
{
    rom   (rx) : ORIGIN = 0x08000000, LENGTH = 32M
    ewram (rw) : ORIGIN = 0x02000000, LENGTH = 256K
    iwram (rw) : ORIGIN = 0x03000000, LENGTH = 32K
}

SECTIONS
{
    .text :
    {
        KEEP(*(.text.startup))
        *(.text .text.*)
        *(.glue_7t)
        *(.glue_7)
    } > rom

    .rodata :
    {
        *(.rodata .rodata.*)
    } > rom

    /* NOTE: no .data section on purpose - everything is const (ROM) or
     * zero-initialized (BSS below). If the compiler emits initialized
     * data, the link fails with an orphan-section error: fix by adding a
     * .data section here AND a copy loop in crt0.s. */

    /* Keep .iwram_bss FIRST in IWRAM: the Game struct must sit at
     * 0x03000000 (the headless test harness reads it there). */
    .iwram_bss (NOLOAD) :
    {
        __iwram_bss_start__ = .;
        *(.iwram_bss)
        __iwram_bss_end__ = .;
    } > iwram

    .bss (NOLOAD) :
    {
        __bss_start__ = .;
        *(.bss .bss.*)
        *(COMMON)
        __bss_end__ = .;
    } > iwram
}

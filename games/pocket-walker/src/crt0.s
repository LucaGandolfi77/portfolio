@ crt0.s - GBA startup: ROM header + entry (bare metal, no BIOS, no libgba)
    .syntax unified
    .section .text.startup, "ax"
    .arm
    .global start
    .type start, %function

start:
    b   header_done          @ 0x08000000: branch over the header
    .include "header_inc.s"  @ 0x08000004..0x080000BF: logo + game info
    .balign 4
    .arm
header_done:                 @ 0x080000C0: code starts here
    adr r0, thumb_entry
    orr r0, r0, #1           @ set thumb bit
    bx  r0

    .thumb
    .thumb_func
thumb_entry:
    ldr r0, =0x03007F00      @ stack at top of IWRAM
    mov sp, r0

    @ --- zero .bss (IWRAM) ---
    ldr r0, =__bss_start__
    ldr r1, =__bss_end__
    movs r2, #0
bss_loop:
    cmp r0, r1
    bhs bss_done
    strb r2, [r0]
    adds r0, r0, #1
    b   bss_loop
bss_done:

    @ --- zero .iwram_bss (IWRAM) ---
    ldr r0, =__iwram_bss_start__
    ldr r1, =__iwram_bss_end__
    movs r2, #0
iwram_loop:
    cmp r0, r1
    bhs iwram_done
    strb r2, [r0]
    adds r0, r0, #1
    b   iwram_loop
iwram_done:

    bl  main

hang:
    b   hang
    .ltorg                  @ literal pool for the ldr = loads above

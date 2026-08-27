/* gba.h - minimal GBA hardware register definitions (bare metal, no libgba) */
#ifndef GBA_H
#define GBA_H

typedef unsigned char  u8;
typedef unsigned short u16;
typedef unsigned int   u32;
typedef signed char    s8;
typedef signed short   s16;
typedef signed int     s32;
typedef volatile u8  vu8;
typedef volatile u16 vu16;
typedef volatile u32 vu32;

#define REG_DISPCNT   (*(vu16*)0x04000000)
#define REG_BG0CNT    (*(vu16*)0x04000008)
#define REG_BG0HOFS   (*(vu16*)0x04000010)
#define REG_BG0VOFS   (*(vu16*)0x04000012)
#define REG_KEYINPUT  (*(vu16*)0x04000130)
#define REG_VCOUNT    (*(vu16*)0x04000006)

#define DISPCNT_MODE0      0x0000
#define DISPCNT_BG0        0x0100
#define DISPCNT_OBJ        0x1000
#define DISPCNT_OBJ_1D     0x0040

#define BG_PRIO(n)          ((n) & 3)
#define BG_CHARBLOCK(n)     (((n) & 3) << 2)
#define BG_SCREENBLOCK(n)   (((n) & 31) << 8)
#define BG_SIZE_64x64       0xC000   /* size bits 11 = 64x64 tiles */

/* VRAM / palette / OAM base addresses */
#define VRAM_BG_TILES   ((vu16*)0x06000000)   /* char base 0 */
#define VRAM_BG_MAP     ((vu16*)0x06002000)   /* screen block 4 (64x64) */
#define VRAM_OBJ_TILES  ((vu16*)0x06010000)
#define PAL_BG          ((vu16*)0x05000000)
#define PAL_OBJ         ((vu16*)0x05000200)
#define OAM             ((vu16*)0x07000000)

/* key bits: 0 = pressed (active low on hardware) */
#define KEY_A      0x0001
#define KEY_B      0x0002
#define KEY_SELECT 0x0004
#define KEY_START  0x0008
#define KEY_RIGHT  0x0010
#define KEY_LEFT   0x0020
#define KEY_UP     0x0040
#define KEY_DOWN   0x0080

static inline u16 keys_pressed(void) { return (u16)~REG_KEYINPUT; }

static inline void wait_vblank(void)
{
    while (REG_VCOUNT < 160) {}
    while (REG_VCOUNT >= 160) {}
}

#endif /* GBA_H */

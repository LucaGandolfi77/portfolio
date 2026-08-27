/* main.c - Pocket Walker: a tiny Pokemon Red/Blue-style overworld walker
 * (no battles). Walk around town with the D-pad, read signs with A,
 * enter the house, and collect all red berries.
 *
 * Bare metal GBA: Mode 0, one 64x64 tile background (BG0) + one 16x16
 * sprite (OBJ0). The dialog box is stamped into the BG0 tilemap (the
 * world map) while movement is frozen, then restored.
 */
#include "gba.h"
#include "gfx_data.h"
#include "map_data.h"

#define WORLD_W 512
#define WORLD_H 512
#define SCREEN_W 240
#define SCREEN_H 160

#define STATE_EXPLORE 0
#define STATE_DIALOG  1

/* facing */
#define F_DOWN 0
#define F_UP   1
#define F_LEFT 2
#define F_RIGHT 3

/* ------------------------------------------------------------------ */
/* Game state. This struct lives at the very start of .iwram_bss, i.e.
 * at 0x03000000, so the test harness can read/write it via the emulator
 * bus. (Field order is part of the test contract.) */
typedef struct {
    s16 px, py;         /* 0,2  player pixel position in the world */
    u8  facing;         /* 4    0 down 1 up 2 left 3 right */
    u8  map;            /* 5    current map index */
    u8  berries;        /* 6    collected */
    u8  total;          /* 7    = BERRY_TOTAL */
    u8  state;          /* 8    EXPLORE / DIALOG */
    u8  moving;         /* 9    currently walking */
    u8  step;           /* 10   walk animation frame 0/1 */
    u8  prio;           /* 11   OBJ priority (0 normal, 3 dialog) */
    u8  pad[2];         /* 12..13 */
    u8  box_open;       /* 14   dialog box currently stamped on the map */
    u8  pad2;           /* 15 */
    u8  dbg_keys;       /* 16   last keys read (debug) */
    u8  dbg_press;      /* 17   last edge press (debug) */
    u8  dbg_ct;         /* 18   dialog box: camera tile x (debug) */
    u8  dbg_rt;         /* 19   dialog box: camera tile y (debug) */
    const char* cur_msg; /* 20   message currently shown (or NULL) */
} Game;

static Game game __attribute__((section(".iwram_bss")));

static u8 map_ram[MAP_COUNT][4096];          /* IWRAM: editable maps */
static u8 box_save[30 * 5];                  /* tiles hidden by the box */
static int camx, camy;                       /* camera (BG0HOFS/VOFS are
                                              * write-only, so we keep the
                                              * values in RAM) */

/* dialog messages */
static const char MSG_INTRO1[] = "HELLO! I AM A LITTLE EXPLORER.";
static const char MSG_INTRO2[] =
    "FIND THE 6 RED BERRIES.\nPRESS A ON SIGNS.\nPRESS START FOR STATUS.";
static const char MSG_SIGN_TOWN[] =
    "WELCOME TO POCKET TOWN!\nPRESS A TO READ SIGNS.";
static const char MSG_SIGN_LAKE[] =
    "THE LAKE IS DEEP.\nNO SWIMMING!";
static const char MSG_SIGN_HOUSE[] =
    "THIS IS MY HOUSE.\nTHE DOOR IS OPEN. COME IN!";
static const char MSG_ALL_BERRIES[] =
    "GREAT! YOU FOUND\nALL 6 BERRIES!";
static char berry_msg[30];
static char status_msg[24];

/* ------------------------------------------------------------------ */
static inline int tile_at(u8 map, int tx, int ty)
{
    if (tx < 0 || ty < 0 || tx >= 64 || ty >= 64)
        return TILE_TREE_TL;  /* treat outside world as solid */
    return map_ram[map][ty * 64 + tx];
}

static int is_solid(u8 t)
{
    switch (t) {
    case TILE_TREE_TL: case TILE_TREE_TR:
    case TILE_TREE_BL: case TILE_TREE_BR:
    case TILE_WATER1: case TILE_WATER2:
    case TILE_WALL: case TILE_ROOF:
    case TILE_DOOR: case TILE_SIGN:
    case TILE_IWALL:
        return 1;
    }
    return 0;
}

/* GBA stores a 64x64 BG map as four 32x32 quadrant screenblocks
 * (SB top-left, SB+1 top-right, SB+2 bottom-left, SB+3 bottom-right).
 * map_ram is plain row-major, so convert when uploading to VRAM. */
static int vram_entry(int row, int col)
{
    int quad = ((row >> 5) << 1) | (col >> 5);
    return (quad << 10) | ((row & 31) << 5) | (col & 31);
}

static void upload_map(u8 map)
{
    int r, c;
    for (r = 0; r < 64; r++)
        for (c = 0; c < 64; c++)
            VRAM_BG_MAP[vram_entry(r, c)] = map_ram[map][r * 64 + c];
}

static void upload_tile_region(u8 map, int r0, int c0, int rows, int cols)
{
    int r, c;
    for (r = 0; r < rows; r++)
        for (c = 0; c < cols; c++)
            VRAM_BG_MAP[vram_entry(r0 + r, c0 + c)] =
                map_ram[map][(r0 + r) * 64 + c0 + c];
}

static void cam_update(void)
{
    camx = game.px - (SCREEN_W - 16) / 2;
    camy = game.py - (SCREEN_H - 16) / 2;
    if (camx < 0) camx = 0;
    if (camy < 0) camy = 0;
    if (camx > WORLD_W - SCREEN_W) camx = WORLD_W - SCREEN_W;
    if (camy > WORLD_H - SCREEN_H) camy = WORLD_H - SCREEN_H;
    REG_BG0HOFS = (u16)camx;
    REG_BG0VOFS = (u16)camy;
}

/* ------------------------------------------------------------------ */
static int try_move(int dx, int dy)
{
    s16 nx = game.px + dx;
    s16 ny = game.py + dy;
    if (nx < 0 || ny < 0 || nx > WORLD_W - 16 || ny > WORLD_H - 16)
        return 0;
    /* only check the entering edge to avoid corner-snag artifacts */
    if (dy < 0) {
        if (is_solid(tile_at(game.map, nx >> 3, ny >> 3)) ||
            is_solid(tile_at(game.map, (nx + 15) >> 3, ny >> 3)))
            return 0;
    } else if (dy > 0) {
        if (is_solid(tile_at(game.map, nx >> 3, (ny + 15) >> 3)) ||
            is_solid(tile_at(game.map, (nx + 15) >> 3, (ny + 15) >> 3)))
            return 0;
    } else if (dx < 0) {
        if (is_solid(tile_at(game.map, nx >> 3, ny >> 3)) ||
            is_solid(tile_at(game.map, nx >> 3, (ny + 15) >> 3)))
            return 0;
    } else {
        if (is_solid(tile_at(game.map, (nx + 15) >> 3, ny >> 3)) ||
            is_solid(tile_at(game.map, (nx + 15) >> 3, (ny + 15) >> 3)))
            return 0;
    }
    game.px = nx;
    game.py = ny;
    return 1;
}

/* ------------------------------------------------------------------ */
/* dialog box: stamped into the world map at the bottom 5 tile rows */
#define BOX_TOP   15
#define BOX_ROWS  5
#define BOX_COLS  30
#define BOX_TEXT_COLS 28

static void draw_dialog(const char* msg)
{
    int ct = camx >> 3;
    int rt = camy >> 3;
    int r, c, line = 0, col = 1;
    game.dbg_ct = (u8)ct;
    game.dbg_rt = (u8)rt;
    if (!game.box_open) {
        /* first stamp: remember what was underneath */
        for (r = 0; r < BOX_ROWS; r++)
            for (c = 0; c < BOX_COLS; c++) {
                int mrow = rt + BOX_TOP + r;
                int mcol = ct + c;
                box_save[r * BOX_COLS + c] =
                    map_ram[game.map][mrow * 64 + mcol];
            }
        game.box_open = 1;
    }
    for (r = 0; r < BOX_ROWS; r++)
        for (c = 0; c < BOX_COLS; c++) {
            int mrow = rt + BOX_TOP + r;
            int mcol = ct + c;
            map_ram[game.map][mrow * 64 + mcol] = TILE_BLACK;
        }
    for (; *msg && line < 3; msg++) {
        if (*msg == '\n') {
            line++;
            col = 1;
            continue;
        }
        if (col < BOX_COLS - 1) {
            int mrow = rt + BOX_TOP + 1 + line;
            int mcol = ct + col;
            map_ram[game.map][mrow * 64 + mcol] =
                (u8)(TILE_FONT_BASE + gfx_char_map[(u8)*msg]);
            col++;
        }
    }
    upload_tile_region(game.map, rt + BOX_TOP, ct, BOX_ROWS, BOX_COLS);
}

static void close_dialog(void)
{
    int ct = camx >> 3;
    int rt = camy >> 3;
    int r, c;
    for (r = 0; r < BOX_ROWS; r++)
        for (c = 0; c < BOX_COLS; c++) {
            int mrow = rt + BOX_TOP + r;
            int mcol = ct + c;
            map_ram[game.map][mrow * 64 + mcol] = box_save[r * BOX_COLS + c];
        }
    upload_tile_region(game.map, rt + BOX_TOP, ct, BOX_ROWS, BOX_COLS);
    game.state = STATE_EXPLORE;
    game.prio = 0;
    game.cur_msg = 0;
    game.box_open = 0;
}

static void open_dialog(const char* msg)
{
    game.state = STATE_DIALOG;
    game.cur_msg = msg;
    game.prio = 3;   /* hero slides behind the box, like Pokemon */
    draw_dialog(msg);
}

/* ------------------------------------------------------------------ */
/* writes a small unsigned int (<=255) without division or libgcc */
static void put_uint(char** pp, u8 v)
{
    static const u8 scales[3] = {100, 10, 1};
    int started = 0;
    int i;
    for (i = 0; i < 3; i++) {
        u8 s = scales[i];
        u8 d = 0;
        while (v >= s) { v = (u8)(v - s); d++; }
        if (d || started || s == 1) {
            *(*pp)++ = (char)('0' + d);
            started = 1;
        }
    }
}

static void build_berry_msg(void)
{
    const char* t = "YOU FOUND A BERRY! (";
    char* p = berry_msg;
    while (*t) *p++ = *t++;
    put_uint(&p, game.berries);
    *p++ = '/';
    put_uint(&p, game.total);
    *p++ = ')';
    *p = 0;
}

static void build_status_msg(void)
{
    const char* t = "BERRIES ";
    char* p = status_msg;
    while (*t) *p++ = *t++;
    put_uint(&p, game.berries);
    *p++ = '/';
    put_uint(&p, game.total);
    *p = 0;
}

static void check_berry(void)
{
    /* only scan the tiles the sprite actually covers (2x2 at most) */
    int tx0 = game.px >> 3, tx1 = (game.px + 15) >> 3;
    int ty0 = game.py >> 3, ty1 = (game.py + 15) >> 3;
    int tx, ty;
    for (ty = ty0; ty <= ty1; ty++)
        for (tx = tx0; tx <= tx1; tx++) {
            if (tx < 0 || ty < 0 || tx >= 64 || ty >= 64)
                continue;
            if (map_ram[game.map][ty * 64 + tx] == TILE_BERRY) {
                int c0 = tx & ~1, r0 = ty & ~1;   /* berry cell is 2x2 */
                map_ram[game.map][r0 * 64 + c0]     = TILE_GRASS1;
                map_ram[game.map][r0 * 64 + c0 + 1] = TILE_GRASS2;
                map_ram[game.map][(r0 + 1) * 64 + c0]     = TILE_GRASS3;
                map_ram[game.map][(r0 + 1) * 64 + c0 + 1] = TILE_GRASS1;
                upload_tile_region(game.map, r0, c0, 2, 2);
                game.berries++;
                if (game.berries >= game.total) {
                    open_dialog(MSG_ALL_BERRIES);
                } else {
                    build_berry_msg();
                    open_dialog(berry_msg);
                }
                return;
            }
        }
}

/* ------------------------------------------------------------------ */
static void enter_house(void)
{
    game.map = MAP_HOUSE;
    game.px = 15 * 16;
    game.py = 21 * 16;
    game.facing = F_UP;
    game.moving = 0;
    upload_map(game.map);
    cam_update();
}

static void exit_house(void)
{
    game.map = MAP_TOWN;
    game.px = 20 * 16;   /* town door is at cell (15,20) */
    game.py = 16 * 16;
    game.facing = F_UP;
    game.moving = 0;
    upload_map(game.map);
    cam_update();
}

static const char* sign_message(int ty, int tx)
{
    if (game.map == MAP_TOWN) {
        if (ty == 18 && tx == 4)  return MSG_SIGN_LAKE;
        if (ty == 38 && tx == 12) return MSG_SIGN_TOWN;
        if (ty == 26 && tx == 52) return MSG_SIGN_HOUSE;
    }
    return MSG_SIGN_TOWN;
}

/* returns the up-to-2 tiles of the 16px area directly in front */
static int front_tiles(int tiles[2][2])
{
    int n = 0;
    switch (game.facing) {
    case F_DOWN: {
        int ty = (game.py + 16) >> 3;
        int tx0 = game.px >> 3, tx1 = (game.px + 15) >> 3;
        if (ty < 64) { tiles[n][0] = ty; tiles[n][1] = tx0; n++; }
        if (tx1 != tx0 && ty < 64) { tiles[n][0] = ty; tiles[n][1] = tx1; n++; }
        break;
    }
    case F_UP: {
        int ty = (game.py - 1) >> 3;
        int tx0 = game.px >> 3, tx1 = (game.px + 15) >> 3;
        if (ty >= 0) { tiles[n][0] = ty; tiles[n][1] = tx0; n++; }
        if (tx1 != tx0 && ty >= 0) { tiles[n][0] = ty; tiles[n][1] = tx1; n++; }
        break;
    }
    case F_LEFT: {
        int tx = (game.px - 1) >> 3;
        int ty0 = game.py >> 3, ty1 = (game.py + 15) >> 3;
        if (tx >= 0) { tiles[n][0] = ty0; tiles[n][1] = tx; n++; }
        if (ty1 != ty0 && tx >= 0) { tiles[n][0] = ty1; tiles[n][1] = tx; n++; }
        break;
    }
    case F_RIGHT: {
        int tx = (game.px + 16) >> 3;
        int ty0 = game.py >> 3, ty1 = (game.py + 15) >> 3;
        if (tx < 64) { tiles[n][0] = ty0; tiles[n][1] = tx; n++; }
        if (ty1 != ty0 && tx < 64) { tiles[n][0] = ty1; tiles[n][1] = tx; n++; }
        break;
    }
    }
    return n;
}

static void try_interact(void)
{
    int tiles[2][2];
    int n = front_tiles(tiles);
    int i;
    for (i = 0; i < n; i++) {
        int ty = tiles[i][0], tx = tiles[i][1];
        u8 t = (u8)tile_at(game.map, tx, ty);
        if (t == TILE_SIGN) {
            open_dialog(sign_message(ty, tx));
            return;
        }
        if (t == TILE_DOOR) {
            if (game.map == MAP_TOWN)
                enter_house();
            else
                exit_house();
            return;
        }
    }
}

/* ------------------------------------------------------------------ */
static void dialog_advance(void)
{
    if (game.cur_msg == MSG_INTRO1) {
        open_dialog(MSG_INTRO2);   /* intro has two pages */
    } else {
        close_dialog();
    }
}

static void update_oam(void)
{
    int sx = game.px - camx;
    int sy = game.py - camy;
    u16 tile = (u16)((game.facing * 2 + (game.moving ? game.step : 0)) * 4);
    OAM[0] = (u16)sy;                       /* attr0: y, 4bpp, normal */
    OAM[1] = (u16)sx | 0x4000;              /* attr1: x, 16x16 (size 01) */
    OAM[2] = tile | (u16)(game.prio << 10); /* attr2: tile, priority, pal 0 */
}

static void update_player(u16 held, u16 press)
{
    int dx = 0, dy = 0;
    if (held & KEY_UP)    { dy = -1; game.facing = F_UP; }
    else if (held & KEY_DOWN)  { dy = 1;  game.facing = F_DOWN; }
    else if (held & KEY_LEFT)  { dx = -1; game.facing = F_LEFT; }
    else if (held & KEY_RIGHT) { dx = 1;  game.facing = F_RIGHT; }

    if (dx || dy) {
        if (try_move(dx, dy)) {
            if (((game.px | game.py) & 7) == 0)
                game.step ^= 1;
            game.moving = 1;
        } else {
            game.moving = 0;
        }
        if (game.state == STATE_EXPLORE)
            check_berry();      /* may open a dialog */
    } else {
        game.moving = 0;
    }

    if (press & KEY_A)
        try_interact();
    if (press & KEY_START) {
        build_status_msg();
        open_dialog(status_msg);
    }
}

/* ------------------------------------------------------------------ */
static void init_game(void)
{
    int m, i;
    game.map = MAP_TOWN;
    game.px = 7 * 16;
    game.py = 19 * 16;
    game.facing = F_DOWN;
    game.berries = 0;
    game.total = BERRY_TOTAL;
    game.state = STATE_EXPLORE;
    game.moving = 0;
    game.step = 0;
    game.prio = 0;
    game.cur_msg = 0;

    for (m = 0; m < MAP_COUNT; m++)
        for (i = 0; i < 4096; i++)
            map_ram[m][i] = gfx_maps[m][i];
    upload_map(game.map);
    cam_update();
}

static void init_video(void)
{
    int i;
    REG_DISPCNT = DISPCNT_MODE0 | DISPCNT_BG0 | DISPCNT_OBJ | DISPCNT_OBJ_1D;
    REG_BG0CNT = BG_PRIO(1) | BG_CHARBLOCK(0) | BG_SCREENBLOCK(4) | BG_SIZE_64x64;

    for (i = 0; i < 16; i++)
        PAL_BG[i] = gfx_bg_pal[i];
    for (i = 0; i < 16; i++)
        PAL_OBJ[i] = gfx_obj_pal[i];

    for (i = 0; i < TILE_COUNT * 16; i++)
        VRAM_BG_TILES[i] = gfx_bg_tiles[i];
    for (i = 0; i < FONT_GLYPHS * 16; i++)
        VRAM_BG_TILES[TILE_FONT_BASE * 16 + i] = gfx_font_tiles[i];
    for (i = 0; i < HERO_FRAMES * 4 * 16; i++)
        VRAM_OBJ_TILES[i] = gfx_hero[i];

    /* hide every other object (put them off screen) */
    for (i = 1; i < 128; i++) {
        OAM[i * 3] = 160;
        OAM[i * 3 + 1] = 0;
        OAM[i * 3 + 2] = 0;
    }
}

int main(void)
{
    u16 prev = 0;

    init_video();
    init_game();

    open_dialog(MSG_INTRO1);   /* say hello first */

    for (;;) {
        u16 keys, press;
        wait_vblank();
        keys = keys_pressed();
        press = keys & ~prev;
        prev = keys;
        game.dbg_keys = (u8)keys;
        game.dbg_press = (u8)press;

        if (game.state == STATE_DIALOG) {
            if (press & KEY_A)
                dialog_advance();
        } else {
            update_player(keys, press);
            cam_update();
        }
        update_oam();
    }
}

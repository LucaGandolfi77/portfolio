# Spotify Playlist Feature — Music.html

## Overview
L'aggiornamento di `music.html` aggiunge la possibilità di incollare direttamente un link di playlist di Spotify per ascoltarla nell'embedded Spotify player.

## How It Works

### Input Methods
1. **Paste Spotify Link**: Incolla il link della playlist nel campo di input
2. **Press Enter or Click Button**: Premi Invio o clicca il pulsante "Load Playlist"
3. **Automatic Extraction**: Il sistema estrae automaticamente l'ID playlist dal link
4. **Instant Playback**: La playlist carica nell'embedded player

### Supported Link Formats
Il sistema supporta tutti i formati standard di link Spotify:
- `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYKl2d`
- `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYKl2d?si=...` (con parametri)
- `spotify:playlist:37i9dQZF1DXcBWIGoYKl2d` (formato URI)

### UI Components
```
┌─ Playlists List ────────────────────┬─ Spotify Player ──┐
│ Paste Spotify Link                 │                   │
│ [https://...........] [Load]        │  [Embedded Frame] │
│ Search playlists... [Search box]    │                   │
│ - Playlist 1                         │                   │
│ - Playlist 2                         │                   │
└────────────────────────────────────┴───────────────────┘
```

## Implementation Details

### JavaScript Functions

#### `extractSpotifyPlaylistId(url)`
Estrae l'ID playlist dal link usando una regex:
```javascript
const match = url.match(/(?:spotify\.com\/playlist\/|spotify:playlist:)([a-zA-Z0-9]+)/);
```

#### Event Listeners
- **Load Button Click**: Valida il link, estrae l'ID, carica la playlist
- **Enter Key**: Consente di caricare premendo Invio nel campo input
- **Search Input**: Filtra le playlist salvate localmente

### Error Handling
- Alert se il campo è vuoto
- Alert se il link non è un link Spotify valido
- Fallback automatico alla prima playlist se nessun link inserito

## Internationalization (i18n)

### Translation Keys Added
```
music.playlists.customPlaylist
music.playlists.spotifyLinkPlaceholder
music.playlists.loadPlaylist
```

### Languages Supported (9 of 11)
- ✅ English (en)
- ✅ Italiano (it)
- ✅ Español (es)
- ✅ Français (fr)
- ✅ Deutsch (de)
- ✅ Русский (ru)
- ✅ 日本語 (ja)
- ✅ 中文 (zh)
- ✅ العربية (ar)
- ⚠️ Svenska (sv) - Pre-existing JSON errors
- ⚠️ עברית (he) - Pre-existing JSON errors

## CSS Styling
Il bottone "Load Playlist" utilizza lo stesso design coerente di music.html:
- Colore primario: `#a78bfa` (viola-azzurro)
- Hover effect: Scale + shadow
- Responsive: Si adatta a tutti i device

## Usage Example
```
1. Vai a music.html
2. Copia il link di una playlist dal tuo profilo Spotify
3. Incolla nel campo "Paste Spotify Link"
4. Premi Invio o clicca "Load Playlist"
5. La playlist carica automaticamente nel player
```

## Notes
- Il link deve essere pubblico per funzionare
- L'input viene pulito dopo aver caricato una playlist
- È possibile selezionare playlist salvate localmente o incollare link personalizzati
- Il player utilizza l'Spotify embed standard di Spotify

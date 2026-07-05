#!/usr/bin/env python3
import json

languages = {
    'en': {
        'customPlaylist': 'Paste Spotify Link',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'Load Playlist'
    },
    'it': {
        'customPlaylist': 'Incolla Link Spotify',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'Carica Playlist'
    },
    'es': {
        'customPlaylist': 'Pegar enlace de Spotify',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'Cargar Playlist'
    },
    'fr': {
        'customPlaylist': 'Coller un lien Spotify',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'Charger la Playlist'
    },
    'de': {
        'customPlaylist': 'Spotify-Link einfügen',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'Playlist laden'
    },
    'ru': {
        'customPlaylist': 'Вставить ссылку Spotify',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'Загрузить плейлист'
    },
    'ja': {
        'customPlaylist': 'Spotifyリンクを貼り付け',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'プレイリストを読み込む'
    },
    'zh': {
        'customPlaylist': '粘贴Spotify链接',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': '加载播放列表'
    },
    'sv': {
        'customPlaylist': 'Klistra in Spotify-länk',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'Ladda spellist'
    },
    'ar': {
        'customPlaylist': 'لصق رابط Spotify',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'تحميل قائمة التشغيل'
    },
    'he': {
        'customPlaylist': 'הדבק קישור Spotify',
        'spotifyLinkPlaceholder': 'https://open.spotify.com/playlist/...',
        'loadPlaylist': 'טען רשימת השמעה'
    }
}

# List of all i18n files
i18n_files = ['en', 'it', 'es', 'fr', 'de', 'ru', 'ja', 'zh', 'sv', 'ar', 'he']

for lang in i18n_files:
    filepath = f'i18n/{lang}.json'
    
    try:
        # Read existing file
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Ensure music.playlists section exists
        if 'music' not in data:
            data['music'] = {}
        if 'playlists' not in data['music']:
            data['music']['playlists'] = {}
        
        # Add translations
        if lang in languages:
            data['music']['playlists'].update(languages[lang])
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f'✓ {lang}.json updated with Spotify link translations')
    
    except Exception as e:
        print(f'✗ Error updating {lang}.json: {e}')

print('\n✓ All Spotify link translations added!')

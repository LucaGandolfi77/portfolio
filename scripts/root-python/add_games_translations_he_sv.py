#!/usr/bin/env python3
import json
import os

# Additional translations for he.json and sv.json
additional_languages = {
    'he': {
        'nav': {
            'games': 'משחקים'
        },
        'sections': {
            'games': 'משחקים וכיף'
        },
        'games': {
            'forza4': {
                'title': 'ארבע בשורה',
                'lead': 'שחק כנגד יריב בינה מלאכותית עם עומק אסטרטגי.',
                'level': 'רמת קושי בינונית',
                'back': 'חזור למשחקים',
                'gameTitle': 'ארבע בשורה',
                'gameSubtitle': 'שחק כנגד יריב בינה מלאכותית',
                'playerScore': 'הניקוד שלך',
                'aiScore': 'ניקוד בינה מלאכותית',
                'draws': 'תיקו',
                'difficulty': 'קושי',
                'easy': 'קל',
                'medium': 'בינוני',
                'hard': 'קשה',
                'yourTurn': 'התור שלך — כלים צהובים',
                'aiTurn': 'בינה מלאכותית חושבת...',
                'playerWins': '🎉 ניצחת!',
                'aiWins': 'בינה מלאכותית ניצחה בסיבוב זה',
                'gameDraw': 'תיקו — הלוח מלא',
                'newGame': 'משחק חדש',
                'resetStats': 'אפס סטטיסטיקה',
                'confirmReset': 'אפס את כל הסטטיסטיקה? לא ניתן לבטל זאת.'
            }
        }
    },
    'sv': {
        'nav': {
            'games': 'Spel'
        },
        'sections': {
            'games': 'Spel & Nöje'
        },
        'games': {
            'forza4': {
                'title': 'Fyra i rad',
                'lead': 'Spela mot en AI-motståndare med strategiskt djup.',
                'level': 'Medelmåttig svårighetsgrad',
                'back': 'Tillbaka till spel',
                'gameTitle': 'Fyra i rad',
                'gameSubtitle': 'Spela mot en AI-motståndare',
                'playerScore': 'Din poäng',
                'aiScore': 'AI-poäng',
                'draws': 'Oavgjord',
                'difficulty': 'Svårighetsgrad',
                'easy': 'Lätt',
                'medium': 'Medel',
                'hard': 'Svår',
                'yourTurn': 'Din tur — gula brickor',
                'aiTurn': 'AI:n tänker...',
                'playerWins': '🎉 Du vann!',
                'aiWins': 'AI vann denna omgång',
                'gameDraw': 'Oavgjord — brädet är fullt',
                'newGame': 'Nytt spel',
                'resetStats': 'Återställ statistik',
                'confirmReset': 'Återställa all statistik? Detta kan inte ångras.'
            }
        }
    }
}

def update_i18n_files():
    for lang_code, translations in additional_languages.items():
        file_path = f'./i18n/{lang_code}.json'
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Update nav section
            if 'nav' in translations:
                if 'nav' not in data:
                    data['nav'] = {}
                data['nav'].update(translations['nav'])
            
            # Update sections
            if 'sections' in translations:
                if 'sections' not in data:
                    data['sections'] = {}
                data['sections'].update(translations['sections'])
            
            # Add games section
            if 'games' in translations:
                data['games'] = translations['games']
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f'✓ {lang_code}.json aggiornato')
        except Exception as e:
            print(f'✗ Errore in {lang_code}.json: {e}')

if __name__ == '__main__':
    update_i18n_files()
    print('\n✓ Traduzioni ebraico e svedese aggiunte!')

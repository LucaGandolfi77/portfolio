#!/usr/bin/env python3
import json
import os

languages = {
    'en': {
        'games': {
            'goose': {
                'title': 'Game of the Goose',
                'lead': 'Classic race game. Roll the dice and avoid the traps!',
                'level': 'Pure Luck',
                'back': 'Back to Games',
                'roll': 'Roll Dice',
                'reset': 'Reset'
            }
        }
    },
    'it': {
        'games': {
            'goose': {
                'title': 'Gioco dell\'Oca',
                'lead': 'Classico gioco di percorso. Lancia i dadi ed evita le trappole!',
                'level': 'Pura Fortuna',
                'back': 'Torna ai giochi',
                'roll': 'Lancia Dadi',
                'reset': 'Resetta'
            }
        }
    },
    'es': {
        'games': {
            'goose': {
                'title': 'Juego de la Oca',
                'lead': 'Juego de carrera clásico. ¡Tira los dados y evita las trampas!',
                'level': 'Pura Suerte',
                'back': 'Volver a los juegos',
                'roll': 'Tirar Dados',
                'reset': 'Reiniciar'
            }
        }
    },
    'fr': {
        'games': {
            'goose': {
                'title': 'Jeu de l\'Oie',
                'lead': 'Jeu de course classique. Lancez les dés et évitez les pièges !',
                'level': 'Pure Chance',
                'back': 'Retour aux jeux',
                'roll': 'Lancer les dés',
                'reset': 'Réinitialiser'
            }
        }
    },
    'de': {
        'games': {
            'goose': {
                'title': 'Gänsespiel',
                'lead': 'Klassisches Rennspiel. Würfeln Sie und vermeiden Sie die Fallen!',
                'level': 'Reines Glück',
                'back': 'Zurück zu den Spielen',
                'roll': 'Würfeln',
                'reset': 'Zurücksetzen'
            }
        }
    },
    'ru': {
        'games': {
            'goose': {
                'title': 'Игра в Гуся',
                'lead': 'Классическая гонка. Бросайте кости и избегайте ловушек!',
                'level': 'Чистая удача',
                'back': 'Вернуться к играм',
                'roll': 'Бросить кости',
                'reset': 'Сброс'
            }
        }
    },
    'ja': {
        'games': {
            'goose': {
                'title': 'ガチョウのゲーム',
                'lead': '古典的なレースゲーム。サイコロを振って罠を避けよう！',
                'level': '純粋な運',
                'back': 'ゲームに戻る',
                'roll': 'サイコロを振る',
                'reset': 'リセット'
            }
        }
    },
    'zh': {
        'games': {
            'goose': {
                'title': '鹅棋',
                'lead': '经典竞速游戏。掷骰子并避开陷阱！',
                'level': '纯运气',
                'back': '返回游戏',
                'roll': '掷骰子',
                'reset': '重置'
            }
        }
    }
}

def update_i18n_files():
    for lang_code, translations in languages.items():
        file_path = f'./i18n/{lang_code}.json'
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Add goose to games section
            if 'games' not in data:
                data['games'] = {}
            
            if 'games' in translations:
                data['games'].update(translations['games'])
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f'✓ {lang_code}.json aggiornato')
        except Exception as e:
            print(f'✗ Errore in {lang_code}.json: {e}')

if __name__ == '__main__':
    update_i18n_files()
    print('\n✓ Tutte le traduzioni goose aggiunte!')

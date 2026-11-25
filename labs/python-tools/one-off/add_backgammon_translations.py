#!/usr/bin/env python3
import json
import os

languages = {
    'en': {
        'games': {
            'backgammon': {
                'title': 'Backgammon',
                'lead': 'Race your checkers to the finish line.',
                'level': 'Medium difficulty',
                'back': 'Back to Games',
                'roll': 'Roll Dice',
                'reset': 'Reset',
                'whiteTurn': "White's Turn",
                'blackTurn': "Black's Turn"
            }
        }
    },
    'it': {
        'games': {
            'backgammon': {
                'title': 'Backgammon',
                'lead': 'Porta le tue pedine al traguardo.',
                'level': 'Media difficoltà',
                'back': 'Torna ai giochi',
                'roll': 'Lancia Dadi',
                'reset': 'Resetta',
                'whiteTurn': "Tocca al Bianco",
                'blackTurn': "Tocca al Nero"
            }
        }
    },
    'es': {
        'games': {
            'backgammon': {
                'title': 'Backgammon',
                'lead': 'Lleva tus fichas a la meta.',
                'level': 'Dificultad media',
                'back': 'Volver a los juegos',
                'roll': 'Tirar Dados',
                'reset': 'Reiniciar',
                'whiteTurn': "Turno de Blancas",
                'blackTurn': "Turno de Negras"
            }
        }
    },
    'fr': {
        'games': {
            'backgammon': {
                'title': 'Backgammon',
                'lead': 'Amenez vos pions à l\'arrivée.',
                'level': 'Difficulté moyenne',
                'back': 'Retour aux jeux',
                'roll': 'Lancer les dés',
                'reset': 'Réinitialiser',
                'whiteTurn': "Tour des Blancs",
                'blackTurn': "Tour des Noirs"
            }
        }
    },
    'de': {
        'games': {
            'backgammon': {
                'title': 'Backgammon',
                'lead': 'Bringen Sie Ihre Steine ins Ziel.',
                'level': 'Mittlerer Schwierigkeitsgrad',
                'back': 'Zurück zu den Spielen',
                'roll': 'Würfeln',
                'reset': 'Zurücksetzen',
                'whiteTurn': "Weiß am Zug",
                'blackTurn': "Schwarz am Zug"
            }
        }
    },
    'ru': {
        'games': {
            'backgammon': {
                'title': 'Нарды',
                'lead': 'Приведите свои шашки к финишу.',
                'level': 'Средняя сложность',
                'back': 'Вернуться к играм',
                'roll': 'Бросить кости',
                'reset': 'Сброс',
                'whiteTurn': "Ход белых",
                'blackTurn': "Ход черных"
            }
        }
    },
    'ja': {
        'games': {
            'backgammon': {
                'title': 'バックギャモン',
                'lead': 'チェッカーをゴールまで運びます。',
                'level': '中程度の難易度',
                'back': 'ゲームに戻る',
                'roll': 'サイコロを振る',
                'reset': 'リセット',
                'whiteTurn': "白の番",
                'blackTurn': "黒の番"
            }
        }
    },
    'zh': {
        'games': {
            'backgammon': {
                'title': '双陆棋',
                'lead': '将你的棋子移到终点。',
                'level': '中等难度',
                'back': '返回游戏',
                'roll': '掷骰子',
                'reset': '重置',
                'whiteTurn': "白方回合",
                'blackTurn': "黑方回合"
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
            
            # Add backgammon to games section
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
    print('\n✓ Tutte le traduzioni backgammon aggiunte!')

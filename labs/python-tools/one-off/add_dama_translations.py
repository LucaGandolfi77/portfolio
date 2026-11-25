#!/usr/bin/env python3
import json
import os

languages = {
    'en': {
        'games': {
            'dama': {
                'title': 'Checkers',
                'lead': 'Classic board game. Jump over opponent pieces to capture them.',
                'level': 'Medium difficulty',
                'back': 'Back to Games',
                'gameTitle': 'Checkers',
                'gameSubtitle': 'Classic Board Game',
                'whiteTurn': "White's Turn",
                'blackTurn': "Black's Turn",
                'whiteWins': "White Wins!",
                'blackWins': "Black Wins!",
                'reset': 'Reset Game'
            }
        }
    },
    'it': {
        'games': {
            'dama': {
                'title': 'Dama',
                'lead': 'Classico gioco da tavolo. Salta sopra i pezzi avversari per catturarli.',
                'level': 'Media difficoltà',
                'back': 'Torna ai giochi',
                'gameTitle': 'Dama',
                'gameSubtitle': 'Gioco da Tavolo Classico',
                'whiteTurn': "Tocca al Bianco",
                'blackTurn': "Tocca al Nero",
                'whiteWins': "Vince il Bianco!",
                'blackWins': "Vince il Nero!",
                'reset': 'Ricomincia Partita'
            }
        }
    },
    'es': {
        'games': {
            'dama': {
                'title': 'Damas',
                'lead': 'Juego de mesa clásico. Salta sobre las piezas del oponente para capturarlas.',
                'level': 'Dificultad media',
                'back': 'Volver a los juegos',
                'gameTitle': 'Damas',
                'gameSubtitle': 'Juego de Mesa Clásico',
                'whiteTurn': "Turno de Blancas",
                'blackTurn': "Turno de Negras",
                'whiteWins': "¡Ganan las Blancas!",
                'blackWins': "¡Ganan las Negras!",
                'reset': 'Reiniciar Juego'
            }
        }
    },
    'fr': {
        'games': {
            'dama': {
                'title': 'Dames',
                'lead': 'Jeu de société classique. Sautez par-dessus les pièces adverses pour les capturer.',
                'level': 'Difficulté moyenne',
                'back': 'Retour aux jeux',
                'gameTitle': 'Dames',
                'gameSubtitle': 'Jeu de Société Classique',
                'whiteTurn': "Tour des Blancs",
                'blackTurn': "Tour des Noirs",
                'whiteWins': "Les Blancs gagnent !",
                'blackWins': "Les Noirs gagnent !",
                'reset': 'Réinitialiser'
            }
        }
    },
    'de': {
        'games': {
            'dama': {
                'title': 'Dame',
                'lead': 'Klassisches Brettspiel. Überspringen Sie gegnerische Steine, um sie zu schlagen.',
                'level': 'Mittlerer Schwierigkeitsgrad',
                'back': 'Zurück zu den Spielen',
                'gameTitle': 'Dame',
                'gameSubtitle': 'Klassisches Brettspiel',
                'whiteTurn': "Weiß am Zug",
                'blackTurn': "Schwarz am Zug",
                'whiteWins': "Weiß gewinnt!",
                'blackWins': "Schwarz gewinnt!",
                'reset': 'Spiel zurücksetzen'
            }
        }
    },
    'ru': {
        'games': {
            'dama': {
                'title': 'Шашки',
                'lead': 'Классическая настольная игра. Перепрыгивайте через фигуры противника, чтобы захватить их.',
                'level': 'Средняя сложность',
                'back': 'Вернуться к играм',
                'gameTitle': 'Шашки',
                'gameSubtitle': 'Классическая настольная игра',
                'whiteTurn': "Ход белых",
                'blackTurn': "Ход черных",
                'whiteWins': "Белые победили!",
                'blackWins': "Черные победили!",
                'reset': 'Сбросить игру'
            }
        }
    },
    'ja': {
        'games': {
            'dama': {
                'title': 'チェッカー',
                'lead': '古典的なボードゲーム。相手の駒を飛び越えて捕まえます。',
                'level': '中程度の難易度',
                'back': 'ゲームに戻る',
                'gameTitle': 'チェッカー',
                'gameSubtitle': '古典的なボードゲーム',
                'whiteTurn': "白の番",
                'blackTurn': "黒の番",
                'whiteWins': "白の勝ち！",
                'blackWins': "黒の勝ち！",
                'reset': 'ゲームをリセット'
            }
        }
    },
    'zh': {
        'games': {
            'dama': {
                'title': '西洋跳棋',
                'lead': '经典棋盘游戏。跳过对手的棋子来捕获它们。',
                'level': '中等难度',
                'back': '返回游戏',
                'gameTitle': '西洋跳棋',
                'gameSubtitle': '经典棋盘游戏',
                'whiteTurn': "白方回合",
                'blackTurn': "黑方回合",
                'whiteWins': "白方获胜！",
                'blackWins': "黑方获胜！",
                'reset': '重置游戏'
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
            
            # Add dama to games section
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
    print('\n✓ Tutte le traduzioni dama aggiunte!')

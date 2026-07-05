#!/usr/bin/env python3
import json
import os

languages = {
    'en': {
        'games': {
            'chess': {
                'title': 'Chess',
                'lead': 'Classic strategy game against AI.',
                'level': 'High difficulty',
                'back': 'Back to Games',
                'gameTitle': 'Chess',
                'gameSubtitle': 'Challenge the AI',
                'playerScore': 'Your Wins',
                'aiScore': 'AI Wins',
                'status': 'Status',
                'whiteTurn': "White's Turn",
                'blackTurn': "Black's Turn",
                'check': 'Check!',
                'checkmate': 'Checkmate!',
                'draw': 'Draw!',
                'newGame': 'New Game',
                'resetStats': 'Reset Stats'
            }
        }
    },
    'it': {
        'games': {
            'chess': {
                'title': 'Scacchi',
                'lead': 'Classico gioco di strategia contro l\'IA.',
                'level': 'Alta difficoltà',
                'back': 'Torna ai giochi',
                'gameTitle': 'Scacchi',
                'gameSubtitle': 'Sfida l\'IA',
                'playerScore': 'Tue Vittorie',
                'aiScore': 'Vittorie IA',
                'status': 'Stato',
                'whiteTurn': "Tocca al Bianco",
                'blackTurn': "Tocca al Nero",
                'check': 'Scacco!',
                'checkmate': 'Scacco Matto!',
                'draw': 'Patta!',
                'newGame': 'Nuova Partita',
                'resetStats': 'Resetta Statistiche'
            }
        }
    },
    'es': {
        'games': {
            'chess': {
                'title': 'Ajedrez',
                'lead': 'Juego de estrategia clásico contra la IA.',
                'level': 'Alta dificultad',
                'back': 'Volver a los juegos',
                'gameTitle': 'Ajedrez',
                'gameSubtitle': 'Desafía a la IA',
                'playerScore': 'Tus Victorias',
                'aiScore': 'Victorias IA',
                'status': 'Estado',
                'whiteTurn': "Turno de Blancas",
                'blackTurn': "Turno de Negras",
                'check': '¡Jaque!',
                'checkmate': '¡Jaque Mate!',
                'draw': '¡Tablas!',
                'newGame': 'Nuevo Juego',
                'resetStats': 'Reiniciar Estadísticas'
            }
        }
    },
    'fr': {
        'games': {
            'chess': {
                'title': 'Échecs',
                'lead': 'Jeu de stratégie classique contre l\'IA.',
                'level': 'Haute difficulté',
                'back': 'Retour aux jeux',
                'gameTitle': 'Échecs',
                'gameSubtitle': 'Défiez l\'IA',
                'playerScore': 'Vos Victoires',
                'aiScore': 'Victoires IA',
                'status': 'Statut',
                'whiteTurn': "Tour des Blancs",
                'blackTurn': "Tour des Noirs",
                'check': 'Échec !',
                'checkmate': 'Échec et Mat !',
                'draw': 'Nulle !',
                'newGame': 'Nouveau Jeu',
                'resetStats': 'Réinitialiser les Stats'
            }
        }
    },
    'de': {
        'games': {
            'chess': {
                'title': 'Schach',
                'lead': 'Klassisches Strategiespiel gegen die KI.',
                'level': 'Hoher Schwierigkeitsgrad',
                'back': 'Zurück zu den Spielen',
                'gameTitle': 'Schach',
                'gameSubtitle': 'Fordere die KI heraus',
                'playerScore': 'Deine Siege',
                'aiScore': 'KI Siege',
                'status': 'Status',
                'whiteTurn': "Weiß am Zug",
                'blackTurn': "Schwarz am Zug",
                'check': 'Schach!',
                'checkmate': 'Schachmatt!',
                'draw': 'Remis!',
                'newGame': 'Neues Spiel',
                'resetStats': 'Statistiken zurücksetzen'
            }
        }
    },
    'ru': {
        'games': {
            'chess': {
                'title': 'Шахматы',
                'lead': 'Классическая стратегическая игра против ИИ.',
                'level': 'Высокая сложность',
                'back': 'Вернуться к играм',
                'gameTitle': 'Шахматы',
                'gameSubtitle': 'Бросьте вызов ИИ',
                'playerScore': 'Ваши победы',
                'aiScore': 'Победы ИИ',
                'status': 'Статус',
                'whiteTurn': "Ход белых",
                'blackTurn': "Ход черных",
                'check': 'Шах!',
                'checkmate': 'Мат!',
                'draw': 'Ничья!',
                'newGame': 'Новая игра',
                'resetStats': 'Сбросить статистику'
            }
        }
    },
    'ja': {
        'games': {
            'chess': {
                'title': 'チェス',
                'lead': 'AIに対する古典的な戦略ゲーム。',
                'level': '高難易度',
                'back': 'ゲームに戻る',
                'gameTitle': 'チェス',
                'gameSubtitle': 'AIに挑戦',
                'playerScore': 'あなたの勝利',
                'aiScore': 'AIの勝利',
                'status': 'ステータス',
                'whiteTurn': "白の番",
                'blackTurn': "黒の番",
                'check': 'チェック!',
                'checkmate': 'チェックメイト!',
                'draw': '引き分け!',
                'newGame': '新しいゲーム',
                'resetStats': '統計をリセット'
            }
        }
    },
    'zh': {
        'games': {
            'chess': {
                'title': '国际象棋',
                'lead': '对抗人工智能的经典策略游戏。',
                'level': '高难度',
                'back': '返回游戏',
                'gameTitle': '国际象棋',
                'gameSubtitle': '挑战人工智能',
                'playerScore': '你的胜利',
                'aiScore': '人工智能胜利',
                'status': '状态',
                'whiteTurn': "白方回合",
                'blackTurn': "黑方回合",
                'check': '将军!',
                'checkmate': '将死!',
                'draw': '和棋!',
                'newGame': '新游戏',
                'resetStats': '重置统计'
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
            
            # Add chess to games section
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
    print('\n✓ Tutte le traduzioni chess aggiunte!')

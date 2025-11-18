#!/usr/bin/env python3
import json
import os

languages = {
    'en': {
        'nav': {
            'games': 'Games'
        },
        'sections': {
            'games': 'Games & Fun'
        },
        'games': {
            'forza4': {
                'title': 'Connect Four',
                'lead': 'Play against an AI opponent with strategic depth.',
                'level': 'Medium difficulty',
                'back': 'Back to Games',
                'gameTitle': 'Connect Four',
                'gameSubtitle': 'Play against an AI opponent',
                'playerScore': 'Your Score',
                'aiScore': 'AI Score',
                'draws': 'Draws',
                'difficulty': 'Difficulty',
                'easy': 'Easy',
                'medium': 'Medium',
                'hard': 'Hard',
                'yourTurn': 'Your turn — Yellow pieces',
                'aiTurn': 'AI is thinking...',
                'playerWins': '🎉 You won!',
                'aiWins': 'AI won this round',
                'gameDraw': 'Draw — board is full',
                'newGame': 'New Game',
                'resetStats': 'Reset Stats',
                'confirmReset': 'Reset all stats? This cannot be undone.'
            }
        }
    },
    'it': {
        'nav': {
            'games': 'Giochi'
        },
        'sections': {
            'games': 'Giochi e Divertimento'
        },
        'games': {
            'forza4': {
                'title': 'Forza 4',
                'lead': 'Gioca contro un avversario IA con profondità strategica.',
                'level': 'Difficoltà media',
                'back': 'Torna ai giochi',
                'gameTitle': 'Forza 4',
                'gameSubtitle': 'Gioca contro un avversario IA',
                'playerScore': 'Il tuo punteggio',
                'aiScore': 'Punteggio IA',
                'draws': 'Pareggi',
                'difficulty': 'Difficoltà',
                'easy': 'Facile',
                'medium': 'Medio',
                'hard': 'Difficile',
                'yourTurn': 'Tuo turno — Pedine gialle',
                'aiTurn': 'L\'IA sta pensando...',
                'playerWins': '🎉 Hai vinto!',
                'aiWins': 'L\'IA ha vinto questo round',
                'gameDraw': 'Pareggio — la plancia è piena',
                'newGame': 'Nuova Partita',
                'resetStats': 'Resetta Statistiche',
                'confirmReset': 'Resettare tutte le statistiche? Questo non può essere annullato.'
            }
        }
    },
    'es': {
        'nav': {
            'games': 'Juegos'
        },
        'sections': {
            'games': 'Juegos y Diversión'
        },
        'games': {
            'forza4': {
                'title': 'Conecta Cuatro',
                'lead': 'Juega contra un oponente IA con profundidad estratégica.',
                'level': 'Dificultad media',
                'back': 'Volver a los juegos',
                'gameTitle': 'Conecta Cuatro',
                'gameSubtitle': 'Juega contra un oponente IA',
                'playerScore': 'Tu puntuación',
                'aiScore': 'Puntuación IA',
                'draws': 'Empates',
                'difficulty': 'Dificultad',
                'easy': 'Fácil',
                'medium': 'Medio',
                'hard': 'Difícil',
                'yourTurn': 'Tu turno — Fichas amarillas',
                'aiTurn': 'La IA está pensando...',
                'playerWins': '🎉 ¡Ganaste!',
                'aiWins': 'La IA ganó esta ronda',
                'gameDraw': 'Empate — tablero lleno',
                'newGame': 'Nuevo Juego',
                'resetStats': 'Reiniciar Estadísticas',
                'confirmReset': '¿Reiniciar todas las estadísticas? Esto no se puede deshacer.'
            }
        }
    },
    'fr': {
        'nav': {
            'games': 'Jeux'
        },
        'sections': {
            'games': 'Jeux et Amusement'
        },
        'games': {
            'forza4': {
                'title': 'Puissance 4',
                'lead': 'Jouez contre un adversaire IA avec profondeur stratégique.',
                'level': 'Difficulté moyenne',
                'back': 'Retour aux jeux',
                'gameTitle': 'Puissance 4',
                'gameSubtitle': 'Jouez contre un adversaire IA',
                'playerScore': 'Votre score',
                'aiScore': 'Score IA',
                'draws': 'Égalités',
                'difficulty': 'Difficulté',
                'easy': 'Facile',
                'medium': 'Moyen',
                'hard': 'Difficile',
                'yourTurn': 'Votre tour — Pions jaunes',
                'aiTurn': 'L\'IA réfléchit...',
                'playerWins': '🎉 Vous avez gagné !',
                'aiWins': 'L\'IA a remporté cette manche',
                'gameDraw': 'Égalité — plateau plein',
                'newGame': 'Nouveau Jeu',
                'resetStats': 'Réinitialiser les Stats',
                'confirmReset': 'Réinitialiser toutes les statistiques ? Cette action ne peut pas être annulée.'
            }
        }
    },
    'de': {
        'nav': {
            'games': 'Spiele'
        },
        'sections': {
            'games': 'Spiele und Spaß'
        },
        'games': {
            'forza4': {
                'title': 'Vier gewinnt',
                'lead': 'Spielen Sie gegen einen KI-Gegner mit strategischer Tiefe.',
                'level': 'Mittlerer Schwierigkeitsgrad',
                'back': 'Zurück zu den Spielen',
                'gameTitle': 'Vier gewinnt',
                'gameSubtitle': 'Spielen Sie gegen einen KI-Gegner',
                'playerScore': 'Ihre Punktzahl',
                'aiScore': 'KI-Punktzahl',
                'draws': 'Unentschieden',
                'difficulty': 'Schwierigkeit',
                'easy': 'Einfach',
                'medium': 'Mittel',
                'hard': 'Schwer',
                'yourTurn': 'Ihr Zug — Gelbe Steine',
                'aiTurn': 'Die KI überlegt...',
                'playerWins': '🎉 Du hast gewonnen!',
                'aiWins': 'Die KI hat diese Runde gewonnen',
                'gameDraw': 'Unentschieden — Brett ist voll',
                'newGame': 'Neues Spiel',
                'resetStats': 'Statistiken zurücksetzen',
                'confirmReset': 'Alle Statistiken zurücksetzen? Dies kann nicht rückgängig gemacht werden.'
            }
        }
    },
    'ru': {
        'nav': {
            'games': 'Игры'
        },
        'sections': {
            'games': 'Игры и Развлечения'
        },
        'games': {
            'forza4': {
                'title': 'Четыре в ряд',
                'lead': 'Играйте против противника ИИ с стратегической глубиной.',
                'level': 'Средняя сложность',
                'back': 'Вернуться к играм',
                'gameTitle': 'Четыре в ряд',
                'gameSubtitle': 'Играйте против противника ИИ',
                'playerScore': 'Ваш счет',
                'aiScore': 'Счет ИИ',
                'draws': 'Ничьи',
                'difficulty': 'Сложность',
                'easy': 'Легко',
                'medium': 'Средне',
                'hard': 'Сложно',
                'yourTurn': 'Ваш ход — Жёлтые фишки',
                'aiTurn': 'ИИ думает...',
                'playerWins': '🎉 Вы выиграли!',
                'aiWins': 'ИИ выиграл этот раунд',
                'gameDraw': 'Ничья — доска полна',
                'newGame': 'Новая игра',
                'resetStats': 'Сбросить статистику',
                'confirmReset': 'Сбросить всю статистику? Это нельзя отменить.'
            }
        }
    },
    'ja': {
        'nav': {
            'games': 'ゲーム'
        },
        'sections': {
            'games': 'ゲーム & 楽しみ'
        },
        'games': {
            'forza4': {
                'title': 'フォーインアロー',
                'lead': 'AIと戦略的な深さを持つゲームをプレイします。',
                'level': '中程度の難易度',
                'back': 'ゲームに戻る',
                'gameTitle': 'フォーインアロー',
                'gameSubtitle': 'AIオポーネントと対戦',
                'playerScore': 'あなたのスコア',
                'aiScore': 'AIスコア',
                'draws': '引き分け',
                'difficulty': '難易度',
                'easy': '簡単',
                'medium': '中級',
                'hard': '難しい',
                'yourTurn': 'あなたのターン — 黄色のピース',
                'aiTurn': 'AIが考え中...',
                'playerWins': '🎉 あなたが勝ちました!',
                'aiWins': 'AIがこのラウンドを獲得しました',
                'gameDraw': '引き分け — ボードがいっぱい',
                'newGame': '新しいゲーム',
                'resetStats': '統計をリセット',
                'confirmReset': 'すべての統計をリセットしてもよろしいですか? これは取り消せません。'
            }
        }
    },
    'zh': {
        'nav': {
            'games': '游戏'
        },
        'sections': {
            'games': '游戏和娱乐'
        },
        'games': {
            'forza4': {
                'title': '四子棋',
                'lead': '与具有战略深度的人工智能对手对战。',
                'level': '中等难度',
                'back': '返回游戏',
                'gameTitle': '四子棋',
                'gameSubtitle': '与AI对手对战',
                'playerScore': '你的分数',
                'aiScore': '人工智能分数',
                'draws': '平手',
                'difficulty': '难度',
                'easy': '简单',
                'medium': '中等',
                'hard': '困难',
                'yourTurn': '你的回合 — 黄色棋子',
                'aiTurn': '人工智能在思考...',
                'playerWins': '🎉 你赢了！',
                'aiWins': '人工智能赢了这一轮',
                'gameDraw': '平手 — 棋盘已满',
                'newGame': '新游戏',
                'resetStats': '重置统计',
                'confirmReset': '重置所有统计数据？这无法撤销。'
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
    print('\n✓ Tutte le traduzioni games aggiunte!')

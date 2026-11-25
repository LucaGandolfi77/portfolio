#!/usr/bin/env python3
import json
import os

languages = {
    'en': {
        'games': {
            'airhockey': {
                'title': 'Air Hockey',
                'lead': 'Fast-paced table game against AI.',
                'level': 'Quick reflexes',
                'back': 'Back to Games',
                'gameTitle': 'Air Hockey',
                'gameSubtitle': 'Hit the puck, score goals',
                'yourScore': 'Your Score',
                'aiScore': 'AI Score',
                'difficulty': 'Difficulty',
                'easy': 'Easy',
                'medium': 'Medium',
                'hard': 'Hard',
                'controlsHint': 'Move your paddle with Mouse or Touch | Your paddle is at the bottom',
                'movePlayground': 'Move your paddle to start',
                'playerScored': '🎉 Goal! You scored!',
                'aiScored': 'AI scored a goal!',
                'newGame': 'New Game'
            }
        }
    },
    'it': {
        'games': {
            'airhockey': {
                'title': 'Air Hockey',
                'lead': 'Gioco da tavolo veloce contro l\'IA.',
                'level': 'Riflessi veloci',
                'back': 'Torna ai giochi',
                'gameTitle': 'Air Hockey',
                'gameSubtitle': 'Colpisci il dischetto, segna i gol',
                'yourScore': 'Il tuo punteggio',
                'aiScore': 'Punteggio IA',
                'difficulty': 'Difficoltà',
                'easy': 'Facile',
                'medium': 'Medio',
                'hard': 'Difficile',
                'controlsHint': 'Muovi la tua paletta con il Mouse o il Touch | La tua paletta è in basso',
                'movePlayground': 'Muovi la tua paletta per iniziare',
                'playerScored': '🎉 Gol! Hai segnato!',
                'aiScored': 'L\'IA ha segnato un gol!',
                'newGame': 'Nuova Partita'
            }
        }
    },
    'es': {
        'games': {
            'airhockey': {
                'title': 'Air Hockey',
                'lead': 'Juego de mesa rápido contra IA.',
                'level': 'Reflejos rápidos',
                'back': 'Volver a los juegos',
                'gameTitle': 'Air Hockey',
                'gameSubtitle': 'Golpea el puck, marca goles',
                'yourScore': 'Tu puntuación',
                'aiScore': 'Puntuación IA',
                'difficulty': 'Dificultad',
                'easy': 'Fácil',
                'medium': 'Medio',
                'hard': 'Difícil',
                'controlsHint': 'Mueve tu pala con el Ratón o Toque | Tu pala está en la parte inferior',
                'movePlayground': 'Mueve tu pala para comenzar',
                'playerScored': '🎉 ¡Gol! ¡Marcaste!',
                'aiScored': '¡La IA marcó un gol!',
                'newGame': 'Nuevo Juego'
            }
        }
    },
    'fr': {
        'games': {
            'airhockey': {
                'title': 'Air Hockey',
                'lead': 'Jeu de table rapide contre l\'IA.',
                'level': 'Réflexes rapides',
                'back': 'Retour aux jeux',
                'gameTitle': 'Air Hockey',
                'gameSubtitle': 'Frappez le palet, marquezdes buts',
                'yourScore': 'Votre score',
                'aiScore': 'Score IA',
                'difficulty': 'Difficulté',
                'easy': 'Facile',
                'medium': 'Moyen',
                'hard': 'Difficile',
                'controlsHint': 'Déplacez votre raquette avec la Souris ou le Toucher | Votre raquette est en bas',
                'movePlayground': 'Déplacez votre raquette pour commencer',
                'playerScored': '🎉 But ! Vous avez marqué !',
                'aiScored': 'L\'IA a marqué un but !',
                'newGame': 'Nouveau Jeu'
            }
        }
    },
    'de': {
        'games': {
            'airhockey': {
                'title': 'Air Hockey',
                'lead': 'Schnelles Tischspiel gegen KI.',
                'level': 'Schnelle Reflexe',
                'back': 'Zurück zu den Spielen',
                'gameTitle': 'Air Hockey',
                'gameSubtitle': 'Treffen Sie den Puck, erzielen Sie Tore',
                'yourScore': 'Ihre Punktzahl',
                'aiScore': 'KI-Punktzahl',
                'difficulty': 'Schwierigkeit',
                'easy': 'Einfach',
                'medium': 'Mittel',
                'hard': 'Schwer',
                'controlsHint': 'Bewegen Sie Ihren Schläger mit der Maus oder durch Berührung | Ihr Schläger ist unten',
                'movePlayground': 'Bewegen Sie Ihren Schläger, um zu starten',
                'playerScored': '🎉 Tor! Sie haben erzielt!',
                'aiScored': 'Die KI hat ein Tor erzielt!',
                'newGame': 'Neues Spiel'
            }
        }
    },
    'ru': {
        'games': {
            'airhockey': {
                'title': 'Аэрохоккей',
                'lead': 'Быстрая настольная игра против ИИ.',
                'level': 'Быстрые рефлексы',
                'back': 'Вернуться к играм',
                'gameTitle': 'Аэрохоккей',
                'gameSubtitle': 'Ударьте по шайбе, забейте голы',
                'yourScore': 'Ваш счет',
                'aiScore': 'Счет ИИ',
                'difficulty': 'Сложность',
                'easy': 'Легко',
                'medium': 'Средне',
                'hard': 'Сложно',
                'controlsHint': 'Двигайте ракетку мышью или сенсорным экраном | Ваша ракетка внизу',
                'movePlayground': 'Двигайте ракетку, чтобы начать',
                'playerScored': '🎉 Гол! Вы забили!',
                'aiScored': 'ИИ забил гол!',
                'newGame': 'Новая игра'
            }
        }
    },
    'ja': {
        'games': {
            'airhockey': {
                'title': 'エアホッケー',
                'lead': 'AIと対戦する高速テーブルゲーム。',
                'level': '素早い反射神経',
                'back': 'ゲームに戻る',
                'gameTitle': 'エアホッケー',
                'gameSubtitle': 'パックを打ってゴールを決める',
                'yourScore': 'あなたのスコア',
                'aiScore': 'AIスコア',
                'difficulty': '難易度',
                'easy': '簡単',
                'medium': '中級',
                'hard': '難しい',
                'controlsHint': 'マウスまたはタッチでパドルを動かす | パドルは下部にあります',
                'movePlayground': 'パドルを動かして開始',
                'playerScored': '🎉 ゴール！得点しました！',
                'aiScored': 'AIがゴールを決めました！',
                'newGame': '新しいゲーム'
            }
        }
    },
    'zh': {
        'games': {
            'airhockey': {
                'title': '气垫冰球',
                'lead': '与 AI 对战的快节奏桌面游戏。',
                'level': '快速反应',
                'back': '返回游戏',
                'gameTitle': '气垫冰球',
                'gameSubtitle': '击打冰球，进球',
                'yourScore': '你的分数',
                'aiScore': '人工智能分数',
                'difficulty': '难度',
                'easy': '简单',
                'medium': '中等',
                'hard': '困难',
                'controlsHint': '用鼠标或触摸移动球拍 | 你的球拍在下方',
                'movePlayground': '移动你的球拍开始',
                'playerScored': '🎉 进球！ 你进球了！',
                'aiScored': '人工智能进球了！',
                'newGame': '新游戏'
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
            
            # Add/update games.airhockey section
            if 'games' not in data:
                data['games'] = {}
            
            if 'airhockey' in translations['games']:
                data['games']['airhockey'] = translations['games']['airhockey']
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f'✓ {lang_code}.json aggiornato con Air Hockey')
        except Exception as e:
            print(f'✗ Errore in {lang_code}.json: {e}')

if __name__ == '__main__':
    update_i18n_files()
    print('\n✓ Tutte le traduzioni Air Hockey aggiunte!')

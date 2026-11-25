#!/usr/bin/env python3
import json
import os

languages = {
    'en': {
        'games': {
            'snake': {
                'title': 'Snake',
                'lead': 'Classic arcade game with smooth controls.',
                'level': 'Easy to learn',
                'back': 'Back to Games',
                'gameTitle': 'Snake',
                'gameSubtitle': 'Eat food, avoid walls and yourself',
                'score': 'Score',
                'highScore': 'High Score',
                'length': 'Length',
                'speed': 'Speed',
                'slow': 'Slow',
                'normal': 'Normal',
                'fast': 'Fast',
                'insane': 'Insane',
                'controlsHint': '⬆️ ⬇️ ⬅️ ➡️ Arrow keys or WASD | Click or tap to play on mobile',
                'pressStart': 'Press START or press arrow keys to begin',
                'playing': 'Game running... Good luck!',
                'gameOver': '💀 Game Over! Press START to play again',
                'start': 'Start Game',
                'resetHighScore': 'Reset High Score',
                'confirmReset': 'Reset high score? This cannot be undone.'
            }
        }
    },
    'it': {
        'games': {
            'snake': {
                'title': 'Snake',
                'lead': 'Gioco arcade classico con controlli fluidi.',
                'level': 'Facile da imparare',
                'back': 'Torna ai giochi',
                'gameTitle': 'Snake',
                'gameSubtitle': 'Mangia il cibo, evita i muri e te stesso',
                'score': 'Punteggio',
                'highScore': 'Punteggio Massimo',
                'length': 'Lunghezza',
                'speed': 'Velocità',
                'slow': 'Lento',
                'normal': 'Normale',
                'fast': 'Veloce',
                'insane': 'Folle',
                'controlsHint': '⬆️ ⬇️ ⬅️ ➡️ Frecce o WASD | Clicca o tocca per giocare su mobile',
                'pressStart': 'Premi START o le frecce per iniziare',
                'playing': 'Partita in corso... Buona fortuna!',
                'gameOver': '💀 Game Over! Premi START per giocare di nuovo',
                'start': 'Inizia Partita',
                'resetHighScore': 'Resetta Punteggio Massimo',
                'confirmReset': 'Resettare il punteggio massimo? Non può essere annullato.'
            }
        }
    },
    'es': {
        'games': {
            'snake': {
                'title': 'Snake',
                'lead': 'Juego arcade clásico con controles suaves.',
                'level': 'Fácil de aprender',
                'back': 'Volver a los juegos',
                'gameTitle': 'Snake',
                'gameSubtitle': 'Come comida, evita paredes y a ti mismo',
                'score': 'Puntuación',
                'highScore': 'Puntuación Máxima',
                'length': 'Longitud',
                'speed': 'Velocidad',
                'slow': 'Lento',
                'normal': 'Normal',
                'fast': 'Rápido',
                'insane': 'Insano',
                'controlsHint': '⬆️ ⬇️ ⬅️ ➡️ Flechas o WASD | Haz clic o toca para jugar en móvil',
                'pressStart': 'Presiona INICIO o las flechas para comenzar',
                'playing': 'Juego en curso... ¡Buena suerte!',
                'gameOver': '💀 ¡Fin del Juego! Presiona INICIO para jugar de nuevo',
                'start': 'Iniciar Juego',
                'resetHighScore': 'Reiniciar Puntuación Máxima',
                'confirmReset': '¿Reiniciar la puntuación máxima? Esto no se puede deshacer.'
            }
        }
    },
    'fr': {
        'games': {
            'snake': {
                'title': 'Snake',
                'lead': 'Jeu arcade classique avec contrôles fluides.',
                'level': 'Facile à apprendre',
                'back': 'Retour aux jeux',
                'gameTitle': 'Snake',
                'gameSubtitle': 'Mangez de la nourriture, évitez les murs et vous-même',
                'score': 'Score',
                'highScore': 'Score Maximal',
                'length': 'Longueur',
                'speed': 'Vitesse',
                'slow': 'Lent',
                'normal': 'Normal',
                'fast': 'Rapide',
                'insane': 'Fou',
                'controlsHint': '⬆️ ⬇️ ⬅️ ➡️ Flèches ou WASD | Cliquez ou touchez pour jouer sur mobile',
                'pressStart': 'Appuyez sur DÉMARRER ou les flèches pour commencer',
                'playing': 'Jeu en cours... Bonne chance !',
                'gameOver': '💀 Fin de partie ! Appuyez sur DÉMARRER pour rejouer',
                'start': 'Démarrer Jeu',
                'resetHighScore': 'Réinitialiser Score Maximal',
                'confirmReset': 'Réinitialiser le score maximal ? Cela ne peut pas être annulé.'
            }
        }
    },
    'de': {
        'games': {
            'snake': {
                'title': 'Snake',
                'lead': 'Klassisches Arcade-Spiel mit reibungslosen Kontrollen.',
                'level': 'Leicht zu erlernen',
                'back': 'Zurück zu den Spielen',
                'gameTitle': 'Snake',
                'gameSubtitle': 'Essen Sie Futter, vermeiden Sie Wände und sich selbst',
                'score': 'Punktzahl',
                'highScore': 'Höchste Punktzahl',
                'length': 'Länge',
                'speed': 'Geschwindigkeit',
                'slow': 'Langsam',
                'normal': 'Normal',
                'fast': 'Schnell',
                'insane': 'Verrückt',
                'controlsHint': '⬆️ ⬇️ ⬅️ ➡️ Pfeiltasten oder WASD | Klicken oder berühren zum Spielen auf Mobilgeräten',
                'pressStart': 'Drücken Sie START oder die Pfeiltasten zum Starten',
                'playing': 'Spiel läuft... Viel Erfolg!',
                'gameOver': '💀 Spielende! Drücken Sie START, um erneut zu spielen',
                'start': 'Spiel Starten',
                'resetHighScore': 'Höchste Punktzahl Zurücksetzen',
                'confirmReset': 'Höchste Punktzahl zurücksetzen? Dies kann nicht rückgängig gemacht werden.'
            }
        }
    },
    'ru': {
        'games': {
            'snake': {
                'title': 'Змейка',
                'lead': 'Классическая аркадная игра с плавным управлением.',
                'level': 'Легко освоить',
                'back': 'Вернуться к играм',
                'gameTitle': 'Змейка',
                'gameSubtitle': 'Ешьте еду, избегайте стен и себя',
                'score': 'Счет',
                'highScore': 'Лучший результат',
                'length': 'Длина',
                'speed': 'Скорость',
                'slow': 'Медленно',
                'normal': 'Нормально',
                'fast': 'Быстро',
                'insane': 'Безумно',
                'controlsHint': '⬆️ ⬇️ ⬅️ ➡️ Стрелки или WASD | Нажимайте или касайтесь для игры на мобильном',
                'pressStart': 'Нажмите НАЧАТЬ или стрелки для начала',
                'playing': 'Игра идет... Удачи!',
                'gameOver': '💀 Конец игры! Нажмите НАЧАТЬ, чтобы играть снова',
                'start': 'Начать игру',
                'resetHighScore': 'Сбросить лучший результат',
                'confirmReset': 'Сбросить лучший результат? Это невозможно будет отменить.'
            }
        }
    },
    'ja': {
        'games': {
            'snake': {
                'title': 'スネーク',
                'lead': 'スムーズなコントロールを備えたクラシックアーケードゲーム。',
                'level': '習得が簡単',
                'back': 'ゲームに戻る',
                'gameTitle': 'スネーク',
                'gameSubtitle': '食べ物を食べ、壁と自分を避ける',
                'score': 'スコア',
                'highScore': 'ハイスコア',
                'length': '長さ',
                'speed': 'スピード',
                'slow': '低速',
                'normal': '通常',
                'fast': '高速',
                'insane': 'クレイジー',
                'controlsHint': '⬆️ ⬇️ ⬅️ ➡️ 矢印キーまたはWASD | モバイルで遊ぶにはクリックまたはタップ',
                'pressStart': 'STARTまたは矢印キーを押して開始',
                'playing': 'ゲーム進行中... 頑張ってください！',
                'gameOver': '💀 ゲーム終了！ もう一度遊ぶにはSTARTを押してください',
                'start': 'ゲーム開始',
                'resetHighScore': 'ハイスコアをリセット',
                'confirmReset': 'ハイスコアをリセットしてもよろしいですか？ これは取り消せません。'
            }
        }
    },
    'zh': {
        'games': {
            'snake': {
                'title': '蛇',
                'lead': '具有流畅控制的经典街机游戏。',
                'level': '易于学习',
                'back': '返回游戏',
                'gameTitle': '蛇',
                'gameSubtitle': '吃食物，避开墙壁和自己',
                'score': '分数',
                'highScore': '最高分',
                'length': '长度',
                'speed': '速度',
                'slow': '缓慢',
                'normal': '正常',
                'fast': '快速',
                'insane': '疯狂',
                'controlsHint': '⬆️ ⬇️ ⬅️ ➡️ 箭头键或 WASD | 在手机上点击或轻按',
                'pressStart': '按开始或箭头键开始',
                'playing': '游戏进行中... 祝你好运！',
                'gameOver': '💀 游戏结束！ 按开始再次玩',
                'start': '开始游戏',
                'resetHighScore': '重置最高分',
                'confirmReset': '重置最高分？ 这无法撤销。'
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
            
            # Add/update games.snake section
            if 'games' not in data:
                data['games'] = {}
            
            if 'snake' in translations['games']:
                data['games']['snake'] = translations['games']['snake']
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f'✓ {lang_code}.json aggiornato con Snake')
        except Exception as e:
            print(f'✗ Errore in {lang_code}.json: {e}')

if __name__ == '__main__':
    update_i18n_files()
    print('\n✓ Tutte le traduzioni Snake aggiunte!')

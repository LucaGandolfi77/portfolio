import json
import os

# Translations for Pinball
translations = {
    "en": {
        "games": {
            "pinball": {
                "title": "Space Cadet Pinball",
                "lead": "Classic pinball action. Launch and score!",
                "level": "Arcade Classic",
                "description": "Mission: Launch the ball and score points!",
                "score": "Score",
                "balls": "Balls",
                "start": "START MISSION",
                "gameOver": "GAME OVER",
                "finalScore": "Final Score",
                "playAgain": "PLAY AGAIN",
                "controls": "Controls: Left/Right Arrows for Flippers, Space/Enter to Launch"
            }
        }
    },
    "it": {
        "games": {
            "pinball": {
                "title": "Space Cadet Pinball",
                "lead": "Classica azione flipper. Lancia e segna!",
                "level": "Arcade Classico",
                "description": "Missione: Lancia la pallina e fai punti!",
                "score": "Punteggio",
                "balls": "Palline",
                "start": "INIZIA MISSIONE",
                "gameOver": "GAME OVER",
                "finalScore": "Punteggio Finale",
                "playAgain": "GIOCA ANCORA",
                "controls": "Comandi: Frecce Sinistra/Destra per Flipper, Spazio/Invio per Lanciare"
            }
        }
    },
    "es": {
        "games": {
            "pinball": {
                "title": "Space Cadet Pinball",
                "lead": "Acción clásica de pinball. ¡Lanza y anota!",
                "level": "Arcade Clásico",
                "description": "Misión: ¡Lanza la bola y gana puntos!",
                "score": "Puntuación",
                "balls": "Bolas",
                "start": "INICIAR MISIÓN",
                "gameOver": "FIN DEL JUEGO",
                "finalScore": "Puntuación Final",
                "playAgain": "JUGAR DE NUEVO",
                "controls": "Controles: Flechas Izquierda/Derecha para Flippers, Espacio/Enter para Lanzar"
            }
        }
    },
    "fr": {
        "games": {
            "pinball": {
                "title": "Space Cadet Pinball",
                "lead": "Action de flipper classique. Lancez et marquez !",
                "level": "Arcade Classique",
                "description": "Mission : Lancez la balle et marquez des points !",
                "score": "Score",
                "balls": "Balles",
                "start": "LANCER MISSION",
                "gameOver": "GAME OVER",
                "finalScore": "Score Final",
                "playAgain": "REJOUER",
                "controls": "Contrôles : Flèches Gauche/Droite pour Flippers, Espace/Entrée pour Lancer"
            }
        }
    },
    "de": {
        "games": {
            "pinball": {
                "title": "Space Cadet Pinball",
                "lead": "Klassische Flipper-Action. Starten und punkten!",
                "level": "Arcade Klassiker",
                "description": "Mission: Starte den Ball und erziele Punkte!",
                "score": "Punktzahl",
                "balls": "Bälle",
                "start": "MISSION STARTEN",
                "gameOver": "SPIEL VORBEI",
                "finalScore": "Endpunktzahl",
                "playAgain": "NOCHMAL SPIELEN",
                "controls": "Steuerung: Links/Rechts Pfeile für Flipper, Leertaste/Enter zum Starten"
            }
        }
    },
    "ru": {
        "games": {
            "pinball": {
                "title": "Space Cadet Pinball",
                "lead": "Классический пинбол. Запускай и забивай!",
                "level": "Аркадная Классика",
                "description": "Миссия: Запустите шар и наберите очки!",
                "score": "Счет",
                "balls": "Шары",
                "start": "НАЧАТЬ МИССИЮ",
                "gameOver": "ИГРА ОКОНЧЕНА",
                "finalScore": "Итоговый счет",
                "playAgain": "ИГРАТЬ СНОВА",
                "controls": "Управление: Стрелки Влево/Вправо для флипперов, Пробел/Enter для запуска"
            }
        }
    },
    "ja": {
        "games": {
            "pinball": {
                "title": "スペースカデットピンボール",
                "lead": "クラシックなピンボールアクション。発射して得点しよう！",
                "level": "アーケードクラシック",
                "description": "ミッション：ボールを発射してポイントを獲得せよ！",
                "score": "スコア",
                "balls": "ボール",
                "start": "ミッション開始",
                "gameOver": "ゲームオーバー",
                "finalScore": "最終スコア",
                "playAgain": "もう一度プレイ",
                "controls": "操作：左右矢印キーでフリッパー、スペース/エンターで発射"
            }
        }
    },
    "zh": {
        "games": {
            "pinball": {
                "title": "太空军校生弹球",
                "lead": "经典弹球动作。发射并得分！",
                "level": "街机经典",
                "description": "任务：发射球并得分！",
                "score": "分数",
                "balls": "球数",
                "start": "开始任务",
                "gameOver": "游戏结束",
                "finalScore": "最终分数",
                "playAgain": "再玩一次",
                "controls": "控制：左右方向键控制挡板，空格/回车发射"
            }
        }
    },
    "ar": {
        "games": {
            "pinball": {
                "title": "بينبول الفضاء",
                "lead": "لعبة البينبول الكلاسيكية. أطلق وسجل!",
                "level": "أركيد كلاسيك",
                "description": "المهمة: أطلق الكرة وسجل النقاط!",
                "score": "النتيجة",
                "balls": "الكرات",
                "start": "ابدأ المهمة",
                "gameOver": "انتهت اللعبة",
                "finalScore": "النتيجة النهائية",
                "playAgain": "العب مرة أخرى",
                "controls": "التحكم: الأسهم لليسار/اليمين للزعانف، المسافة/إدخال للإطلاق"
            }
        }
    }
}

def update_translations():
    base_path = 'i18n'
    
    for lang, content in translations.items():
        file_path = os.path.join(base_path, f'{lang}.json')
        
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Ensure 'games' key exists
                if 'games' not in data:
                    data['games'] = {}
                
                # Update with Pinball translations
                data['games']['pinball'] = content['games']['pinball']
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                
                print(f"✓ {lang}.json updated with Pinball translations")
                
            except json.JSONDecodeError:
                print(f"⚠ {lang}.json has JSON errors (skipping)")
            except Exception as e:
                print(f"✗ Error updating {lang}.json: {e}")
        else:
            print(f"⚠ {lang}.json not found")

if __name__ == "__main__":
    update_translations()

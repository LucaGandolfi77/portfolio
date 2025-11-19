import json
import os

# Translations for Tetris
translations = {
    "en": {
        "games": {
            "tetris": {
                "title": "Tetris",
                "lead": "Classic block stacking puzzle.",
                "level": "Puzzle Logic",
                "description": "Stack the blocks!",
                "score": "Score",
                "lines": "Lines",
                "next": "Next",
                "start": "START GAME",
                "gameOver": "GAME OVER",
                "finalScore": "Final Score",
                "playAgain": "PLAY AGAIN",
                "controls": "Controls: Arrows to Move/Rotate, Down to Drop"
            }
        }
    },
    "it": {
        "games": {
            "tetris": {
                "title": "Tetris",
                "lead": "Classico puzzle a blocchi.",
                "level": "Logica Puzzle",
                "description": "Impila i blocchi!",
                "score": "Punteggio",
                "lines": "Linee",
                "next": "Prossimo",
                "start": "INIZIA GIOCO",
                "gameOver": "GAME OVER",
                "finalScore": "Punteggio Finale",
                "playAgain": "GIOCA ANCORA",
                "controls": "Comandi: Frecce per Muovere/Ruotare, Giù per Cadere"
            }
        }
    },
    "es": {
        "games": {
            "tetris": {
                "title": "Tetris",
                "lead": "Clásico rompecabezas de bloques.",
                "level": "Lógica Puzzle",
                "description": "¡Apila los bloques!",
                "score": "Puntuación",
                "lines": "Líneas",
                "next": "Siguiente",
                "start": "EMPEZAR JUEGO",
                "gameOver": "FIN DEL JUEGO",
                "finalScore": "Puntuación Final",
                "playAgain": "JUGAR DE NUEVO",
                "controls": "Controles: Flechas para Mover/Rotar, Abajo para Caer"
            }
        }
    },
    "fr": {
        "games": {
            "tetris": {
                "title": "Tetris",
                "lead": "Puzzle classique d'empilement de blocs.",
                "level": "Logique Puzzle",
                "description": "Empilez les blocs !",
                "score": "Score",
                "lines": "Lignes",
                "next": "Suivant",
                "start": "COMMENCER",
                "gameOver": "GAME OVER",
                "finalScore": "Score Final",
                "playAgain": "REJOUER",
                "controls": "Contrôles : Flèches pour Bouger/Pivoter, Bas pour Descendre"
            }
        }
    },
    "de": {
        "games": {
            "tetris": {
                "title": "Tetris",
                "lead": "Klassisches Blockstapel-Puzzle.",
                "level": "Puzzle Logik",
                "description": "Staple die Blöcke!",
                "score": "Punktzahl",
                "lines": "Linien",
                "next": "Nächster",
                "start": "STARTEN",
                "gameOver": "SPIEL VORBEI",
                "finalScore": "Endpunktzahl",
                "playAgain": "NOCHMAL SPIELEN",
                "controls": "Steuerung: Pfeile zum Bewegen/Drehen, Runter zum Fallenlassen"
            }
        }
    },
    "ru": {
        "games": {
            "tetris": {
                "title": "Тетрис",
                "lead": "Классическая головоломка с блоками.",
                "level": "Логика Пазл",
                "description": "Складывайте блоки!",
                "score": "Счет",
                "lines": "Линии",
                "next": "След.",
                "start": "НАЧАТЬ ИГРУ",
                "gameOver": "ИГРА ОКОНЧЕНА",
                "finalScore": "Итоговый счет",
                "playAgain": "ИГРАТЬ СНОВА",
                "controls": "Управление: Стрелки для движения/поворота, Вниз для сброса"
            }
        }
    },
    "ja": {
        "games": {
            "tetris": {
                "title": "テトリス",
                "lead": "古典的なブロック積みパズル。",
                "level": "パズルロジック",
                "description": "ブロックを積み上げろ！",
                "score": "スコア",
                "lines": "ライン",
                "next": "次",
                "start": "ゲーム開始",
                "gameOver": "ゲームオーバー",
                "finalScore": "最終スコア",
                "playAgain": "もう一度プレイ",
                "controls": "操作: 矢印キーで移動/回転、下で落下"
            }
        }
    },
    "zh": {
        "games": {
            "tetris": {
                "title": "俄罗斯方块",
                "lead": "经典的方块堆叠益智游戏。",
                "level": "益智逻辑",
                "description": "堆叠方块！",
                "score": "分数",
                "lines": "行数",
                "next": "下一个",
                "start": "开始游戏",
                "gameOver": "游戏结束",
                "finalScore": "最终分数",
                "playAgain": "再玩一次",
                "controls": "控制：方向键移动/旋转，向下掉落"
            }
        }
    },
    "ar": {
        "games": {
            "tetris": {
                "title": "تتريس",
                "lead": "لغز تكديس الكتل الكلاسيكي.",
                "level": "لغز منطقي",
                "description": "كدس الكتل!",
                "score": "النتيجة",
                "lines": "الخطوط",
                "next": "التالي",
                "start": "ابدأ اللعبة",
                "gameOver": "انتهت اللعبة",
                "finalScore": "النتيجة النهائية",
                "playAgain": "العب مرة أخرى",
                "controls": "التحكم: الأسهم للتحرك/التدوير، لأسفل للإسقاط"
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
                
                # Update with Tetris translations
                data['games']['tetris'] = content['games']['tetris']
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                
                print(f"✓ {lang}.json updated with Tetris translations")
                
            except json.JSONDecodeError:
                print(f"⚠ {lang}.json has JSON errors (skipping)")
            except Exception as e:
                print(f"✗ Error updating {lang}.json: {e}")
        else:
            print(f"⚠ {lang}.json not found")

if __name__ == "__main__":
    update_translations()

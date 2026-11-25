import json
import os

# Translations for Space Invaders
translations = {
    "en": {
        "games": {
            "space_invaders": {
                "title": "Space Invaders",
                "lead": "Defend Earth from alien invasion.",
                "level": "Retro Arcade",
                "description": "Defend Earth from the alien invasion!",
                "score": "Score",
                "lives": "Lives",
                "start": "START GAME",
                "gameOver": "GAME OVER",
                "finalScore": "Final Score",
                "playAgain": "PLAY AGAIN",
                "controls": "Controls: Arrow Keys to Move, SPACE to Shoot"
            }
        }
    },
    "it": {
        "games": {
            "space_invaders": {
                "title": "Space Invaders",
                "lead": "Difendi la Terra dall'invasione aliena.",
                "level": "Arcade Retro",
                "description": "Difendi la Terra dall'invasione aliena!",
                "score": "Punteggio",
                "lives": "Vite",
                "start": "INIZIA GIOCO",
                "gameOver": "GAME OVER",
                "finalScore": "Punteggio Finale",
                "playAgain": "GIOCA ANCORA",
                "controls": "Comandi: Frecce per Muovere, SPAZIO per Sparare"
            }
        }
    },
    "es": {
        "games": {
            "space_invaders": {
                "title": "Space Invaders",
                "lead": "Defiende la Tierra de la invasión alienígena.",
                "level": "Arcade Retro",
                "description": "¡Defiende la Tierra de la invasión alienígena!",
                "score": "Puntuación",
                "lives": "Vidas",
                "start": "EMPEZAR JUEGO",
                "gameOver": "FIN DEL JUEGO",
                "finalScore": "Puntuación Final",
                "playAgain": "JUGAR DE NUEVO",
                "controls": "Controles: Flechas para Mover, ESPACIO para Disparar"
            }
        }
    },
    "fr": {
        "games": {
            "space_invaders": {
                "title": "Space Invaders",
                "lead": "Défendez la Terre contre l'invasion extraterrestre.",
                "level": "Arcade Rétro",
                "description": "Défendez la Terre contre l'invasion extraterrestre !",
                "score": "Score",
                "lives": "Vies",
                "start": "COMMENCER",
                "gameOver": "GAME OVER",
                "finalScore": "Score Final",
                "playAgain": "REJOUER",
                "controls": "Contrôles : Flèches pour Bouger, ESPACE pour Tirer"
            }
        }
    },
    "de": {
        "games": {
            "space_invaders": {
                "title": "Space Invaders",
                "lead": "Verteidige die Erde vor der Alien-Invasion.",
                "level": "Retro Arcade",
                "description": "Verteidige die Erde vor der Alien-Invasion!",
                "score": "Punktzahl",
                "lives": "Leben",
                "start": "STARTEN",
                "gameOver": "SPIEL VORBEI",
                "finalScore": "Endpunktzahl",
                "playAgain": "NOCHMAL SPIELEN",
                "controls": "Steuerung: Pfeiltasten zum Bewegen, LEERTASTE zum Schießen"
            }
        }
    },
    "ru": {
        "games": {
            "space_invaders": {
                "title": "Space Invaders",
                "lead": "Защитите Землю от вторжения пришельцев.",
                "level": "Ретро Аркада",
                "description": "Защитите Землю от вторжения пришельцев!",
                "score": "Счет",
                "lives": "Жизни",
                "start": "НАЧАТЬ ИГРУ",
                "gameOver": "ИГРА ОКОНЧЕНА",
                "finalScore": "Итоговый счет",
                "playAgain": "ИГРАТЬ СНОВА",
                "controls": "Управление: Стрелки для движения, ПРОБЕЛ для стрельбы"
            }
        }
    },
    "ja": {
        "games": {
            "space_invaders": {
                "title": "スペースインベーダー",
                "lead": "エイリアンの侵略から地球を守れ。",
                "level": "レトロアーケード",
                "description": "エイリアンの侵略から地球を守れ！",
                "score": "スコア",
                "lives": "ライフ",
                "start": "ゲーム開始",
                "gameOver": "ゲームオーバー",
                "finalScore": "最終スコア",
                "playAgain": "もう一度プレイ",
                "controls": "操作: 矢印キーで移動、スペースキーで発射"
            }
        }
    },
    "zh": {
        "games": {
            "space_invaders": {
                "title": "太空侵略者",
                "lead": "保卫地球免受外星人入侵。",
                "level": "复古街机",
                "description": "保卫地球免受外星人入侵！",
                "score": "分数",
                "lives": "生命",
                "start": "开始游戏",
                "gameOver": "游戏结束",
                "finalScore": "最终分数",
                "playAgain": "再玩一次",
                "controls": "控制：方向键移动，空格键射击"
            }
        }
    },
    "ar": {
        "games": {
            "space_invaders": {
                "title": "غزاة الفضاء",
                "lead": "دافع عن الأرض من الغزو الفضائي.",
                "level": "أركيد ريترو",
                "description": "دافع عن الأرض من الغزو الفضائي!",
                "score": "النتيجة",
                "lives": "الأرواح",
                "start": "ابدأ اللعبة",
                "gameOver": "انتهت اللعبة",
                "finalScore": "النتيجة النهائية",
                "playAgain": "العب مرة أخرى",
                "controls": "التحكم: مفاتيح الأسهم للتحرك، المسافة لإطلاق النار"
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
                
                # Update with Space Invaders translations
                data['games']['space_invaders'] = content['games']['space_invaders']
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                
                print(f"✓ {lang}.json updated with Space Invaders translations")
                
            except json.JSONDecodeError:
                print(f"⚠ {lang}.json has JSON errors (skipping)")
            except Exception as e:
                print(f"✗ Error updating {lang}.json: {e}")
        else:
            print(f"⚠ {lang}.json not found")

if __name__ == "__main__":
    update_translations()

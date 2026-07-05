import json
import os

# Translations for Clash Royale Clone
translations = {
    "en": {
        "games": {
            "clash_royale": {
                "title": "Royale Battle",
                "lead": "Deploy troops and destroy enemy towers!",
                "level": "Strategy",
                "description": "A real-time strategy game. Manage your elixir, deploy troops, and destroy the enemy King's tower!",
                "controls": "Tap/Click to deploy troops"
            }
        }
    },
    "it": {
        "games": {
            "clash_royale": {
                "title": "Royale Battle",
                "lead": "Schiera le truppe e distruggi le torri nemiche!",
                "level": "Strategia",
                "description": "Un gioco di strategia in tempo reale. Gestisci il tuo elisir, schiera le truppe e distruggi la torre del Re nemico!",
                "controls": "Tocca/Clicca per schierare le truppe"
            }
        }
    },
    "es": {
        "games": {
            "clash_royale": {
                "title": "Royale Battle",
                "lead": "¡Despliega tropas y destruye las torres enemigas!",
                "level": "Estrategia",
                "description": "Un juego de estrategia en tiempo real. ¡Gestiona tu elixir, despliega tropas y destruye la torre del Rey enemigo!",
                "controls": "Toca/Haz clic para desplegar tropas"
            }
        }
    },
    "fr": {
        "games": {
            "clash_royale": {
                "title": "Royale Battle",
                "lead": "Déployez des troupes et détruisez les tours ennemies !",
                "level": "Stratégie",
                "description": "Un jeu de stratégie en temps réel. Gérez votre élixir, déployez des troupes et détruisez la tour du Roi ennemi !",
                "controls": "Tapez/Cliquez pour déployer des troupes"
            }
        }
    },
    "de": {
        "games": {
            "clash_royale": {
                "title": "Royale Battle",
                "lead": "Setze Truppen ein und zerstöre feindliche Türme!",
                "level": "Strategie",
                "description": "Ein Echtzeit-Strategiespiel. Verwalte dein Elixier, setze Truppen ein und zerstöre den Turm des feindlichen Königs!",
                "controls": "Tippen/Klicken zum Einsetzen von Truppen"
            }
        }
    },
    "ru": {
        "games": {
            "clash_royale": {
                "title": "Royale Battle",
                "lead": "Размещайте войска и уничтожайте вражеские башни!",
                "level": "Стратегия",
                "description": "Стратегия в реальном времени. Управляйте эликсиром, размещайте войска и уничтожьте башню вражеского короля!",
                "controls": "Нажмите/Кликните для размещения войск"
            }
        }
    },
    "ja": {
        "games": {
            "clash_royale": {
                "title": "ロイヤルバトル",
                "lead": "部隊を配置して敵のタワーを破壊せよ！",
                "level": "戦略",
                "description": "リアルタイム戦略ゲーム。エリクサーを管理し、部隊を配置して敵のキングタワーを破壊しよう！",
                "controls": "タップ/クリックで部隊を配置"
            }
        }
    },
    "zh": {
        "games": {
            "clash_royale": {
                "title": "皇家对战",
                "lead": "部署军队并摧毁敌方塔楼！",
                "level": "策略",
                "description": "一款即时战略游戏。管理你的圣水，部署军队，摧毁敌方国王塔！",
                "controls": "点击部署军队"
            }
        }
    },
    "ar": {
        "games": {
            "clash_royale": {
                "title": "معركة رويال",
                "lead": "انشر القوات ودمر أبراج العدو!",
                "level": "استراتيجية",
                "description": "لعبة استراتيجية في الوقت الحقيقي. أدر إكسيرك، وانشر القوات، ودمر برج الملك العدو!",
                "controls": "اضغط/انقر لنشر القوات"
            }
        }
    },
    "he": {
        "games": {
            "clash_royale": {
                "title": "קרב רויאל",
                "lead": "פרוס כוחות והשמד את מגדלי האויב!",
                "level": "אסטרטגיה",
                "description": "משחק אסטרטגיה בזמן אמת. נהל את האליקסיר שלך, פרוס כוחות והשמד את מגדל המלך של האויב!",
                "controls": "הקש/לחץ כדי לפרוס כוחות"
            }
        }
    },
    "sv": {
        "games": {
            "clash_royale": {
                "title": "Royale Battle",
                "lead": "Placera ut trupper och förstör fiendens torn!",
                "level": "Strategi",
                "description": "Ett realtidsstrategispel. Hantera ditt elixir, placera ut trupper och förstör fiendens kungtorn!",
                "controls": "Tryck/Klicka för att placera ut trupper"
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
                
                # Update with Clash Royale translations
                data['games']['clash_royale'] = content['games']['clash_royale']
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                
                print(f"✓ {lang}.json updated with Clash Royale translations")
                
            except json.JSONDecodeError:
                print(f"⚠ {lang}.json has JSON errors (skipping)")
            except Exception as e:
                print(f"✗ Error updating {lang}.json: {e}")
        else:
            print(f"⚠ {lang}.json not found")

if __name__ == "__main__":
    update_translations()

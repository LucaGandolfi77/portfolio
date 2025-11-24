import json
import os

# Translations for Pokedex
translations = {
    "en": {
        "games": {
            "pokedex": {
                "title": "Pokédex",
                "lead": "Gotta Catch 'Em All!",
                "level": "Database",
                "description": "A complete encyclopedia of Pokémon species with stats, types, and details.",
                "controls": "Search or Scroll"
            }
        }
    },
    "it": {
        "games": {
            "pokedex": {
                "title": "Pokédex",
                "lead": "Acchiappali tutti!",
                "level": "Database",
                "description": "Un'enciclopedia completa delle specie Pokémon con statistiche, tipi e dettagli.",
                "controls": "Cerca o Scorri"
            }
        }
    },
    "es": {
        "games": {
            "pokedex": {
                "title": "Pokédex",
                "lead": "¡Hazte con todos!",
                "level": "Base de datos",
                "description": "Una enciclopedia completa de especies Pokémon con estadísticas, tipos y detalles.",
                "controls": "Buscar o Desplazarse"
            }
        }
    },
    "fr": {
        "games": {
            "pokedex": {
                "title": "Pokédex",
                "lead": "Attrapez-les tous !",
                "level": "Base de données",
                "description": "Une encyclopédie complète des espèces Pokémon avec statistiques, types et détails.",
                "controls": "Rechercher ou Faire défiler"
            }
        }
    },
    "de": {
        "games": {
            "pokedex": {
                "title": "Pokédex",
                "lead": "Schnapp sie dir alle!",
                "level": "Datenbank",
                "description": "Eine vollständige Enzyklopädie der Pokémon-Arten mit Statistiken, Typen und Details.",
                "controls": "Suchen oder Scrollen"
            }
        }
    },
    "ru": {
        "games": {
            "pokedex": {
                "title": "Покедекс",
                "lead": "Собери их всех!",
                "level": "База данных",
                "description": "Полная энциклопедия видов покемонов со статистикой, типами и деталями.",
                "controls": "Поиск или Прокрутка"
            }
        }
    },
    "ja": {
        "games": {
            "pokedex": {
                "title": "ポケモン図鑑",
                "lead": "ポケモンゲットだぜ！",
                "level": "データベース",
                "description": "ステータス、タイプ、詳細を含むポケモン種の完全な百科事典。",
                "controls": "検索またはスクロール"
            }
        }
    },
    "zh": {
        "games": {
            "pokedex": {
                "title": "宝可梦图鉴",
                "lead": "去吧！皮卡丘！",
                "level": "数据库",
                "description": "包含统计数据、属性和详细信息的宝可梦完整百科全书。",
                "controls": "搜索或滚动"
            }
        }
    },
    "ar": {
        "games": {
            "pokedex": {
                "title": "بوكيدكس",
                "lead": "عليك أن تمسك بهم جميعاً!",
                "level": "قاعدة بيانات",
                "description": "موسوعة كاملة لأنواع البوكيمون مع الإحصائيات والأنواع والتفاصيل.",
                "controls": "بحث أو تمرير"
            }
        }
    },
    "he": {
        "games": {
            "pokedex": {
                "title": "פוקידקס",
                "lead": "נתפוס את כולם!",
                "level": "מסד נתונים",
                "description": "אנציקלופדיה מלאה של מיני פוקימון עם סטטיסטיקות, סוגים ופרטים.",
                "controls": "חפש או גלול"
            }
        }
    },
    "sv": {
        "games": {
            "pokedex": {
                "title": "Pokédex",
                "lead": "Måste fånga fler!",
                "level": "Databas",
                "description": "En komplett uppslagsverk över Pokémon-arter med statistik, typer och detaljer.",
                "controls": "Sök eller Bläddra"
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
                
                # Update with Pokedex translations
                data['games']['pokedex'] = content['games']['pokedex']
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                
                print(f"✓ {lang}.json updated with Pokedex translations")
                
            except json.JSONDecodeError:
                print(f"⚠ {lang}.json has JSON errors (skipping)")
            except Exception as e:
                print(f"✗ Error updating {lang}.json: {e}")
        else:
            print(f"⚠ {lang}.json not found")

if __name__ == "__main__":
    update_translations()

import json
import os

# Configurazione
I18N_DIR = "i18n"
LANGUAGES = ["en", "it", "fr", "es", "de", "ja", "zh", "ru", "ar", "he", "sv"]

# Nuove traduzioni per Quantum Tic-Tac-Toe
NEW_TRANSLATIONS = {
    "games.quantum.title": {
        "en": "Quantum Tic-Tac-Toe",
        "it": "Tris Quantistico",
        "fr": "Morpion Quantique",
        "es": "Tres en Raya Cuántico",
        "de": "Quanten-Tic-Tac-Toe",
        "ja": "量子三目並べ",
        "zh": "量子井字棋",
        "ru": "Квантовые крестики-нолики",
        "ar": "تيك تاك تو الكمي",
        "he": "איקס עיגול קוונטי",
        "sv": "Kvant-luffarschack"
    },
    "games.quantum.lead": {
        "en": "Play with superposition and entanglement.",
        "it": "Gioca con sovrapposizione ed entanglement.",
        "fr": "Jouez avec la superposition et l'intrication.",
        "es": "Juega con superposición y entrelazamiento.",
        "de": "Spielen Sie mit Superposition und Verschränkung.",
        "ja": "重ね合わせとエンタングルメントで遊ぼう。",
        "zh": "玩转叠加和纠缠。",
        "ru": "Играйте с суперпозицией и запутанностью.",
        "ar": "العب مع التراكب والتشابك.",
        "he": "שחק עם סופרפוזיציה ושזירה.",
        "sv": "Spela med superposition och sammanflätning."
    },
    "games.quantum.level": {
        "en": "Mind Bending",
        "it": "Allucinante",
        "fr": "Époustouflant",
        "es": "Alucinante",
        "de": "Verwirrend",
        "ja": "頭を使う",
        "zh": "烧脑",
        "ru": "Головоломка",
        "ar": "محير للعقل",
        "he": "מפוצץ מוח",
        "sv": "Hjärnkrävande"
    },
    "games.quantum.rulesTitle": {
        "en": "Rules:",
        "it": "Regole:",
        "fr": "Règles :",
        "es": "Reglas:",
        "de": "Regeln:",
        "ja": "ルール:",
        "zh": "规则：",
        "ru": "Правила:",
        "ar": "القواعد:",
        "he": "חוקים:",
        "sv": "Regler:"
    },
    "games.quantum.rule1": {
        "en": "Quantum Move: Select 2 cells to place entangled marks.",
        "it": "Mossa Quantistica: Seleziona 2 celle per piazzare marchi entangled.",
        "fr": "Coup Quantique : Sélectionnez 2 cases pour placer des marques intriquées.",
        "es": "Movimiento Cuántico: Selecciona 2 celdas para colocar marcas entrelazadas.",
        "de": "Quantenzug: Wähle 2 Felder, um verschränkte Markierungen zu setzen.",
        "ja": "量子ムーブ: 2つのセルを選択してエンタングルしたマークを配置します。",
        "zh": "量子移动：选择2个单元格放置纠缠标记。",
        "ru": "Квантовый ход: выберите 2 клетки для размещения запутанных меток.",
        "ar": "حركة كمية: اختر خليتين لوضع علامات متشابكة.",
        "he": "מהלך קוונטי: בחר 2 תאים כדי להציב סימנים שזורים.",
        "sv": "Kvantdrag: Välj 2 rutor för att placera sammanflätade märken."
    },
    "games.quantum.rule2": {
        "en": "Classic Move: Select 1 cell to place a permanent mark.",
        "it": "Mossa Classica: Seleziona 1 cella per piazzare un marchio permanente.",
        "fr": "Coup Classique : Sélectionnez 1 case pour placer une marque permanente.",
        "es": "Movimiento Clásico: Selecciona 1 celda para colocar una marca permanente.",
        "de": "Klassischer Zug: Wähle 1 Feld, um eine permanente Markierung zu setzen.",
        "ja": "クラシックムーブ: 1つのセルを選択して永続的なマークを配置します。",
        "zh": "经典移动：选择1个单元格放置永久标记。",
        "ru": "Классический ход: выберите 1 клетку для размещения постоянной метки.",
        "ar": "حركة كلاسيكية: اختر خلية واحدة لوضع علامة دائمة.",
        "he": "מהלך קלאסי: בחר תא 1 כדי להציב סימן קבוע.",
        "sv": "Klassiskt drag: Välj 1 ruta för att placera ett permanent märke."
    },
    "games.quantum.rule3": {
        "en": "Collapse: When a cycle is formed, the board collapses randomly.",
        "it": "Collasso: Quando si forma un ciclo, la scacchiera collassa casualmente.",
        "fr": "Effondrement : Lorsqu'un cycle est formé, le plateau s'effondre aléatoirement.",
        "es": "Colapso: Cuando se forma un ciclo, el tablero colapsa aleatoriamente.",
        "de": "Kollaps: Wenn ein Zyklus gebildet wird, kollabiert das Brett zufällig.",
        "ja": "崩壊: サイクルが形成されると、ボードはランダムに崩壊します。",
        "zh": "坍缩：当形成循环时，棋盘随机坍缩。",
        "ru": "Коллапс: когда образуется цикл, доска схлопывается случайным образом.",
        "ar": "الانهيار: عندما تتشكل دورة، تنهار اللوحة بشكل عشوائي.",
        "he": "קריסה: כאשר נוצר מעגל, הלוח קורס באופן אקראי.",
        "sv": "Kollaps: När en cykel bildas kollapsar brädet slumpmässigt."
    },
    "games.quantum.rule4": {
        "en": "Win: Get 3 permanent marks in a row.",
        "it": "Vittoria: Ottieni 3 marchi permanenti in fila.",
        "fr": "Victoire : Obtenez 3 marques permanentes à la suite.",
        "es": "Victoria: Consigue 3 marcas permanentes seguidas.",
        "de": "Sieg: Erhalte 3 permanente Markierungen in einer Reihe.",
        "ja": "勝利: 永続的なマークを3つ並べます。",
        "zh": "胜利：获得3个连续的永久标记。",
        "ru": "Победа: получите 3 постоянные метки подряд.",
        "ar": "الفوز: احصل على 3 علامات دائمة متتالية.",
        "he": "ניצחון: השג 3 סימנים קבועים בשורה.",
        "sv": "Vinst: Få 3 permanenta märken i rad."
    }
}

def update_translations():
    for lang in LANGUAGES:
        file_path = os.path.join(I18N_DIR, f"{lang}.json")
        
        if not os.path.exists(file_path):
            print(f"⚠️ File {file_path} non trovato, salto.")
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            changed = False
            
            if "games" not in data:
                data["games"] = {}
                changed = True
            
            if "quantum" not in data["games"]:
                data["games"]["quantum"] = {}
                changed = True
                
            for key, translations in NEW_TRANSLATIONS.items():
                parts = key.split('.')
                final_key = parts[2]
                
                if final_key not in data["games"]["quantum"]:
                    if lang in translations:
                        data["games"]["quantum"][final_key] = translations[lang]
                        changed = True
                        print(f"  + Aggiunto {key} in {lang}")
                    else:
                        data["games"]["quantum"][final_key] = translations["en"]
                        changed = True
                        print(f"  + Aggiunto {key} in {lang} (fallback EN)")
            
            if changed:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                print(f"✓ Aggiornato {lang}.json")
            else:
                print(f"  Nessuna modifica per {lang}.json")
                
        except Exception as e:
            print(f"❌ Errore con {lang}.json: {e}")

if __name__ == "__main__":
    update_translations()

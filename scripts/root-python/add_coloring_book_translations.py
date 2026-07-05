import json
import os

# Configurazione
I18N_DIR = "i18n"
LANGUAGES = ["en", "it", "fr", "es", "de", "ja", "zh", "ru", "ar", "he", "sv"]

# Nuove traduzioni per Coloring Book
NEW_TRANSLATIONS = {
    "games.coloring.title": {
        "en": "Coloring Book",
        "it": "Libro da Colorare",
        "fr": "Livre de Coloriage",
        "es": "Libro para Colorear",
        "de": "Malbuch",
        "ja": "塗り絵",
        "zh": "涂色书",
        "ru": "Раскраска",
        "ar": "كتاب التلوين",
        "he": "ספר צביעה",
        "sv": "Målarbok"
    },
    "games.coloring.lead": {
        "en": "Relax and color beautiful figures.",
        "it": "Rilassati e colora bellissime figure.",
        "fr": "Détendez-vous et coloriez de belles figures.",
        "es": "Relájate y colorea hermosas figuras.",
        "de": "Entspannen und schöne Figuren ausmalen.",
        "ja": "リラックスして美しい図形を塗りましょう。",
        "zh": "放松并给美丽的图案上色。",
        "ru": "Расслабьтесь и раскрашивайте красивые фигуры.",
        "ar": "استرخ ولون أشكالاً جميلة.",
        "he": "הירגע וצבע דמויות יפות.",
        "sv": "Koppla av och färglägg vackra figurer."
    },
    "games.coloring.level": {
        "en": "Relaxing",
        "it": "Rilassante",
        "fr": "Relaxant",
        "es": "Relajante",
        "de": "Entspannend",
        "ja": "リラックス",
        "zh": "放松",
        "ru": "Расслабляющий",
        "ar": "مريح",
        "he": "מרגיע",
        "sv": "Avkopplande"
    },
    "games.coloring.new": {
        "en": "New Figure",
        "it": "Nuova Figura",
        "fr": "Nouvelle Figure",
        "es": "Nueva Figura",
        "de": "Neue Figur",
        "ja": "新しい図形",
        "zh": "新图案",
        "ru": "Новая фигура",
        "ar": "شكل جديد",
        "he": "דמות חדשה",
        "sv": "Ny figur"
    },
    "games.coloring.clear": {
        "en": "Clear",
        "it": "Pulisci",
        "fr": "Effacer",
        "es": "Limpiar",
        "de": "Löschen",
        "ja": "クリア",
        "zh": "清除",
        "ru": "Очистить",
        "ar": "مسح",
        "he": "נקה",
        "sv": "Rensa"
    },
    "games.coloring.download": {
        "en": "Save",
        "it": "Salva",
        "fr": "Sauvegarder",
        "es": "Guardar",
        "de": "Speichern",
        "ja": "保存",
        "zh": "保存",
        "ru": "Сохранить",
        "ar": "حفظ",
        "he": "שמור",
        "sv": "Spara"
    },
    "games.coloring.select": {
        "en": "Select a Figure",
        "it": "Seleziona una Figura",
        "fr": "Sélectionnez une Figure",
        "es": "Selecciona una Figura",
        "de": "Wähle eine Figur",
        "ja": "図形を選択",
        "zh": "选择图案",
        "ru": "Выберите фигуру",
        "ar": "اختر شكلاً",
        "he": "بחר דמות",
        "sv": "Välj en figur"
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
            
            if "coloring" not in data["games"]:
                data["games"]["coloring"] = {}
                changed = True
                
            for key, translations in NEW_TRANSLATIONS.items():
                # key è tipo "games.coloring.title"
                parts = key.split('.')
                final_key = parts[2]
                
                if final_key not in data["games"]["coloring"]:
                    if lang in translations:
                        data["games"]["coloring"][final_key] = translations[lang]
                        changed = True
                        print(f"  + Aggiunto {key} in {lang}")
                    else:
                        data["games"]["coloring"][final_key] = translations["en"]
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

import json
import os

# Configurazione
I18N_DIR = "i18n"
LANGUAGES = ["en", "it", "fr", "es", "de", "ja", "zh", "ru", "ar", "he", "sv"]

# Nuove traduzioni per Flappy Bird
NEW_TRANSLATIONS = {
    "games.flappy_bird.title": {
        "en": "Flappy Bird",
        "it": "Flappy Bird",
        "fr": "Flappy Bird",
        "es": "Flappy Bird",
        "de": "Flappy Bird",
        "ja": "フラッピーバード",
        "zh": "飞扬的小鸟",
        "ru": "Flappy Bird",
        "ar": "فلابي بيرد",
        "he": "פלאפי בירד",
        "sv": "Flappy Bird"
    },
    "games.flappy_bird.description": {
        "en": "Tap to fly and avoid the pipes!",
        "it": "Tocca per volare ed evita i tubi!",
        "fr": "Tapez pour voler et évitez les tuyaux !",
        "es": "¡Toca para volar y evita las tuberías!",
        "de": "Tippen zum Fliegen und Rohren ausweichen!",
        "ja": "タップして飛び、土管を避けよう！",
        "zh": "点击飞行并避开管道！",
        "ru": "Нажимай, чтобы лететь и избегать труб!",
        "ar": "اضغط للطيران وتجنب الأنابيب!",
        "he": "הקש כדי לעוף והימנע מהצינורות!",
        "sv": "Tryck för att flyga och undvik rören!"
    },
    "games.flappy_bird.lead": {
        "en": "Tap or Space to fly. Avoid the pipes!",
        "it": "Tocca o usa Spazio per volare. Evita i tubi!",
        "fr": "Tapez ou Espace pour voler. Évitez les tuyaux !",
        "es": "Toca o Espacio para volar. ¡Evita las tuberías!",
        "de": "Tippen oder Leertaste zum Fliegen. Rohren ausweichen!",
        "ja": "タップまたはスペースで飛びます。土管を避けてください！",
        "zh": "点击或按空格键飞行。避开管道！",
        "ru": "Нажми или пробел, чтобы лететь. Избегай труб!",
        "ar": "اضغط أو مسافة للطيران. تجنب الأنابيب!",
        "he": "הקש או רווח כדי לעוף. הימנע מהצינורות!",
        "sv": "Tryck eller mellanslag för att flyga. Undvik rören!"
    },
    "games.flappy_bird.startMsg": {
        "en": "Tap to Start",
        "it": "Tocca per Iniziare",
        "fr": "Tapez pour Commencer",
        "es": "Toca para Empezar",
        "de": "Tippen zum Starten",
        "ja": "タップして開始",
        "zh": "点击开始",
        "ru": "Нажми для старта",
        "ar": "اضغط للبدء",
        "he": "הקש להתחלה",
        "sv": "Tryck för att starta"
    },
    "games.flappy_bird.play": {
        "en": "Play",
        "it": "Gioca",
        "fr": "Jouer",
        "es": "Jugar",
        "de": "Spielen",
        "ja": "プレイ",
        "zh": "玩",
        "ru": "Играть",
        "ar": "لعب",
        "he": "שחק",
        "sv": "Spela"
    },
    "games.flappy_bird.gameOver": {
        "en": "Game Over",
        "it": "Game Over",
        "fr": "Partie Terminée",
        "es": "Fin del Juego",
        "de": "Spiel Vorbei",
        "ja": "ゲームオーバー",
        "zh": "游戏结束",
        "ru": "Игра Окончена",
        "ar": "انتهت اللعبة",
        "he": "המשחק נגמר",
        "sv": "Spelet slut"
    },
    "games.flappy_bird.restart": {
        "en": "Try Again",
        "it": "Riprova",
        "fr": "Réessayer",
        "es": "Intentar de Nuevo",
        "de": "Nochmal",
        "ja": "もう一度",
        "zh": "再试一次",
        "ru": "Попробовать снова",
        "ar": "حاول مرة أخرى",
        "he": "נסה שוב",
        "sv": "Försök igen"
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
            
            # Aggiungi le nuove chiavi
            changed = False
            
            # Assicurati che la struttura games esista
            if "games" not in data:
                data["games"] = {}
                changed = True
            
            # Se games.flappy_bird non esiste, crealo (ma qui stiamo usando chiavi piatte nel dizionario NEW_TRANSLATIONS per comodità di definizione, ma dobbiamo inserirle nella struttura annidata)
            if "flappy_bird" not in data["games"]:
                data["games"]["flappy_bird"] = {}
                changed = True
                
            for key, translations in NEW_TRANSLATIONS.items():
                # key è tipo "games.flappy_bird.title"
                parts = key.split('.')
                # parts[0] è "games", parts[1] è "flappy_bird", parts[2] è "title"
                
                final_key = parts[2]
                
                if final_key not in data["games"]["flappy_bird"]:
                    if lang in translations:
                        data["games"]["flappy_bird"][final_key] = translations[lang]
                        changed = True
                        print(f"  + Aggiunto {key} in {lang}")
                    else:
                        # Fallback su inglese se manca la lingua
                        data["games"]["flappy_bird"][final_key] = translations["en"]
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

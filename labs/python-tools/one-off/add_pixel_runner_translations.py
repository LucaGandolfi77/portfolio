import json
import os

# Configurazione
I18N_DIR = "i18n"
LANGUAGES = ["en", "it", "fr", "es", "de", "ja", "zh", "ru", "ar", "he", "sv"]

# Nuove traduzioni per Pixel Runner
NEW_TRANSLATIONS = {
    "games.pixel_runner.title": {
        "en": "Pixel Runner",
        "it": "Pixel Runner",
        "fr": "Pixel Runner",
        "es": "Pixel Runner",
        "de": "Pixel Runner",
        "ja": "ピクセルランナー",
        "zh": "像素跑酷",
        "ru": "Пиксельный Бегун",
        "ar": "عداء البكسل",
        "he": "רץ הפיקסלים",
        "sv": "Pixel Runner"
    },
    "games.pixel_runner.lead": {
        "en": "Jump over obstacles in this retro pixel art game.",
        "it": "Salta gli ostacoli in questo gioco retrò in pixel art.",
        "fr": "Sautez par-dessus les obstacles dans ce jeu rétro en pixel art.",
        "es": "Salta obstáculos en este juego retro de pixel art.",
        "de": "Springe über Hindernisse in diesem Retro-Pixel-Art-Spiel.",
        "ja": "このレトロなピクセルアートゲームで障害物を飛び越えよう。",
        "zh": "在这个复古像素艺术游戏中跳过障碍。",
        "ru": "Перепрыгивай препятствия в этой ретро пиксельной игре.",
        "ar": "اقفز فوق العقبات في لعبة فن البكسل القديمة هذه.",
        "he": "קפוץ מעל מכשולים במשחק פיקסל ארט רטרו זה.",
        "sv": "Hoppa över hinder i detta retro pixelkonstspel."
    },
    "games.pixel_runner.startMsg": {
        "en": "PIXEL RUNNER",
        "it": "PIXEL RUNNER",
        "fr": "PIXEL RUNNER",
        "es": "PIXEL RUNNER",
        "de": "PIXEL RUNNER",
        "ja": "ピクセルランナー",
        "zh": "像素跑酷",
        "ru": "ПИКСЕЛЬНЫЙ БЕГУН",
        "ar": "عداء البكسل",
        "he": "רץ הפיקסלים",
        "sv": "PIXEL RUNNER"
    },
    "games.pixel_runner.controls": {
        "en": "JUMP: Space or Tap",
        "it": "SALTA: Spazio o Tocco",
        "fr": "SAUTER : Espace ou Toucher",
        "es": "SALTAR: Espacio o Toque",
        "de": "SPRINGEN: Leertaste oder Tippen",
        "ja": "ジャンプ：スペースまたはタップ",
        "zh": "跳跃：空格或点击",
        "ru": "ПРЫЖОК: Пробел или Тап",
        "ar": "قفز: مسافة أو نقر",
        "he": "קפיצה: רווח או הקשה",
        "sv": "HOPPA: Mellanslag eller Tryck"
    },
    "games.pixel_runner.play": {
        "en": "START",
        "it": "INIZIA",
        "fr": "DÉMARRER",
        "es": "EMPEZAR",
        "de": "START",
        "ja": "スタート",
        "zh": "开始",
        "ru": "СТАРТ",
        "ar": "ابدأ",
        "he": "התחל",
        "sv": "STARTA"
    },
    "games.pixel_runner.gameOver": {
        "en": "GAME OVER",
        "it": "GAME OVER",
        "fr": "PARTIE TERMINÉE",
        "es": "FIN DEL JUEGO",
        "de": "SPIEL VORBEI",
        "ja": "ゲームオーバー",
        "zh": "游戏结束",
        "ru": "ИГРА ОКОНЧЕНА",
        "ar": "انتهت اللعبة",
        "he": "המשחק נגמר",
        "sv": "SPELET SLUT"
    },
    "games.pixel_runner.restart": {
        "en": "RETRY",
        "it": "RIPROVA",
        "fr": "RÉESSAYER",
        "es": "REINTENTAR",
        "de": "NOCHMAL",
        "ja": "リトライ",
        "zh": "重试",
        "ru": "ПОВТОРИТЬ",
        "ar": "أعد المحاولة",
        "he": "נסה שוב",
        "sv": "FÖRSÖK IGEN"
    },
    "games.pixel_runner.mobileHint": {
        "en": "Tap screen to jump",
        "it": "Tocca lo schermo per saltare",
        "fr": "Touchez l'écran pour sauter",
        "es": "Toca la pantalla para saltar",
        "de": "Bildschirm tippen zum Springen",
        "ja": "画面をタップしてジャンプ",
        "zh": "点击屏幕跳跃",
        "ru": "Нажми на экран, чтобы прыгнуть",
        "ar": "اضغط على الشاشة للقفز",
        "he": "הקש על המסך כדי לקפוץ",
        "sv": "Tryck på skärmen för att hoppa"
    },
    "games.pixel_runner.level": {
        "en": "Retro Arcade",
        "it": "Arcade Retrò",
        "fr": "Arcade Rétro",
        "es": "Arcade Retro",
        "de": "Retro Arcade",
        "ja": "レトロアーケード",
        "zh": "复古街机",
        "ru": "Ретро Аркада",
        "ar": "أركيد قديم",
        "he": "ארקייד רטרו",
        "sv": "Retro Arkad"
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
            
            if "pixel_runner" not in data["games"]:
                data["games"]["pixel_runner"] = {}
                changed = True
                
            for key, translations in NEW_TRANSLATIONS.items():
                parts = key.split('.')
                final_key = parts[2]
                
                if final_key not in data["games"]["pixel_runner"]:
                    if lang in translations:
                        data["games"]["pixel_runner"][final_key] = translations[lang]
                        changed = True
                        print(f"  + Aggiunto {key} in {lang}")
                    else:
                        data["games"]["pixel_runner"][final_key] = translations["en"]
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

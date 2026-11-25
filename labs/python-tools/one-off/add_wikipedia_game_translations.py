import json
import os

# Configurazione
I18N_DIR = "i18n"
LANGUAGES = ["en", "it", "fr", "es", "de", "ja", "zh", "ru", "ar", "he", "sv"]

# Nuove traduzioni per Wikipedia Game
NEW_TRANSLATIONS = {
    "games.wiki.title": {
        "en": "Wikipedia Game",
        "it": "Wikipedia Game",
        "fr": "Jeu Wikipédia",
        "es": "Juego de Wikipedia",
        "de": "Wikipedia-Spiel",
        "ja": "ウィキペディアゲーム",
        "zh": "维基百科游戏",
        "ru": "Википедия Игра",
        "ar": "لعبة ويكيبيديا",
        "he": "משחק ויקיפדיה",
        "sv": "Wikipedia-spel"
    },
    "games.wiki.lead": {
        "en": "Do you know these random topics?",
        "it": "Conosci questi argomenti casuali?",
        "fr": "Connaissez-vous ces sujets aléatoires ?",
        "es": "¿Conoces estos temas aleatorios?",
        "de": "Kennst du diese zufälligen Themen?",
        "ja": "これらのランダムなトピックを知っていますか？",
        "zh": "你知道这些随机话题吗？",
        "ru": "Знаете ли вы эти случайные темы?",
        "ar": "هل تعرف هذه المواضيع العشوائية؟",
        "he": "האם אתה מכיר את הנושאים האקראיים האלה?",
        "sv": "Känner du till dessa slumpmässiga ämnen?"
    },
    "games.wiki.loading": {
        "en": "Loading article...",
        "it": "Caricamento articolo...",
        "fr": "Chargement de l'article...",
        "es": "Cargando artículo...",
        "de": "Artikel wird geladen...",
        "ja": "記事を読み込んでいます...",
        "zh": "正在加载文章...",
        "ru": "Загрузка статьи...",
        "ar": "جارٍ تحميل المقالة...",
        "he": "טוען מאמר...",
        "sv": "Laddar artikel..."
    },
    "games.wiki.know": {
        "en": "I Know It",
        "it": "Lo Conosco",
        "fr": "Je Connais",
        "es": "Lo Conozco",
        "de": "Ich kenne es",
        "ja": "知っている",
        "zh": "我知道",
        "ru": "Я знаю это",
        "ar": "أعرفه",
        "he": "אני מכיר את זה",
        "sv": "Jag vet det"
    },
    "games.wiki.dontKnow": {
        "en": "Don't Know",
        "it": "Non lo Conosco",
        "fr": "Je ne Connais pas",
        "es": "No lo Conozco",
        "de": "Kenne ich nicht",
        "ja": "知らない",
        "zh": "不知道",
        "ru": "Не знаю",
        "ar": "لا أعرف",
        "he": "לא מכיר",
        "sv": "Vet inte"
    },
    "games.wiki.results": {
        "en": "Your Results",
        "it": "I tuoi Risultati",
        "fr": "Vos Résultats",
        "es": "Tus Resultados",
        "de": "Deine Ergebnisse",
        "ja": "あなたの結果",
        "zh": "你的结果",
        "ru": "Ваши результаты",
        "ar": "نتائجك",
        "he": "התוצאות שלך",
        "sv": "Dina resultat"
    },
    "games.wiki.playAgain": {
        "en": "Play Again",
        "it": "Gioca Ancora",
        "fr": "Rejouer",
        "es": "Jugar de Nuevo",
        "de": "Nochmal spielen",
        "ja": "もう一度プレイ",
        "zh": "再玩一次",
        "ru": "Играть снова",
        "ar": "العب مرة أخرى",
        "he": "שחק שוב",
        "sv": "Spela igen"
    },
    "games.wiki.level": {
        "en": "General Knowledge",
        "it": "Cultura Generale",
        "fr": "Culture Générale",
        "es": "Cultura General",
        "de": "Allgemeinwissen",
        "ja": "一般知識",
        "zh": "常识",
        "ru": "Общие знания",
        "ar": "معلومات عامة",
        "he": "ידע כללי",
        "sv": "Allmänbildning"
    },
    "games.wiki.desc": {
        "en": "Test your knowledge with random Wikipedia pages.",
        "it": "Metti alla prova la tua conoscenza con pagine Wikipedia casuali.",
        "fr": "Testez vos connaissances avec des pages Wikipédia aléatoires.",
        "es": "Pon a prueba tus conocimientos con páginas aleatorias de Wikipedia.",
        "de": "Teste dein Wissen mit zufälligen Wikipedia-Seiten.",
        "ja": "ランダムなウィキペディアのページで知識をテストします。",
        "zh": "用随机的维基百科页面测试你的知识。",
        "ru": "Проверьте свои знания с помощью случайных страниц Википедии.",
        "ar": "اختبر معلوماتك مع صفحات ويكيبيديا عشوائية.",
        "he": "בדוק את הידע שלך עם דפי ויקיפדיה אקראיים.",
        "sv": "Testa dina kunskaper med slumpmässiga Wikipedia-sidor."
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
            
            if "wiki" not in data["games"]:
                data["games"]["wiki"] = {}
                changed = True
                
            for key, translations in NEW_TRANSLATIONS.items():
                # key è tipo "games.wiki.title"
                parts = key.split('.')
                final_key = parts[2]
                
                if final_key not in data["games"]["wiki"]:
                    if lang in translations:
                        data["games"]["wiki"][final_key] = translations[lang]
                        changed = True
                        print(f"  + Aggiunto {key} in {lang}")
                    else:
                        data["games"]["wiki"][final_key] = translations["en"]
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

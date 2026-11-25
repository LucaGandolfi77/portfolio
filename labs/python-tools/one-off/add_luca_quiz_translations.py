import json
import os

# Configurazione
I18N_DIR = "i18n"
LANGUAGES = ["en", "it", "fr", "es", "de", "ja", "zh", "ru", "ar", "he", "sv"]

# Dati del quiz
QUIZ_DATA = {
    "title": {
        "en": "How well do you know Luca?",
        "it": "Quanto conosci Luca?"
    },
    "ui": {
        "question": { "en": "Question", "it": "Domanda" },
        "restart": { "en": "Play Again", "it": "Gioca di nuovo" }
    },
    "questions": {
        "job": {
            "text": { "en": "What is Luca's main job title?", "it": "Qual è il titolo lavorativo principale di Luca?" },
            "options": {
                "en": ["Frontend Developer", "Full Stack Engineer", "Data Scientist", "Designer"],
                "it": ["Sviluppatore Frontend", "Full Stack Engineer", "Data Scientist", "Designer"]
            }
        },
        "company": {
            "text": { "en": "Which company does he work for?", "it": "Per quale azienda lavora?" },
            "options": {
                "en": ["Alten Italia", "Google", "Amazon", "Freelance"],
                "it": ["Alten Italia", "Google", "Amazon", "Freelance"]
            }
        },
        "instrument": {
            "text": { "en": "Which musical instrument does he play?", "it": "Quale strumento musicale suona?" },
            "options": {
                "en": ["Guitar", "Drums", "Piano", "Violin"],
                "it": ["Chitarra", "Batteria", "Pianoforte", "Violino"]
            }
        },
        "university": {
            "text": { "en": "Where did he study?", "it": "Dove ha studiato?" },
            "options": {
                "en": ["Politecnico di Milano", "University of Parma", "University of Bologna", "Online"],
                "it": ["Politecnico di Milano", "Università di Parma", "Università di Bologna", "Online"]
            }
        },
        "achievement": {
            "text": { "en": "What is his 'funny' achievement?", "it": "Qual è il suo risultato 'divertente'?" },
            "options": {
                "en": ["Hot Dog Eating Champion", "Marathon Runner", "Chess Master", "Beauty Contest Winner"],
                "it": ["Campione mangiatore di Hot Dog", "Maratoneta", "Maestro di Scacchi", "Vincitore Concorso di Bellezza"]
            }
        },
        "language": {
            "text": { "en": "Which programming language is listed as 'Expert'?", "it": "Quale linguaggio di programmazione è indicato come 'Esperto'?" },
            "options": {
                "en": ["Python/C++", "Java", "Ruby", "Rust"],
                "it": ["Python/C++", "Java", "Ruby", "Rust"]
            }
        },
        "location": {
            "text": { "en": "Where does he live?", "it": "Dove vive?" },
            "options": {
                "en": ["Rome", "Milan/Fidenza", "Turin", "Florence"],
                "it": ["Roma", "Milano/Fidenza", "Torino", "Firenze"]
            }
        },
        "comic": {
            "text": { "en": "What is the name of his comic?", "it": "Come si chiama il suo fumetto?" },
            "options": {
                "en": ["Life Comic", "Dev Life", "Code Humor", "Daily Bugle"],
                "it": ["Life Comic", "Dev Life", "Code Humor", "Daily Bugle"]
            }
        },
        "games": {
            "text": { "en": "What game did he recently add?", "it": "Quale gioco ha aggiunto di recente?" },
            "options": {
                "en": ["Fortnite", "Minecraft", "Flappy Bird", "Call of Duty"],
                "it": ["Fortnite", "Minecraft", "Flappy Bird", "Call of Duty"]
            }
        },
        "passion": {
            "text": { "en": "What is his passion besides coding?", "it": "Qual è la sua passione oltre al coding?" },
            "options": {
                "en": ["Cooking", "Gardening", "Music/AI", "Fishing"],
                "it": ["Cucina", "Giardinaggio", "Musica/IA", "Pesca"]
            }
        }
    },
    "results": {
        "stranger": {
            "title": { "en": "Stranger", "it": "Sconosciuto" },
            "desc": { "en": "You don't know him at all. Maybe check his About page?", "it": "Non lo conosci affatto. Forse controlla la sua pagina About?" }
        },
        "acquaintance": {
            "title": { "en": "Acquaintance", "it": "Conoscente" },
            "desc": { "en": "You know a few things. Not bad!", "it": "Sai un paio di cose. Non male!" }
        },
        "friend": {
            "title": { "en": "Friend", "it": "Amico" },
            "desc": { "en": "Great job! You are definitely a friend.", "it": "Ottimo lavoro! Sei decisamente un amico." }
        },
        "bestie": {
            "title": { "en": "Best Friend / Stalker", "it": "Migliore Amico / Stalker" },
            "desc": { "en": "Perfect score! Are you his best friend or a stalker?", "it": "Punteggio perfetto! Sei il suo migliore amico o uno stalker?" }
        }
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
            
            # Ensure structure exists
            if "quiz" not in data:
                data["quiz"] = {}
            if "luca" not in data["quiz"]:
                data["quiz"]["luca"] = {}
            
            luca_data = data["quiz"]["luca"]
            
            # Helper to get lang text or fallback to EN
            def get_text(obj, l):
                return obj.get(l, obj.get("en"))

            # 1. Title
            luca_data["title"] = get_text(QUIZ_DATA["title"], lang)
            
            # 2. UI
            if "ui" not in luca_data: luca_data["ui"] = {}
            for k, v in QUIZ_DATA["ui"].items():
                luca_data["ui"][k] = get_text(v, lang)
                
            # 3. Questions
            if "questions" not in luca_data: luca_data["questions"] = {}
            for q_id, q_data in QUIZ_DATA["questions"].items():
                if q_id not in luca_data["questions"]: luca_data["questions"][q_id] = {}
                luca_data["questions"][q_id]["text"] = get_text(q_data["text"], lang)
                luca_data["questions"][q_id]["options"] = get_text(q_data["options"], lang)
                
            # 4. Results
            if "results" not in luca_data: luca_data["results"] = {}
            for r_id, r_data in QUIZ_DATA["results"].items():
                if r_id not in luca_data["results"]: luca_data["results"][r_id] = {}
                luca_data["results"][r_id]["title"] = get_text(r_data["title"], lang)
                luca_data["results"][r_id]["desc"] = get_text(r_data["desc"], lang)

            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"✓ Aggiornato {lang}.json")
                
        except Exception as e:
            print(f"❌ Errore con {lang}.json: {e}")

if __name__ == "__main__":
    update_translations()

#!/usr/bin/env python3
"""Allinea timeline.events alla biografia reale (CV 2025).

Problema risolto
----------------
Le 11 locale riportavano "2003 – Birth" come primo evento della timeline, ma il
CV (assets/CV_Gandolfi_Luca.pdf) attesta un Bachelor Degree iniziato a settembre
2013. Le due cose non possono essere vere: una laurea triennale che inizia nel
2013 richiede una nascita intorno al 1994, e lo conferma anche
assets/js/twin-mode.js:36 ("born 28 April 1994").

Inoltre la timeline raccontava una biografia da liceale (diploma 2021, "start
university" 2021, "first programming experience" 2017) che contraddiceva
l'esperienza professionale reale ad Alten Italia dal dicembre 2021.

Nessun anno di nascita viene pubblicato: non serve a nulla per valutare un
candidato e la sua assenza elimina la fonte della contraddizione.

Ogni evento qui sotto è tracciabile a una riga del CV o a un dato verificabile
del repository. Se aggiungi un evento, aggiungi anche la fonte.

Uso:
    python3 scripts/fix_timeline.py --check     # mostra le diff, non scrive
    python3 scripts/fix_timeline.py             # applica a tutte le 11 locale
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "i18n"

LOCALES = ["ar", "de", "en", "es", "fr", "he", "it", "ja", "ru", "sv", "zh"]

# Lingue con scrittura destra-sinistra. I nomi propri e gli acronimi latini
# ("Alten Italia", "ICT", "PySpark") vanno isolati con i marcatori bidi,
# altrimenti il browser li riordina all'interno del testo RTL.
RTL_LOCALES = {"ar", "he"}
FSI = "⁨"  # FIRST STRONG ISOLATE
PDI = "⁩"  # POP DIRECTIONAL ISOLATE
LATIN_RUN = re.compile(r"([A-Za-z][A-Za-z0-9&/+.\-]*(?: [A-Za-z][A-Za-z0-9&/+.\-]*)*)")


def isolate_latin(text: str) -> str:
    """Avvolge ogni sequenza latina in FIRST STRONG ISOLATE / POP ISOLATE."""
    return LATIN_RUN.sub(lambda m: FSI + m.group(1) + PDI, text)

# heading: tradotto dove esiste gia' una traduzione, altrimenti inglese.
# events: 9 voci, ordinate per anno. `year` puo' essere un int o una stringa
# breve ("2019 · 2021") per gli incarichi discontinui.
EVENTS: dict[str, dict] = {
    "en": {
        "heading": "Timeline of My Life",
        "events": [
            {"year": 2013, "title": "🎓 Bachelor Degree begins",
             "description": "Computer, Electrical and Telecom Engineering at Università degli Studi di Parma."},
            {"year": 2018, "title": "🎓 Bachelor Degree, IoT thesis",
             "description": "Graduated with a thesis on the Internet of Things: challenges and opportunities."},
            {"year": 2018, "title": "📚 Master Degree begins",
             "description": "Computer Engineering at Università degli Studi di Parma."},
            {"year": "2019 · 2021", "title": "👨‍🏫 University Tutor",
             "description": "Taught Go, Python and C and built course projects for the University of Parma."},
            {"year": 2021, "title": "💼 ICT Developer — Alten Italia",
             "description": "Software testing, verification and validation, hw/sw integration for Aerospace & Defence."},
            {"year": 2022, "title": "💼 Software Engineer — Alten Italia",
             "description": "Aerospace & Defence Division: software engineering, verification and validation, hw/sw integration."},
            {"year": 2022, "title": "🧠 NLP project — BERT + PySpark",
             "description": "Emotion detection comparing several models, with DataFrame optimization and parallel execution on PySpark."},
            {"year": 2023, "title": "☁️ Google Cloud Certified",
             "description": "Cloud fundamentals and deployment practice."},
            {"year": 2026, "title": "🚀 Today — 230 projects published",
             "description": "Games, PWAs and experiments shipped to 11 languages. Still learning, still shipping."},
        ],
    },
    "it": {
        "heading": "Timeline della Mia Vita",
        "events": [
            {"year": 2013, "title": "🎓 Inizio della Triennale",
             "description": "Ingegneria Informatica, Elettronica e delle Telecomunicazioni all'Università degli Studi di Parma."},
            {"year": 2018, "title": "🎓 Triennale, tesi su IoT",
             "description": "Laurea con una tesi su Internet of Things: sfide e opportunità."},
            {"year": 2018, "title": "📚 Inizio della Magistrale",
             "description": "Ingegneria Informatica all'Università degli Studi di Parma."},
            {"year": "2019 · 2021", "title": "👨‍🏫 Tutor universitario",
             "description": "Docenza di Go, Python e C e sviluppo di progetti per i corsi dell'Università di Parma."},
            {"year": 2021, "title": "💼 ICT Developer — Alten Italia",
             "description": "Software testing, verification and validation, integrazione hw/sw per Aerospace & Defence."},
            {"year": 2022, "title": "💼 Software Engineer — Alten Italia",
             "description": "Divisione Aerospace & Defence: software engineering, verification and validation, integrazione hw/sw."},
            {"year": 2022, "title": "🧠 Progetto NLP — BERT + PySpark",
             "description": "Rilevamento delle emozioni confrontando più modelli, con ottimizzazione dei DataFrame ed esecuzione parallela su PySpark."},
            {"year": 2023, "title": "☁️ Certificazione Google Cloud",
             "description": "Fondamenti di cloud e pratica di deployment."},
            {"year": 2026, "title": "🚀 Oggi — 230 progetti pubblicati",
             "description": "Giochi, PWA ed esperimenti pubblicati in 11 lingue. Continuo a imparare e a pubblicare."},
        ],
    },
    "fr": {
        "heading": "Chronologie de Ma Vie",
        "events": [
            {"year": 2013, "title": "🎓 Début de la Licence",
             "description": "Informatique, Électronique et Télécommunications à l'Università degli Studi di Parma."},
            {"year": 2018, "title": "🎓 Licence, mémoire sur l'IoT",
             "description": "Diplômé avec un mémoire sur l'Internet des Objets : défis et opportunités."},
            {"year": 2018, "title": "📚 Début du Master",
             "description": "Génie informatique à l'Università degli Studi di Parma."},
            {"year": "2019 · 2021", "title": "👨‍🏫 Tuteur universitaire",
             "description": "Enseignement de Go, Python et C, et développement de projets pour l'université de Parme."},
            {"year": 2021, "title": "💼 Développeur ICT — Alten Italia",
             "description": "Tests logiciels, vérification et validation, intégration matériel/logiciel pour l'Aéronautique et la Défense."},
            {"year": 2022, "title": "💼 Ingénieur logiciel — Alten Italia",
             "description": "Division Aéronautique et Défense : génie logiciel, vérification et validation, intégration matériel/logiciel."},
            {"year": 2022, "title": "🧠 Projet NLP — BERT + PySpark",
             "description": "Détection d'émotions comparant plusieurs modèles, avec optimisation des DataFrame et exécution parallèle sur PySpark."},
            {"year": 2023, "title": "☁️ Certifié Google Cloud",
             "description": "Fondamentaux du cloud et pratique du déploiement."},
            {"year": 2026, "title": "🚀 Aujourd'hui — 230 projets publiés",
             "description": "Jeux, PWAs et expériences publiés en 11 langues. J'apprends et je publie toujours."},
        ],
    },
    "es": {
        "heading": "Cronología de Mi Vida",
        "events": [
            {"year": 2013, "title": "🎓 Inicio de la Grado",
             "description": "Informática, Electrónica y Telecomunicaciones en la Università degli Studi di Parma."},
            {"year": 2018, "title": "🎓 Grado, tesis sobre IoT",
             "description": "Titulación con una tesis sobre el Internet of Things: desafíos y oportunidades."},
            {"year": 2018, "title": "📚 Inicio del Máster",
             "description": "Ingeniería Informática en la Università degli Studi di Parma."},
            {"year": "2019 · 2021", "title": "👨‍🏫 Tutor universitario",
             "description": "Docencia de Go, Python y C y desarrollo de proyectos para la Universidad de Parma."},
            {"year": 2021, "title": "💼 Desarrollador ICT — Alten Italia",
             "description": "Pruebas de software, verificación y validación, integración hw/sw para Aeroespacial y Defensa."},
            {"year": 2022, "title": "💼 Ingeniero de software — Alten Italia",
             "description": "División Aeroespacial y Defensa: ingeniería de software, verificación y validación, integración hw/sw."},
            {"year": 2022, "title": "🧠 Proyecto NLP — BERT + PySpark",
             "description": "Detección de emociones comparando varios modelos, con optimización de DataFrames y ejecución paralela en PySpark."},
            {"year": 2023, "title": "☁️ Certificación Google Cloud",
             "description": "Fundamentos de la nube y práctica de despliegue."},
            {"year": 2026, "title": "🚀 Hoy — 230 proyectos publicados",
             "description": "Juegos, PWAs y experimentos publicados en 11 idiomas. Sigo aprendiendo y publicando."},
        ],
    },
    "de": {
        "heading": "Zeitleiste Meines Lebens",
        "events": [
            {"year": 2013, "title": "🎓 Beginn des Bachelorstudiums",
             "description": "Informatik, Elektrotechnik und Telekommunikation an der Università degli Studi di Parma."},
            {"year": 2018, "title": "🎓 Bachelorabschluss, IoT-Thesis",
             "description": "Abschluss mit einer Arbeit über das Internet of Things: Herausforderungen und Chancen."},
            {"year": 2018, "title": "📚 Beginn des Masterstudiums",
             "description": "Informatik an der Università degli Studi di Parma."},
            {"year": "2019 · 2021", "title": "👨‍🏫 Tutor an der Universität",
             "description": "Lehre für Go, Python und C sowie Entwicklung von Kursprojekten für die Universität Parma."},
            {"year": 2021, "title": "💼 ICT Developer — Alten Italia",
             "description": "Softwaretests, Verifikation und Validierung, HW/SW-Integration für Luft- und Raumfahrt sowie Verteidigung."},
            {"year": 2022, "title": "💼 Software Engineer — Alten Italia",
             "description": "Abteilung Luft- und Raumfahrt/Verteidigung: Softwareentwicklung, Verifikation und Validierung, HW/SW-Integration."},
            {"year": 2022, "title": "🧠 NLP-Projekt — BERT + PySpark",
             "description": "Emotionserkennung durch Vergleich mehrerer Modelle, mit DataFrame-Optimierung und paralleler Ausführung auf PySpark."},
            {"year": 2023, "title": "☁️ Google Cloud zertifiziert",
             "description": "Cloud-Grundlagen und Praxis des Deployments."},
            {"year": 2026, "title": "🚀 Heute — 230 veröffentlichte Projekte",
             "description": "Spiele, PWAs und Experimente in 11 Sprachen veröffentlicht. Lerne und veröffentliche weiter."},
        ],
    },
    "ru": {
        "heading": "Хронология моей жизни",
        "events": [
            {"year": 2013, "title": "🎓 Начало бакалавриата",
             "description": "Информатика, электроника и телекоммуникации в Университете Пармы."},
            {"year": 2018, "title": "🎓 Бакалавриат, диплом по IoT",
             "description": "Выпуск с дипломной работой об Интернете вещей: вызовы и возможности."},
            {"year": 2018, "title": "📚 Начало магистратуры",
             "description": "Информатика в Университете Пармы."},
            {"year": "2019 · 2021", "title": "👨‍🏫 Преподаватель в университете",
             "description": "Преподавание Go, Python и C и разработка проектов для курсов Университета Пармы."},
            {"year": 2021, "title": "💼 ICT-разработчик — Alten Italia",
             "description": "Тестирование ПО, верификация и валидация, интеграция HW/SW для аэрокосмической отрасли и обороны."},
            {"year": 2022, "title": "💼 Инженер ПО — Alten Italia",
             "description": "Подразделение «Авиация и оборона»: разработка ПО, верификация и валидация, интеграция HW/SW."},
            {"year": 2022, "title": "🧠 NLP-проект — BERT + PySpark",
             "description": "Распознавание эмоций со сравнением нескольких моделей, оптимизацией DataFrame и параллельным выполнением на PySpark."},
            {"year": 2023, "title": "☁️ Сертификация Google Cloud",
             "description": "Основы облачных технологий и практика развёртывания."},
            {"year": 2026, "title": "🚀 Сегодня — 230 опубликованных проектов",
             "description": "Игры, PWA и эксперименты на 11 языках. Продолжаю учиться и выпускать."},
        ],
    },
    "ja": {
        "heading": "人生のタイムライン",
        "events": [
            {"year": 2013, "title": "🎓 学士課程開始",
             "description": "パルマ大学 情報工学・電子工学・通信工学。"},
            {"year": 2018, "title": "🎓 学士課程修了、IoT の学位論文",
             "description": "IoT（インターネット・オブ・シングス）の課題と機会についての学位論文で卒業。"},
            {"year": 2018, "title": "📚 修士課程開始",
             "description": "パルマ大学 情報工学。"},
            {"year": "2019 · 2021", "title": "👨‍🏫 大学講師",
             "description": "Go・Python・C の講義、およびパルマ大学の授業用プロジェクトの開発。"},
            {"year": 2021, "title": "💼 ICT デベロッパー — Alten Italia",
             "description": "ソフトウェアテスト、検証・妥当性確認、航空宇宙・防衛向け HW/SW 統合。"},
            {"year": 2022, "title": "💼 ソフトウェアエンジニア — Alten Italia",
             "description": "航空宇宙・防衛部門：ソフトウェア開発、検証・妥当性確認、HW/SW 統合。"},
            {"year": 2022, "title": "🧠 NLP プロジェクト — BERT + PySpark",
             "description": "複数モデルの比較による感情検出。DataFrame の最適化と PySpark による並列実行。"},
            {"year": 2023, "title": "☁️ Google Cloud 認定",
             "description": "クラウドの基礎とデプロイの実践。"},
            {"year": 2026, "title": "🚀 現在 — 230 のプロジェクトを公開",
             "description": "11 言語でゲーム、PWA、実験を公開し続けています。学び、公開し続ける。"},
        ],
    },
    "zh": {
        "heading": "人生时间线",
        "events": [
            {"year": 2013, "title": "🎓 开始本科学习",
             "description": "就读于帕尔马大学计算机、电子与电信工程专业。"},
            {"year": 2018, "title": "🎓 本科毕业，物联网论文",
             "description": "以一篇关于物联网挑战与机遇的论文完成学业。"},
            {"year": 2018, "title": "📚 开始硕士学习",
             "description": "就读于帕尔马大学计算机工程专业。"},
            {"year": "2019 · 2021", "title": "👨‍🏫 大学助教",
             "description": "讲授 Go、Python 和 C，并为帕尔马大学课程开发项目。"},
            {"year": 2021, "title": "💼 ICT 开发工程师 — Alten Italia",
             "description": "负责航空航天与国防领域的软件测试、验证与确认，以及软硬件集成。"},
            {"year": 2022, "title": "💼 软件工程师 — Alten Italia",
             "description": "航空航天与国防事业部：软件工程、验证与确认、软硬件集成。"},
            {"year": 2022, "title": "🧠 NLP 项目 — BERT + PySpark",
             "description": "对比多种模型的情感检测项目，优化 DataFrame 并在 PySpark 上并行执行。"},
            {"year": 2023, "title": "☁️ 获得 Google Cloud 认证",
             "description": "云基础与部署实践。"},
            {"year": 2026, "title": "🚀 现在 — 已发布 230 个项目",
             "description": "以 11 种语言发布的游戏、PWA 与实验。持续学习，持续交付。"},
        ],
    },
    "ar": {
        "heading": "الخط الزمني لحياتي",
        "events": [
            {"year": 2013, "title": "🎓 بدء الدراسة الجامعية (بكالوريوس)",
             "description": "هندسة الحاسوب والإلكترونيات والاتصالات في جامعة بارما."},
            {"year": 2018, "title": "🎓 التخرج، أطروحة عن إنترنت الأشياء",
             "description": "التخرج بأطروحة عن تحديات وفرص إنترنت الأشياء."},
            {"year": 2018, "title": "📚 بدء الدراسات العليا (ماجستير)",
             "description": "هندسة الحاسوب في جامعة بارما."},
            {"year": "2019 · 2021", "title": "👨‍🏫 مدرّس جامعي",
             "description": "تدريس Go وPython وC وتطوير مشاريع مقررات في جامعة بارما."},
            {"year": 2021, "title": "💼 مطوّر ICT — Alten Italia",
             "description": "اختبار البرمجيات والتحقق من الصحة ودمج العتاد والبرمجيات لقطاع الطيران والدفاع."},
            {"year": 2022, "title": "💼 مهندس برمجيات — Alten Italia",
             "description": "قطاع الطيران والدفاع: هندسة البرمجيات والتحقق من الصحة ودمج العتاد والبرمجيات."},
            {"year": 2022, "title": "🧠 مشروع معالجة لغة طبيعية — BERT + PySpark",
             "description": "كشف المشاعر بمقارنة عدة نماذج، مع تحسين DataFrame وتنفيذ متوازٍ على PySpark."},
            {"year": 2023, "title": "☁️ اعتماد Google Cloud",
             "description": "أساسيات الحوسبة السحابية وممارسة النشر."},
            {"year": 2026, "title": "🚀 اليوم — 230 مشروعًا منشورًا",
             "description": "ألعاب وتطبيقات ويب وتجارب منشورة بـ 11 لغة. أتعلم وأنشر باستمرار."},
        ],
    },
    "he": {
        "heading": "ציר הזמן של חיי",
        "events": [
            {"year": 2013, "title": "🎓 תחילת תואר ראשון",
             "description": "הנדסת מחשבים, אלקטרוניקה ותקשורת באוניברסיטת פארמה."},
            {"year": 2018, "title": "🎓 סיום תואר ראשון, עבודת גמר על IoT",
             "description": "סיום לימודים עם עבודת גמר על אינטרנט של דברים: אתגרים והזדמנויות."},
            {"year": 2018, "title": "📚 תחילת תואר שני",
             "description": "הנדסת מחשבים באוניברסיטת פארמה."},
            {"year": "2019 · 2021", "title": "👨‍🏫 עוזר הוראה באוניברסיטה",
             "description": "הוראת Go, Python ו-C ופיתוח פרויקטים לקורסים באוניברסיטת פארמה."},
            {"year": 2021, "title": "💼 מפתח ICT — Alten Italia",
             "description": "בדיקות תוכנה, אימות והסמכה, אינטגרציית חומרה ותוכנה לתחום התעופה והביטחון."},
            {"year": 2022, "title": "💼 מהנדס תוכנה — Alten Italia",
             "description": "מחלקת תעופה וביטחון: הנדסת תוכנה, אימות והסמכה, אינטגרציית חומרה ותוכנה."},
            {"year": 2022, "title": "🧠 פרויקט NLP — BERT + PySpark",
             "description": "זיהוי רגשות על ידי השוואת כמה מודלים, עם אופטימיזציית DataFrame והרצה מקבילית ב-PySpark."},
            {"year": 2023, "title": "☁️ הסמכת Google Cloud",
             "description": "יסודות ענן ותרגול בפריסה."},
            {"year": 2026, "title": "🚀 היום — 230 פרויקטים פורסמו",
             "description": "משחקים, אפליקציות ווב וניסויים ב-11 שפות. ממשיך ללמוד ולפרסם."},
        ],
    },
    "sv": {
        "heading": "Min livstidslinje",
        "events": [
            {"year": 2013, "title": "🎓 Kandidatexamen börjar",
             "description": "Datvetenskap, elektroteknik och telekommunikation vid Università degli Studi di Parma."},
            {"year": 2018, "title": "🎓 Kandidatexamen, uppsats om IoT",
             "description": "Examen med en uppsats om Internet of Things: utmaningar och möjligheter."},
            {"year": 2018, "title": "📚 Masterexamen börjar",
             "description": "Datvetenskap vid Università degli Studi di Parma."},
            {"year": "2019 · 2021", "title": "👨‍🏫 Universitetslärare",
             "description": "Undervisade i Go, Python och C och byggde kursprojekt för universitetet i Parma."},
            {"year": 2021, "title": "💼 ICT-utvecklare — Alten Italia",
             "description": "Programvarutestning, verifiering och validering, HW/SW-integration för flygteknik och försvar."},
            {"year": 2022, "title": "💼 Systemutvecklare — Alten Italia",
             "description": "Avdelningen för flygteknik och försvar: programvaruutveckling, verifiering och validering, HW/SW-integration."},
            {"year": 2022, "title": "🧠 NLP-projekt — BERT + PySpark",
             "description": "Känslodetektering genom att jämföra flera modeller, med DataFrame-optimering och parallell körning på PySpark."},
            {"year": 2023, "title": "☁️ Google Cloud-certifierad",
             "description": "Molnfundamenta och övning i driftsättning."},
            {"year": 2026, "title": "🚀 Idag — 230 publicerade projekt",
             "description": "Spel, PWA:er och experiment publicerade på 11 språk. Lär mig och släpper fortfarande."},
        ],
    },
}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def dump(path: Path, data: dict) -> None:
    # indent=2 + newline finale: il formato gia' presente in i18n/*.json,
    # verificato con un round-trip byte-per-byte su en.json.
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    changed = 0
    for lang in LOCALES:
        path = I18N / f"{lang}.json"
        if not path.exists():
            print(f"  {lang}: file mancante, saltato", file=sys.stderr)
            continue

        data = load(path)
        tl = data.get("timeline")
        if not isinstance(tl, dict) or "events" not in tl:
            print(f"  {lang}: nessun timeline.events, saltato", file=sys.stderr)
            continue

        new = EVENTS[lang]
        old_years = [e.get("year") for e in tl["events"]]

        # L'isolamento bidi e' applicato qui e non nei dati sorgente, cosi' i
        # testi restano leggibili e il marcatore non finisce dentro i literal.
        events = [dict(e) for e in new["events"]]
        if lang in RTL_LOCALES:
            for e in events:
                e["title"] = isolate_latin(e["title"])
                e["description"] = isolate_latin(e["description"])
        new["events"] = events

        # Il confronto deve essere sul contenuto, non solo sugli anni: senza
        # questo, una correzione a un titolo o a una descrizione con gli stessi
        # anni verrebbe ignorata come "già allineato".
        needs_write = tl.get("heading") != new["heading"] or tl["events"] != new["events"]

        tl["heading"] = new["heading"]
        tl["events"] = new["events"]
        new_years = [e["year"] for e in new["events"]]

        if not needs_write:
            print(f"  {lang}: già allineato")
            continue

        if args.check:
            print(f"  {lang}: {old_years}")
            print(f"  {' ' * len(lang)}  -> {new_years}")
        else:
            dump(path, data)
            print(f"  {lang}: aggiornato ({len(old_years)} -> {len(new_years)} eventi)")
        changed += 1

    print(f"\n{changed} locale da scrivere" if args.check else f"\n{changed} locale aggiornate")
    return 1 if args.check and changed else 0


if __name__ == "__main__":
    sys.exit(main())
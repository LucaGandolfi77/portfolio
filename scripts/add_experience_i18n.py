#!/usr/bin/env python3
"""Aggiunge il blocco `experience` e `achievements` alle 11 locale i18n.

Perche'
------
Fino ad ora il lavoro di Luca non era scritto da nessuna parte nel sito. L'unica
descrizione (anni in Alten Italia nel settore Aerospace & Defence, tutor
all'universita') era in assets/js/twin-mode.js, cioe' dentro la chatbot, e il
CV in PDF non e' indicizzabile.

Inoltre RECRUITER_ORDER in assets/js/main.js elenca 'experience' e
'achievements' tra le sezioni prioritarie, ma nessuna delle due esisteva in
index.html: reorderSectionsForRecruiter() le saltava in silenzio e la modalita'
recruiter non spostava nulla.

Ogni riga di questo file e' tracciabile al CV (assets/CV_Gandolfi_Luca.pdf) o a
un dato verificabile del repository. Se un'informazione non e' piu' valida,
cambiala qui: questo file e' l'unica fonte.

Uso:
    python3 scripts/add_experience_i18n.py --check
    python3 scripts/add_experience_i18n.py
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

RTL_LOCALES = {"ar", "he"}
FSI = "⁨"  # FIRST STRONG ISOLATE
PDI = "⁩"  # POP DIRECTIONAL ISOLATE
LATIN_RUN = re.compile(r"([A-Za-z][A-Za-z0-9&/+.,()\-']*(?: [A-Za-z][A-Za-z0-9&/+.,()\-']*)*)")


def isolate_latin(text: str) -> str:
    return LATIN_RUN.sub(lambda m: FSI + m.group(1) + PDI, text)


def walk_strings(obj, fn):
    """Applica fn a ogni stringa dentro una struttura JSON annidata."""
    if isinstance(obj, str):
        return fn(obj)
    if isinstance(obj, list):
        return [walk_strings(v, fn) for v in obj]
    if isinstance(obj, dict):
        return {k: walk_strings(v, fn) for k, v in obj.items()}
    return obj


BLOCKS: dict[str, dict] = {}

BLOCKS["en"] = {
    "experience": {
        "employerLabel": "Employer",
        "educationLabel": "Education",
        "present": "present",
        "summary": "Software engineer in Alten Italia's Aerospace & Defence Division, working on verification and validation of avionics systems. Previously ICT developer at the same company, and university tutor for Go, Python and C.",
        "roles": [
            {
                "period": "Jun 2022 – present",
                "role": "Software Engineer",
                "company": "Alten Italia — Aerospace & Defence Division",
                "points": [
                    "Software engineering and testing for avionics systems",
                    "Verification and validation of software against requirements",
                    "Hardware/software integration on test benches and rigs",
                ],
            },
            {
                "period": "Dec 2021 – Jun 2022",
                "role": "ICT Developer",
                "company": "Alten Italia — Aerospace & Defence",
                "points": [
                    "Software testing and verification for defence clients",
                    "Validation reports and evidence for certification",
                    "Integration between embedded boards and host software",
                ],
            },
            {
                "period": "Jun 2019, Oct 2019, Oct 2021",
                "role": "University Tutor",
                "company": "Università degli Studi di Parma",
                "points": [
                    "Taught Go, Python and C to undergraduate students",
                    "Built the course projects for three programming courses",
                ],
            },
        ],
        "education": [
            {
                "period": "Sep 2018 – ongoing",
                "degree": "Master Degree, Computer Engineering",
                "school": "Università degli Studi di Parma",
                "detail": "",
            },
            {
                "period": "Sep 2013 – Dec 2018",
                "degree": "Bachelor Degree, Computer, Electrical and Telecom Engineering",
                "school": "Università degli Studi di Parma",
                "detail": "Thesis: An overview of Internet of Things: challenges and opportunities",
            },
        ],
    },
    "achievements": {
        "summary": "Concrete results, not adjectives.",
        "items": [
            {"label": "Google Cloud Certified", "detail": "Cloud fundamentals and deployment practice"},
            {"label": "4+ years in Aerospace & Defence", "detail": "Software and hardware validation at Alten Italia since 2021"},
            {"label": "IoT thesis", "detail": "Bachelor Degree, Università degli Studi di Parma"},
            {"label": "BERT + PySpark", "detail": "Emotion detection with model comparison and DataFrame optimization"},
            {"label": "230 published projects", "detail": "Games, PWAs and experiments, translated into 11 languages"},
            {"label": "BSc + MSc", "detail": "Computer Engineering at the University of Parma"},
        ],
    },
}

BLOCKS["it"] = {
    "experience": {
        "employerLabel": "Datore di lavoro",
        "educationLabel": "Formazione",
        "present": "presente",
        "summary": "Software engineer nella divisione Aerospace & Defence di Alten Italia, dove mi occupo di verification and validation di sistemi avionici. Prima ICT Developer nella stessa azienda, e tutor universitario di Go, Python e C.",
        "roles": [
            {
                "period": "Giu 2022 – presente",
                "role": "Software Engineer",
                "company": "Alten Italia — Divisione Aerospace & Defence",
                "points": [
                    "Sviluppo e test software per sistemi avionici",
                    "Verification and validation del software rispetto ai requisiti",
                    "Integrazione hardware/software su banchi e rig di prova",
                ],
            },
            {
                "period": "Dic 2021 – Giu 2022",
                "role": "ICT Developer",
                "company": "Alten Italia — Aerospace & Defence",
                "points": [
                    "Test e verification del software per clienti della difesa",
                    "Report di validazione ed evidenze per la certificazione",
                    "Integrazione tra schede embedded e software host",
                ],
            },
            {
                "period": "Giu 2019, Ott 2019, Ott 2021",
                "role": "Tutor universitario",
                "company": "Università degli Studi di Parma",
                "points": [
                    "Docenza di Go, Python e C a studenti di triennale",
                    "Sviluppo dei progetti di corso per tre insegnamenti di programmazione",
                ],
            },
        ],
        "education": [
            {
                "period": "Set 2018 – in corso",
                "degree": "Laurea Magistrale, Ingegneria Informatica",
                "school": "Università degli Studi di Parma",
                "detail": "",
            },
            {
                "period": "Set 2013 – Dic 2018",
                "degree": "Laurea Triennale, Ingegneria Informatica, Elettronica e delle Telecomunicazioni",
                "school": "Università degli Studi di Parma",
                "detail": "Tesi: Panoramica sull'Internet of Things: sfide e opportunità",
            },
        ],
    },
    "achievements": {
        "summary": "Risultati concreti, non aggettivi.",
        "items": [
            {"label": "Certificazione Google Cloud", "detail": "Fondamenti di cloud e pratica di deployment"},
            {"label": "4+ anni in Aerospace & Defence", "detail": "Validazione software e hardware in Alten Italia dal 2021"},
            {"label": "Tesi su IoT", "detail": "Laurea Triennale, Università degli Studi di Parma"},
            {"label": "BERT + PySpark", "detail": "Rilevamento emozioni con confronto di modelli e ottimizzazione dei DataFrame"},
            {"label": "230 progetti pubblicati", "detail": "Giochi, PWA ed esperimenti, tradotti in 11 lingue"},
            {"label": "Triennale + Magistrale", "detail": "Ingegneria Informatica all'Università di Parma"},
        ],
    },
}

BLOCKS["fr"] = {
    "experience": {
        "employerLabel": "Employeur",
        "educationLabel": "Formation",
        "present": "aujourd'hui",
        "summary": "Ingénieur logiciel dans la division Aéronautique et Défense d'Alten Italia, où je travaille sur la vérification et la validation de systèmes avioniques. Ingénieur ICT dans la même entreprise auparavant, et tuteur universitaire pour Go, Python et C.",
        "roles": [
            {
                "period": "Juin 2022 – aujourd'hui",
                "role": "Software Engineer",
                "company": "Alten Italia — Division Aéronautique et Défense",
                "points": [
                    "Développement et tests logiciels pour des systèmes avioniques",
                    "Vérification et validation du logiciel par rapport aux exigences",
                    "Intégration matériel/logiciel sur bancs d'essai",
                ],
            },
            {
                "period": "Déc 2021 – Juin 2022",
                "role": "ICT Developer",
                "company": "Alten Italia — Aéronautique et Défense",
                "points": [
                    "Tests et vérification logicielle pour des clients de la défense",
                    "Rapports de validation et preuves pour la certification",
                    "Intégration entre cartes embarquées et logiciel hôte",
                ],
            },
            {
                "period": "Juin 2019, Oct 2019, Oct 2021",
                "role": "Tuteur universitaire",
                "company": "Università degli Studi di Parma",
                "points": [
                    "Enseignement de Go, Python et C aux étudiants de licence",
                    "Développement des projets pour trois cours de programmation",
                ],
            },
        ],
        "education": [
            {
                "period": "Sept 2018 – en cours",
                "degree": "Master, Génie informatique",
                "school": "Università degli Studi di Parma",
                "detail": "",
            },
            {
                "period": "Sept 2013 – Déc 2018",
                "degree": "Licence, Informatique, Électronique et Télécommunications",
                "school": "Università degli Studi di Parma",
                "detail": "Mémoire : un aperçu de l'Internet des Objets : défis et opportunités",
            },
        ],
    },
    "achievements": {
        "summary": "Des résultats concrets, pas des adjectifs.",
        "items": [
            {"label": "Certifié Google Cloud", "detail": "Fondamentaux du cloud et pratique du déploiement"},
            {"label": "4+ ans en Aéronautique et Défense", "detail": "Validation logicielle et matérielle chez Alten Italia depuis 2021"},
            {"label": "Mémoire sur l'IoT", "detail": "Licence, Università degli Studi di Parma"},
            {"label": "BERT + PySpark", "detail": "Détection d'émotions, comparaison de modèles et optimisation des DataFrame"},
            {"label": "230 projets publiés", "detail": "Jeux, PWAs et expériences, traduits en 11 langues"},
            {"label": "Licence + Master", "detail": "Génie informatique à l'université de Parme"},
        ],
    },
}

BLOCKS["es"] = {
    "experience": {
        "employerLabel": "Empleador",
        "educationLabel": "Formación",
        "present": "actualidad",
        "summary": "Ingeniero de software en la división Aeroespacial y Defensa de Alten Italia, donde me dedico a la verificación y validación de sistemas aviónicos. Antes desarrollador ICT en la misma empresa y profesor universitario de Go, Python y C.",
        "roles": [
            {
                "period": "Jun 2022 – actualidad",
                "role": "Software Engineer",
                "company": "Alten Italia — División Aeroespacial y Defensa",
                "points": [
                    "Desarrollo y pruebas de software para sistemas aviónicos",
                    "Verificación y validación del software frente a los requisitos",
                    "Integración hardware/software en bancos de prueba",
                ],
            },
            {
                "period": "Dic 2021 – Jun 2022",
                "role": "ICT Developer",
                "company": "Alten Italia — Aeroespacial y Defensa",
                "points": [
                    "Pruebas y verificación de software para clientes de defensa",
                    "Informes de validación y evidencias para certificación",
                    "Integración entre placas embebidas y software anfitrión",
                ],
            },
            {
                "period": "Jun 2019, Oct 2019, Oct 2021",
                "role": "Profesor universitario",
                "company": "Università degli Studi di Parma",
                "points": [
                    "Docencia de Go, Python y C a estudiantes de grado",
                    "Desarrollo de los proyectos de tres asignaturas de programación",
                ],
            },
        ],
        "education": [
            {
                "period": "Sep 2018 – en curso",
                "degree": "Máster en Ingeniería Informática",
                "school": "Università degli Studi di Parma",
                "detail": "",
            },
            {
                "period": "Sep 2013 – Dic 2018",
                "degree": "Grado en Ingeniería Informática, Electrónica y Telecomunicaciones",
                "school": "Università degli Studi di Parma",
                "detail": "Tesis: Una visión general del Internet of Things: desafíos y oportunidades",
            },
        ],
    },
    "achievements": {
        "summary": "Resultados concretos, no adjetivos.",
        "items": [
            {"label": "Certificado Google Cloud", "detail": "Fundamentos de la nube y práctica de despliegue"},
            {"label": "4+ años en Aeroespacial y Defensa", "detail": "Validación de software y hardware en Alten Italia desde 2021"},
            {"label": "Tesis sobre IoT", "detail": "Grado, Università degli Studi di Parma"},
            {"label": "BERT + PySpark", "detail": "Detección de emociones con comparación de modelos y optimización de DataFrames"},
            {"label": "230 proyectos publicados", "detail": "Juegos, PWAs y experimentos, traducidos a 11 idiomas"},
            {"label": "Grado + Máster", "detail": "Ingeniería Informática en la Universidad de Parma"},
        ],
    },
}

BLOCKS["de"] = {
    "experience": {
        "employerLabel": "Arbeitgeber",
        "educationLabel": "Ausbildung",
        "present": "heute",
        "summary": "Software Engineer in der Abteilung Luft- und Raumfahrt/Verteidigung von Alten Italia, dort beschäftige ich mich mit Verifikation und Validierung von Avionik-Systemen. Zuvor ICT Developer im selben Unternehmen und Tutor an der Universität für Go, Python und C.",
        "roles": [
            {
                "period": "Jun 2022 – heute",
                "role": "Software Engineer",
                "company": "Alten Italia — Abteilung Luft- und Raumfahrt/Verteidigung",
                "points": [
                    "Softwareentwicklung und Tests für Avioniksysteme",
                    "Verifikation und Validierung der Software gegen Anforderungen",
                    "HW/SW-Integration an Prüfständen und Testaufbauten",
                ],
            },
            {
                "period": "Dez 2021 – Jun 2022",
                "role": "ICT Developer",
                "company": "Alten Italia — Luft- und Raumfahrt/Verteidigung",
                "points": [
                    "Softwaretests und Verifikation für Kunden der Verteidigung",
                    "Validierungsberichte und Nachweise für die Zertifizierung",
                    "Integration zwischen Embedded-Boards und Host-Software",
                ],
            },
            {
                "period": "Jun 2019, Okt 2019, Okt 2021",
                "role": "Universitäts-Tutor",
                "company": "Università degli Studi di Parma",
                "points": [
                    "Lehre für Go, Python und C für Studierende",
                    "Entwicklung der Kursprojekte für drei Programmierkurse",
                ],
            },
        ],
        "education": [
            {
                "period": "Sep 2018 – laufend",
                "degree": "Master, Informatik",
                "school": "Università degli Studi di Parma",
                "detail": "",
            },
            {
                "period": "Sep 2013 – Dez 2018",
                "degree": "Bachelor, Informatik, Elektrotechnik und Telekommunikation",
                "school": "Università degli Studi di Parma",
                "detail": "Diplomarbeit: Ein Überblick über das Internet of Things: Herausforderungen und Chancen",
            },
        ],
    },
    "achievements": {
        "summary": "Konkrete Ergebnisse, keine Adjektive.",
        "items": [
            {"label": "Google Cloud zertifiziert", "detail": "Cloud-Grundlagen und Praxis des Deployments"},
            {"label": "4+ Jahre Luft- und Raumfahrt/Verteidigung", "detail": "Software- und Hardwarevalidierung bei Alten Italia seit 2021"},
            {"label": "IoT-Diplomarbeit", "detail": "Bachelor, Università degli Studi di Parma"},
            {"label": "BERT + PySpark", "detail": "Emotionserkennung mit Modellvergleich und DataFrame-Optimierung"},
            {"label": "230 veröffentlichte Projekte", "detail": "Spiele, PWAs und Experimente in 11 Sprachen"},
            {"label": "Bachelor + Master", "detail": "Informatik an der Universität Parma"},
        ],
    },
}

BLOCKS["ru"] = {
    "experience": {
        "employerLabel": "Работодатель",
        "educationLabel": "Образование",
        "present": "настоящее время",
        "summary": "Инженер ПО в подразделении «Авиация и оборона» компании Alten Italia: верификация и валидация авиационных систем. Ранее — ICT-разработчик в той же компании и преподаватель университета по Go, Python и C.",
        "roles": [
            {
                "period": "Июнь 2022 – настоящее время",
                "role": "Software Engineer",
                "company": "Alten Italia — «Авиация и оборона»",
                "points": [
                    "Разработка и тестирование ПО для авиационных систем",
                    "Верификация и валидация ПО по требованиям",
                    "Интеграция HW/SW на испытательных стендах",
                ],
            },
            {
                "period": "Декабрь 2021 – июнь 2022",
                "role": "ICT Developer",
                "company": "Alten Italia — «Авиация и оборона»",
                "points": [
                    "Тестирование и верификация ПО для заказчиков оборонной отрасли",
                    "Отчёты о валидации и данные для сертификации",
                    "Интеграция встраиваемых плат с хостовым ПО",
                ],
            },
            {
                "period": "Июнь 2019, октябрь 2019, октябрь 2021",
                "role": "Преподаватель университета",
                "company": "Università degli Studi di Parma",
                "points": [
                    "Преподавание Go, Python и C студентам бакалавриата",
                    "Разработка проектов для трёх курсов по программированию",
                ],
            },
        ],
        "education": [
            {
                "period": "Сентябрь 2018 – в процессе",
                "degree": "Магистратура, информатика",
                "school": "Università degli Studi di Parma",
                "detail": "",
            },
            {
                "period": "Сентябрь 2013 – декабрь 2018",
                "degree": "Бакалавриат, информатика, электроника и телекоммуникации",
                "school": "Università degli Studi di Parma",
                "detail": "Дипломная работа: обзор Интернета вещей: вызовы и возможности",
            },
        ],
    },
    "achievements": {
        "summary": "Конкретные результаты, а не прилагательные.",
        "items": [
            {"label": "Сертификация Google Cloud", "detail": "Основы облака и практика развёртывания"},
            {"label": "4+ года в аэрокосмической отрасли и обороне", "detail": "Валидация ПО и оборудования в Alten Italia с 2021"},
            {"label": "Дипломная работа по IoT", "detail": "Бакалавриат, Università degli Studi di Parma"},
            {"label": "BERT + PySpark", "detail": "Распознавание эмоций: сравнение моделей и оптимизация DataFrame"},
            {"label": "230 опубликованных проектов", "detail": "Игры, PWA и эксперименты на 11 языках"},
            {"label": "Бакалавриат + магистратура", "detail": "Информатика в Университете Пармы"},
        ],
    },
}

BLOCKS["ja"] = {
    "experience": {
        "employerLabel": "勤務先",
        "educationLabel": "学歴",
        "present": "現在",
        "summary": "Alten Italia の航空宇宙・防衛事業部でソフトウェアエンジニアとして勤務。航空機機器システムの検証・妥当性確認を担当。同じ会社で ICT 開発者として勤務し、パルマ大学の助教として Go・Python・C を教えていた。",
        "roles": [
            {
                "period": "2022年6月 – 現在",
                "role": "Software Engineer",
                "company": "Alten Italia 航空宇宙・防衛事業部",
                "points": [
                    "航空宇宙機器向けのソフトウェア開発とテスト",
                    "要求事項に対するソフトウェアの検証・妥当性確認",
                    "試験ベンチ上での HW/SW 統合",
                ],
            },
            {
                "period": "2021年12月 – 2022年6月",
                "role": "ICT Developer",
                "company": "Alten Italia 航空宇宙・防衛",
                "points": [
                    "防衛分野の顧客に向けたソフトウェアテストと検証",
                    "認証のための妥当性確認レポートと証跡",
                    "組み込みボードとホストソフトウェアの統合",
                ],
            },
            {
                "period": "2019年6月、2019年10月、2021年10月",
                "role": "大学助教",
                "company": "パルマ大学",
                "points": [
                    "学部生対象に Go・Python・C を教授",
                    "3つのプログラミング科目の授業プロジェクトを開発",
                ],
            },
        ],
        "education": [
            {
                "period": "2018年9月 – 在学中",
                "degree": "修士課程 情報工学",
                "school": "パルマ大学",
                "detail": "",
            },
            {
                "period": "2013年9月 – 2018年12月",
                "degree": "学士課程 情報工学・電子工学・通信工学",
                "school": "パルマ大学",
                "detail": "学位論文：インターネット・オブ・シングスの概要：課題と機会",
            },
        ],
    },
    "achievements": {
        "summary": "形容詞ではなく、具体的な結果。",
        "items": [
            {"label": "Google Cloud 認定", "detail": "クラウドの基礎とデプロイの実践"},
            {"label": "航空宇宙・防衛で 4 年以上", "detail": "2021 年より Alten Italia でソフトウェアとハードウェアの検証"},
            {"label": "IoT の学位論文", "detail": "パルマ大学 学士課程"},
            {"label": "BERT + PySpark", "detail": "複数モデルの比較による感情検出と DataFrame の最適化"},
            {"label": "230 のプロジェクトを公開", "detail": "ゲーム・PWA・実験を 11 言語で公開"},
            {"label": "学士 + 修士", "detail": "パルマ大学 情報工学"},
        ],
    },
}

BLOCKS["zh"] = {
    "experience": {
        "employerLabel": "雇主",
        "educationLabel": "教育背景",
        "present": "至今",
        "summary": "Alten Italia 航空航天与国防事业部软件工程师，负责机载系统的验证与确认。此前在同一公司担任 ICT 开发工程师，并在帕尔马大学担任 Go、Python 和 C 的助教。",
        "roles": [
            {
                "period": "2022年6月 – 至今",
                "role": "软件工程师",
                "company": "Alten Italia 航空航天与国防事业部",
                "points": [
                    "机载系统的软件开发与测试",
                    "依据需求对软件进行验证与确认",
                    "在试验台和测试装置上完成软硬件集成",
                ],
            },
            {
                "period": "2021年12月 – 2022年6月",
                "role": "ICT 开发工程师",
                "company": "Alten Italia 航空航天与国防",
                "points": [
                    "面向国防客户的软件测试与验证",
                    "用于认证的确认报告与证据",
                    "嵌入式板卡与主机软件的集成",
                ],
            },
            {
                "period": "2019年6月、2019年10月、2021年10月",
                "role": "大学助教",
                "company": "帕尔马大学",
                "points": [
                    "为本科生讲授 Go、Python 和 C",
                    "为三门编程课程开发课程项目",
                ],
            },
        ],
        "education": [
            {
                "period": "2018年9月 – 在读",
                "degree": "计算机工程硕士",
                "school": "帕尔马大学",
                "detail": "",
            },
            {
                "period": "2013年9月 – 2018年12月",
                "degree": "计算机、电子与电信工程学士",
                "school": "帕尔马大学",
                "detail": "毕业论文：物联网综述：挑战与机遇",
            },
        ],
    },
    "achievements": {
        "summary": "具体成果，不是形容词。",
        "items": [
            {"label": "Google Cloud 认证", "detail": "云基础与部署实践"},
            {"label": "航空航天与国防领域 4 年以上", "detail": "自 2021 年起在 Alten Italia 从事软硬件验证"},
            {"label": "物联网毕业论文", "detail": "帕尔马大学学士"},
            {"label": "BERT + PySpark", "detail": "通过模型对比进行情感检测，并优化 DataFrame"},
            {"label": "已发布 230 个项目", "detail": "游戏、PWA 与实验，翻译为 11 种语言"},
            {"label": "学士 + 硕士", "detail": "帕尔马大学计算机工程"},
        ],
    },
}

BLOCKS["ar"] = {
    "experience": {
        "employerLabel": "جهة العمل",
        "educationLabel": "المؤهلات العلمية",
        "present": "حتى الآن",
        "summary": "مهندس برمجيات في قطاع الطيران والدفاع بشركة Alten Italia، وأعمل على التحقق من أنظمة الطيران. عملت سابقًا كمطوّر ICT في الشركة نفسها، وتولّيت تدريس Go وPython وC في الجامعة.",
        "roles": [
            {
                "period": "يونيو 2022 – حتى الآن",
                "role": "Software Engineer",
                "company": "Alten Italia — قطاع الطيران والدفاع",
                "points": [
                    "تطوير واختبار برمجيات لأنظمة الطيران",
                    "التحقق من صحة البرمجيات ومطابقتها للمتطلبات",
                    "دمج العتاد والبرمجيات على مناضد الاختبار",
                ],
            },
            {
                "period": "ديسمبر 2021 – يونيو 2022",
                "role": "ICT Developer",
                "company": "Alten Italia — الطيران والدفاع",
                "points": [
                    "اختبار البرمجيات والتحقق منها لعملاء قطاع الدفاع",
                    "تقارير التحقق ووثائق داعمة للشهادة",
                    "دمج اللوحات المدمجة مع برمجيات الحاسب المضيف",
                ],
            },
            {
                "period": "يونيو 2019، أكتوبر 2019، أكتوبر 2021",
                "role": "مدرّس جامعي",
                "company": "جامعة بارما",
                "points": [
                    "تدريس Go وPython وC لطلاب البكالوريوس",
                    "تطوير مشاريع ثلاثة مقررات برمجة",
                ],
            },
        ],
        "education": [
            {
                "period": "سبتمبر 2018 – مستمر",
                "degree": "ماجستير في هندسة الحاسوب",
                "school": "جامعة بارما",
                "detail": "",
            },
            {
                "period": "سبتمبر 2013 – ديسمبر 2018",
                "degree": "بكالوريوس هندسة الحاسوب والإلكترونيات والاتصالات",
                "school": "جامعة بارما",
                "detail": "الأطروحة: لمحة عن إنترنت الأشياء: التحديات والفرص",
            },
        ],
    },
    "achievements": {
        "summary": "نتائج ملموسة، لا صفات.",
        "items": [
            {"label": "شهادة Google Cloud", "detail": "أساسيات الحوسبة السحابية وممارسة النشر"},
            {"label": "أكثر من أربع سنوات في الطيران والدفاع", "detail": "التحقق من البرمجيات والعتاد في Alten Italia منذ 2021"},
            {"label": "أطروحة عن إنترنت الأشياء", "detail": "بكالوريوس، جامعة بارما"},
            {"label": "BERT وPySpark", "detail": "كشف المشاعر بمقارنة النماذج وتحسين DataFrame"},
            {"label": "230 مشروعًا منشورًا", "detail": "ألعاب وتطبيقات ويب وتجارب بأحد عشر لغة"},
            {"label": "بكالوريوس وماجستير", "detail": "هندسة الحاسوب في جامعة بارما"},
        ],
    },
}

BLOCKS["he"] = {
    "experience": {
        "employerLabel": "מעסיק",
        "educationLabel": "השכלה",
        "present": "היום",
        "summary": "מהנדס תוכנה במחלקת תעופה וביטחון של Alten Italia, שם אני עוסק באימות מערכות תעופתיות. קודם לכן עבדתי כמפתח ICT באותה חברה, וכמדריך אוניברסיטארי לקורסי Go, Python ו-C.",
        "roles": [
            {
                "period": "יוני 2022 – היום",
                "role": "Software Engineer",
                "company": "Alten Italia — תעופה וביטחון",
                "points": [
                    "פיתוח ובדיקות תוכנה למערכות תעופתיות",
                    "אימות ותיקוף התוכנה מול דרישות",
                    "אינטגרציית חומרה ותוכנה על אבני בדיקה",
                ],
            },
            {
                "period": "דצמבר 2021 – יוני 2022",
                "role": "ICT Developer",
                "company": "Alten Italia — תעופה וביטחון",
                "points": [
                    "בדיקות ואימות תוכנה ללקוחות בתחום הביטחון",
                    "דוחות תיקוף וראיות לצורך הסמכה",
                    "אינטגרצייה בין לוחות מוטמעים לתוכנת המארח",
                ],
            },
            {
                "period": "יוני 2019, אוקטובר 2019, אוקטובר 2021",
                "role": "עוזר הוראה",
                "company": "אוניברסיטת פארמה",
                "points": [
                    "הוראת Go, Python ו-C לסטודנטים",
                    "פיתוח פרויקטי הקורס בשלושה קורסי תכנות",
                ],
            },
        ],
        "education": [
            {
                "period": "ספטמבר 2018 – בתהליך",
                "degree": "תואר שני, הנדסת מחשבים",
                "school": "אוניברסיטת פארמה",
                "detail": "",
            },
            {
                "period": "ספטמבר 2013 – דצמבר 2018",
                "degree": "תואר ראשון, הנדסת מחשבים, אלקטרוניקה ותקשורת",
                "school": "אוניברסיטת פארמה",
                "detail": "עבודת גמר: סקירה של האינטרנט של דברים: אתגרים והזדמנויות",
            },
        ],
    },
    "achievements": {
        "summary": "תוצאות ממשיות, לא מילות יחר.",
        "items": [
            {"label": "מוסמך Google Cloud", "detail": "יסודות הענן ותרגול בפריסה"},
            {"label": "ארבע שנים ויותר בתעופה וביטחון", "detail": "תיקוף תוכנה וחומרה ב-Alten Italia מאז 2021"},
            {"label": "עבודת גמר על IoT", "detail": "תואר ראשון, אוניברסיטת פארמה"},
            {"label": "BERT ו-PySpark", "detail": "זיהוי רגשות בהשוואת מודלים ואופטימיזציית DataFrame"},
            {"label": "230 פרויקטים פורסמו", "detail": "משחקים, אפליקציות ווב וניסויים ב-11 שפות"},
            {"label": "תואר ראשון ושני", "detail": "הנדסת מחשבים באוניברסיטת פארמה"},
        ],
    },
}

BLOCKS["sv"] = {
    "experience": {
        "employerLabel": "Arbetsgivare",
        "educationLabel": "Utbildning",
        "present": "idag",
        "summary": "Systemutvecklare på Alten Italias avdelning för flygteknik och försvar, där jag arbetar med verifiering och validering av flygsystem. Tidigare ICT-utvecklare på samma företag och universitetslärare för Go, Python och C.",
        "roles": [
            {
                "period": "Jun 2022 – idag",
                "role": "Software Engineer",
                "company": "Alten Italia — Avdelningen för flygteknik och försvar",
                "points": [
                    "Programvaruutveckling och tester för flygsystem",
                    "Verifiering och validering av programvaran mot kraven",
                    "HW/SW-integration på testbänkar och riggar",
                ],
            },
            {
                "period": "Dec 2021 – Jun 2022",
                "role": "ICT Developer",
                "company": "Alten Italia — Flygteknik och försvar",
                "points": [
                    "Programvarutestning och verifiering för försvarskunder",
                    "Valideringsrapporter och underlag för certifiering",
                    "Integration mellan inbäddade kort och värdprogramvara",
                ],
            },
            {
                "period": "Jun 2019, Okt 2019, Okt 2021",
                "role": "Universitetslärare",
                "company": "Università degli Studi di Parma",
                "points": [
                    "Undervisade Go, Python och C för studenter",
                    "Byggde kursprojekten för tre programmeringskurser",
                ],
            },
        ],
        "education": [
            {
                "period": "Sep 2018 – pågående",
                "degree": "Master, datvetenskap",
                "school": "Università degli Studi di Parma",
                "detail": "",
            },
            {
                "period": "Sep 2013 – Dec 2018",
                "degree": "Kandidat, datvetenskap, elektroteknik och telekommunikation",
                "school": "Università degli Studi di Parma",
                "detail": "Uppsats: En översikt över Internet of Things: utmaningar och möjligheter",
            },
        ],
    },
    "achievements": {
        "summary": "Konkreta resultat, inga adjektiv.",
        "items": [
            {"label": "Google Cloud-certifierad", "detail": "Molnfundamenta och övning i driftsättning"},
            {"label": "Fyra år eller mer inom flygteknik och försvar", "detail": "Verifiering av programvara och hårdvara på Alten Italia sedan 2021"},
            {"label": "Uppsats om IoT", "detail": "Kandidat, Università degli Studi di Parma"},
            {"label": "BERT + PySpark", "detail": "Känslodetektering med modelljämförelse och DataFrame-optimering"},
            {"label": "230 publicerade projekt", "detail": "Spel, PWA:er och experiment på elva språk"},
            {"label": "Kandidat och master", "detail": "Datvetenskap vid universitetet i Parma"},
        ],
    },
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    broken = [l for l in LOCALES if not BLOCKS.get(l)]
    if broken:
        print(f"Blocchi mancanti o vuoti: {broken}", file=sys.stderr)
        return 2

    changed = 0
    for lang in LOCALES:
        path = I18N / f"{lang}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        block = json.loads(json.dumps(BLOCKS[lang]))  # copia: walk_strings muta
        if lang in RTL_LOCALES:
            block = walk_strings(block, isolate_latin)

        needs_write = (data.get("experience") != block["experience"]
                       or data.get("achievements") != block["achievements"])
        data["experience"] = block["experience"]
        data["achievements"] = block["achievements"]

        if not needs_write:
            print(f"  {lang}: già allineato")
            continue
        if args.check:
            print(f"  {lang}: da aggiornare")
        else:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                            encoding="utf-8")
            print(f"  {lang}: aggiornato "
                  f"({len(block['experience']['roles'])} ruoli, "
                  f"{len(block['experience']['education'])} titoli, "
                  f"{len(block['achievements']['items'])} traguardi)")
        changed += 1

    print(f"\n{changed} locale da scrivere" if args.check else f"\n{changed} locale aggiornate")
    return 0


if __name__ == "__main__":
    sys.exit(main())
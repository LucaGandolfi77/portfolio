#!/usr/bin/env python3
import json
import os

languages = ['en', 'it', 'es', 'fr', 'de', 'ru', 'ja', 'zh']

memory_translations = {
    'en': {
        'title': 'Memory',
        'lead': 'Test your memory by finding matching card pairs',
        'level': '3 difficulty levels',
        'back': 'Back to Games',
        'gameTitle': 'Memory',
        'gameSubtitle': 'Find matching pairs',
        'pairs': 'Pairs Found',
        'moves': 'Moves',
        'bestMoves': 'Best',
        'difficulty': 'Difficulty',
        'easy': 'Easy 4x4',
        'medium': 'Medium 4x6',
        'hard': 'Hard 4x8',
        'startMessage': 'Click cards to find matching pairs',
        'matched': 'Great! Pair found! 🎉',
        'won': 'Amazing! You won! 🏆',
        'newGame': 'New Game',
        'resetStats': 'Reset Stats',
        'confirmReset': 'Are you sure you want to reset your best score?'
    },
    'it': {
        'title': 'Memory',
        'lead': 'Metti alla prova la tua memoria trovando coppie di carte corrispondenti',
        'level': '3 livelli di difficoltà',
        'back': 'Torna ai Giochi',
        'gameTitle': 'Memory',
        'gameSubtitle': 'Trova le coppie uguali',
        'pairs': 'Coppie Trovate',
        'moves': 'Mosse',
        'bestMoves': 'Meglio',
        'difficulty': 'Difficoltà',
        'easy': 'Facile 4x4',
        'medium': 'Medio 4x6',
        'hard': 'Difficile 4x8',
        'startMessage': 'Clicca le carte per trovare le coppie uguali',
        'matched': 'Fantastico! Coppia trovata! 🎉',
        'won': 'Incredibile! Hai vinto! 🏆',
        'newGame': 'Nuova Partita',
        'resetStats': 'Azzera Statistiche',
        'confirmReset': 'Sei sicuro di voler azzerare il tuo miglior punteggio?'
    },
    'es': {
        'title': 'Memoria',
        'lead': 'Pon a prueba tu memoria encontrando pares de cartas coincidentes',
        'level': '3 niveles de dificultad',
        'back': 'Volver a Juegos',
        'gameTitle': 'Memoria',
        'gameSubtitle': 'Encuentra pares coincidentes',
        'pairs': 'Pares Encontrados',
        'moves': 'Movimientos',
        'bestMoves': 'Mejor',
        'difficulty': 'Dificultad',
        'easy': 'Fácil 4x4',
        'medium': 'Medio 4x6',
        'hard': 'Difícil 4x8',
        'startMessage': 'Haz clic en las cartas para encontrar pares coincidentes',
        'matched': '¡Excelente! ¡Pareja encontrada! 🎉',
        'won': '¡Increíble! ¡Ganaste! 🏆',
        'newGame': 'Nuevo Juego',
        'resetStats': 'Reiniciar Estadísticas',
        'confirmReset': '¿Estás seguro de que deseas restablecer tu mejor puntuación?'
    },
    'fr': {
        'title': 'Mémoire',
        'lead': 'Testez votre mémoire en trouvant des paires de cartes correspondantes',
        'level': '3 niveaux de difficulté',
        'back': 'Retour aux Jeux',
        'gameTitle': 'Mémoire',
        'gameSubtitle': 'Trouvez les paires correspondantes',
        'pairs': 'Paires Trouvées',
        'moves': 'Coups',
        'bestMoves': 'Meilleur',
        'difficulty': 'Difficulté',
        'easy': 'Facile 4x4',
        'medium': 'Moyen 4x6',
        'hard': 'Difficile 4x8',
        'startMessage': 'Cliquez sur les cartes pour trouver les paires correspondantes',
        'matched': 'Excellent ! Paire trouvée ! 🎉',
        'won': 'Incroyable ! Vous avez gagné ! 🏆',
        'newGame': 'Nouveau Jeu',
        'resetStats': 'Réinitialiser les Statistiques',
        'confirmReset': 'Êtes-vous sûr de vouloir réinitialiser votre meilleur score ?'
    },
    'de': {
        'title': 'Memory',
        'lead': 'Teste dein Gedächtnis, indem du übereinstimmende Kartenpaare findest',
        'level': '3 Schwierigkeitsstufen',
        'back': 'Zurück zu Spiele',
        'gameTitle': 'Memory',
        'gameSubtitle': 'Finde matching Paare',
        'pairs': 'Paare Gefunden',
        'moves': 'Züge',
        'bestMoves': 'Beste',
        'difficulty': 'Schwierigkeit',
        'easy': 'Einfach 4x4',
        'medium': 'Mittel 4x6',
        'hard': 'Schwer 4x8',
        'startMessage': 'Klicke auf die Karten, um passende Paare zu finden',
        'matched': 'Ausgezeichnet! Paar gefunden! 🎉',
        'won': 'Unglaublich! Du hast gewonnen! 🏆',
        'newGame': 'Neues Spiel',
        'resetStats': 'Statistiken Zurücksetzen',
        'confirmReset': 'Bist du sicher, dass du deinen besten Score zurücksetzen möchtest?'
    },
    'ru': {
        'title': 'Память',
        'lead': 'Проверьте свою память, найдя пары одинаковых карт',
        'level': '3 уровня сложности',
        'back': 'Вернуться к Играм',
        'gameTitle': 'Память',
        'gameSubtitle': 'Найдите парные карты',
        'pairs': 'Найдено Пар',
        'moves': 'Ходы',
        'bestMoves': 'Лучше',
        'difficulty': 'Сложность',
        'easy': 'Легко 4x4',
        'medium': 'Средний 4x6',
        'hard': 'Сложно 4x8',
        'startMessage': 'Нажимайте на карты, чтобы найти парные',
        'matched': 'Отлично! Пара найдена! 🎉',
        'won': 'Невероятно! Вы победили! 🏆',
        'newGame': 'Новая Игра',
        'resetStats': 'Сброс Статистики',
        'confirmReset': 'Вы уверены, что хотите сбросить ваш лучший результат?'
    },
    'ja': {
        'title': 'メモリー',
        'lead': '一致するカードのペアを見つけて、記憶力をテストしてください',
        'level': '3つの難易度レベル',
        'back': 'ゲームに戻る',
        'gameTitle': 'メモリー',
        'gameSubtitle': '一致するペアを探す',
        'pairs': '見つけたペア',
        'moves': 'ムーブ',
        'bestMoves': 'ベスト',
        'difficulty': '難易度',
        'easy': 'イージー 4x4',
        'medium': 'ノーマル 4x6',
        'hard': 'ハード 4x8',
        'startMessage': 'カードをクリックして一致するペアを見つけてください',
        'matched': 'すばらしい！ペアが見つかりました！🎉',
        'won': '信じられない！あなたが勝ちました！🏆',
        'newGame': '新しいゲーム',
        'resetStats': '統計をリセット',
        'confirmReset': '最高スコアをリセットしてもよろしいですか？'
    },
    'zh': {
        'title': '记忆',
        'lead': '通过找到相匹配的卡牌对来测试您的记忆力',
        'level': '3个难度等级',
        'back': '回到游戏',
        'gameTitle': '记忆',
        'gameSubtitle': '找到相匹配的对',
        'pairs': '找到的对数',
        'moves': '步数',
        'bestMoves': '最好',
        'difficulty': '难度',
        'easy': '简单 4x4',
        'medium': '中等 4x6',
        'hard': '困难 4x8',
        'startMessage': '点击卡牌找到相匹配的对',
        'matched': '太好了！找到对了！🎉',
        'won': '不可思议！你赢了！🏆',
        'newGame': '新游戏',
        'resetStats': '重置统计',
        'confirmReset': '您确定要重置最高分吗？'
    }
}

# Update each i18n file
for lang in languages:
    filepath = f'i18n/{lang}.json'
    
    try:
        # Read existing file
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Ensure games section exists
        if 'games' not in data:
            data['games'] = {}
        
        # Add memory translations
        data['games']['memory'] = memory_translations[lang]
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f'✓ {lang}.json aggiornato con Memory')
    
    except Exception as e:
        print(f'✗ Errore aggiornamento {lang}.json: {e}')

print('\n✓ Tutte le traduzioni Memory aggiunte!')

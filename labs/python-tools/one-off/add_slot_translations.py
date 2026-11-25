#!/usr/bin/env python3
import json

languages = {
    'en': {
        'title': 'Slot Machine',
        'lead': 'Spin to win and test your luck.',
        'level': 'Luck-based fun',
        'back': 'Back to Games',
        'gameTitle': 'Slot Machine',
        'gameSubtitle': 'Spin to win big!',
        'balance': 'Balance',
        'bet': 'Bet',
        'wins': 'Wins',
        'startMessage': 'Place your bet and spin!',
        'selectBet': 'Select Bet Amount',
        'spin': 'SPIN!',
        'newGame': 'New Game',
        'reset': 'Reset Balance',
        'three': '🍎🍎🍎',
        'two': '🍎🍎 🍌',
        'all': 'All 🍌',
        'jackpot': '🌟🌟🌟',
        'jackpotPayout': '100x Bet!',
        'lose': 'No match! Better luck next time.',
        'threeWin': 'Three apples! 10x payout! 🎉',
        'bananasWin': 'All bananas! 5x payout! 🍌',
        'twoWin': 'Two match! 3x payout! 🎊',
        'jackpotWin': 'JACKPOT! 100x payout! 🏆🌟',
        'confirmReset': 'Are you sure you want to reset your balance to $1000?'
    },
    'it': {
        'title': 'Slot Machine',
        'lead': 'Gira i rulli per vincere e metti alla prova la tua fortuna.',
        'level': 'Divertimento basato sulla fortuna',
        'back': 'Torna ai Giochi',
        'gameTitle': 'Slot Machine',
        'gameSubtitle': 'Gira per vincere in grande!',
        'balance': 'Saldo',
        'bet': 'Scommessa',
        'wins': 'Vittorie',
        'startMessage': 'Piazza la tua scommessa e gira!',
        'selectBet': 'Seleziona Importo Scommessa',
        'spin': 'GIRA!',
        'newGame': 'Nuova Partita',
        'reset': 'Ripristina Saldo',
        'three': '🍎🍎🍎',
        'two': '🍎🍎 🍌',
        'all': 'Tutti 🍌',
        'jackpot': '🌟🌟🌟',
        'jackpotPayout': '100x Scommessa!',
        'lose': 'Nessuna corrispondenza! Buona fortuna la prossima volta.',
        'threeWin': 'Tre mele! Vincita 10x! 🎉',
        'bananasWin': 'Tutte banane! Vincita 5x! 🍌',
        'twoWin': 'Due corrispondenti! Vincita 3x! 🎊',
        'jackpotWin': 'JACKPOT! Vincita 100x! 🏆🌟',
        'confirmReset': 'Sei sicuro di voler ripristinare il saldo a $1000?'
    },
    'es': {
        'title': 'Máquina Tragaperras',
        'lead': 'Gira y prueba tu suerte.',
        'level': 'Diversión basada en la suerte',
        'back': 'Volver a Juegos',
        'gameTitle': 'Máquina Tragaperras',
        'gameSubtitle': '¡Gira para ganar en grande!',
        'balance': 'Saldo',
        'bet': 'Apuesta',
        'wins': 'Victorias',
        'startMessage': '¡Coloca tu apuesta y gira!',
        'selectBet': 'Seleccionar Monto de Apuesta',
        'spin': '¡GIRA!',
        'newGame': 'Nuevo Juego',
        'reset': 'Reiniciar Saldo',
        'three': '🍎🍎🍎',
        'two': '🍎🍎 🍌',
        'all': 'Todos 🍌',
        'jackpot': '🌟🌟🌟',
        'jackpotPayout': '¡100x Apuesta!',
        'lose': '¡Sin coincidencias! Mejor suerte la próxima vez.',
        'threeWin': '¡Tres manzanas! ¡Pago 10x! 🎉',
        'bananasWin': '¡Todos plátanos! ¡Pago 5x! 🍌',
        'twoWin': '¡Dos coinciden! ¡Pago 3x! 🎊',
        'jackpotWin': '¡JACKPOT! ¡Pago 100x! 🏆🌟',
        'confirmReset': '¿Estás seguro de que deseas reiniciar tu saldo a $1000?'
    },
    'fr': {
        'title': 'Machine à Sous',
        'lead': 'Tournez et testez votre chance.',
        'level': 'Plaisir basé sur la chance',
        'back': 'Retour aux Jeux',
        'gameTitle': 'Machine à Sous',
        'gameSubtitle': 'Tournez pour gagner gros!',
        'balance': 'Solde',
        'bet': 'Mise',
        'wins': 'Victoires',
        'startMessage': 'Placez votre mise et tournez!',
        'selectBet': 'Sélectionner le Montant de la Mise',
        'spin': 'TOURNEZ!',
        'newGame': 'Nouveau Jeu',
        'reset': 'Réinitialiser le Solde',
        'three': '🍎🍎🍎',
        'two': '🍎🍎 🍌',
        'all': 'Tous 🍌',
        'jackpot': '🌟🌟🌟',
        'jackpotPayout': '100x Mise!',
        'lose': 'Pas de correspondance! Meilleure chance la prochaine fois.',
        'threeWin': 'Trois pommes! Gains 10x! 🎉',
        'bananasWin': 'Tous bananes! Gains 5x! 🍌',
        'twoWin': 'Deux correspondent! Gains 3x! 🎊',
        'jackpotWin': 'JACKPOT! Gains 100x! 🏆🌟',
        'confirmReset': 'Êtes-vous sûr de vouloir réinitialiser votre solde à $1000?'
    },
    'de': {
        'title': 'Spielautomat',
        'lead': 'Drehen und Glück versuchen.',
        'level': 'Glücksbasierter Spaß',
        'back': 'Zurück zu Spiele',
        'gameTitle': 'Spielautomat',
        'gameSubtitle': 'Drehen zum Großgewinn!',
        'balance': 'Guthaben',
        'bet': 'Einsatz',
        'wins': 'Gewinne',
        'startMessage': 'Setzen Sie Ihren Einsatz und drehen Sie!',
        'selectBet': 'Einsatzbetrag Wählen',
        'spin': 'DREHEN!',
        'newGame': 'Neues Spiel',
        'reset': 'Guthaben Zurücksetzen',
        'three': '🍎🍎🍎',
        'two': '🍎🍎 🍌',
        'all': 'Alle 🍌',
        'jackpot': '🌟🌟🌟',
        'jackpotPayout': '100x Einsatz!',
        'lose': 'Keine Übereinstimmung! Viel Glück nächstes Mal.',
        'threeWin': 'Drei Äpfel! 10x Auszahlung! 🎉',
        'bananasWin': 'Alle Bananen! 5x Auszahlung! 🍌',
        'twoWin': 'Zwei passen! 3x Auszahlung! 🎊',
        'jackpotWin': 'JACKPOT! 100x Auszahlung! 🏆🌟',
        'confirmReset': 'Sind Sie sicher, dass Sie Ihr Guthaben auf $1000 zurücksetzen möchten?'
    },
    'ru': {
        'title': 'Игровой автомат',
        'lead': 'Крутите и испытывайте свою удачу.',
        'level': 'Игра на удачу',
        'back': 'Вернуться к Играм',
        'gameTitle': 'Игровой автомат',
        'gameSubtitle': 'Крутите, чтобы выиграть!',
        'balance': 'Баланс',
        'bet': 'Ставка',
        'wins': 'Победы',
        'startMessage': 'Разместите ставку и вращайте!',
        'selectBet': 'Выберите Размер Ставки',
        'spin': 'ВРАЩАЙТЕ!',
        'newGame': 'Новая Игра',
        'reset': 'Сброс Баланса',
        'three': '🍎🍎🍎',
        'two': '🍎🍎 🍌',
        'all': 'Все 🍌',
        'jackpot': '🌟🌟🌟',
        'jackpotPayout': '100x Ставка!',
        'lose': 'Совпадений нет! Удачи в следующий раз.',
        'threeWin': 'Три яблока! Выплата 10x! 🎉',
        'bananasWin': 'Все бананы! Выплата 5x! 🍌',
        'twoWin': 'Два совпадают! Выплата 3x! 🎊',
        'jackpotWin': 'ДЖЕКПОТ! Выплата 100x! 🏆🌟',
        'confirmReset': 'Вы уверены, что хотите сбросить баланс на $1000?'
    },
    'ja': {
        'title': 'スロットマシン',
        'lead': 'スピンして運を試してください。',
        'level': '運に基づくゲーム',
        'back': 'ゲームに戻る',
        'gameTitle': 'スロットマシン',
        'gameSubtitle': '大勝ちを目指してスピン!',
        'balance': '残高',
        'bet': '賭け',
        'wins': '勝利',
        'startMessage': '賭けを置いてスピン!',
        'selectBet': '賭け金を選択',
        'spin': 'スピン!',
        'newGame': '新しいゲーム',
        'reset': '残高をリセット',
        'three': '🍎🍎🍎',
        'two': '🍎🍎 🍌',
        'all': 'すべて 🍌',
        'jackpot': '🌟🌟🌟',
        'jackpotPayout': '100倍賭け!',
        'lose': 'マッチしません!次回は幸運を祈ります。',
        'threeWin': '3つのリンゴ!10倍の配当! 🎉',
        'bananasWin': 'すべてバナナ!5倍の配当! 🍌',
        'twoWin': '2つが一致!3倍の配当! 🎊',
        'jackpotWin': 'ジャックポット!100倍の配当! 🏆🌟',
        'confirmReset': '残高を$1000にリセットしてもよろしいですか?'
    },
    'zh': {
        'title': '老虎机',
        'lead': '旋转并测试您的运气。',
        'level': '基于运气的乐趣',
        'back': '回到游戏',
        'gameTitle': '老虎机',
        'gameSubtitle': '旋转赢大奖!',
        'balance': '余额',
        'bet': '赌注',
        'wins': '胜利',
        'startMessage': '下注并旋转!',
        'selectBet': '选择赌注金额',
        'spin': '旋转!',
        'newGame': '新游戏',
        'reset': '重置余额',
        'three': '🍎🍎🍎',
        'two': '🍎🍎 🍌',
        'all': '全部 🍌',
        'jackpot': '🌟🌟🌟',
        'jackpotPayout': '100倍赌注!',
        'lose': '没有匹配!下次祝你好运。',
        'threeWin': '三个苹果!10倍赔付! 🎉',
        'bananasWin': '全部香蕉!5倍赔付! 🍌',
        'twoWin': '两个匹配!3倍赔付! 🎊',
        'jackpotWin': '大奖!100倍赔付! 🏆🌟',
        'confirmReset': '确定要将余额重置为$1000吗?'
    }
}

# List of all i18n files
i18n_files = ['en', 'it', 'es', 'fr', 'de', 'ru', 'ja', 'zh', 'sv', 'ar', 'he']

for lang in i18n_files:
    filepath = f'i18n/{lang}.json'
    
    try:
        # Read existing file
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Ensure games.slot section exists
        if 'games' not in data:
            data['games'] = {}
        
        # Add slot translations if they exist for this language
        if lang in languages:
            data['games']['slot'] = languages[lang]
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f'✓ {lang}.json updated with Slot translations')
    
    except json.JSONDecodeError as e:
        print(f'⚠ {lang}.json has JSON errors (pre-existing): {e}')
    except Exception as e:
        print(f'✗ Error updating {lang}.json: {e}')

print('\n✓ Slot Machine translations added!')

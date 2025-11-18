#!/usr/bin/env python3
import json

languages = {
    'en': {
        'title': 'Geometry Dash',
        'lead': 'Fast-paced geometry platformer game.',
        'level': 'Challenging',
        'back': 'Back to Games',
        'gameTitle': 'Geometry Dash',
        'gameSubtitle': 'Jump through obstacles and reach the end!',
        'score': 'Score',
        'best': 'Best Score',
        'deaths': 'Deaths',
        'startMessage': 'Click or press SPACE/UP ARROW to jump!',
        'difficulty': 'Difficulty',
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard',
        'controls': 'Controls:',
        'clickControl': 'Click or press SPACE / ⬆️ to jump',
        'touchControl': 'Tap screen on mobile',
        'play': 'Play',
        'restart': 'Restart',
        'resetStats': 'Reset Stats',
        'playing': 'Game in progress! Jump over obstacles!',
        'gameOver': 'Game Over! Click Play to try again.',
        'confirmReset': 'Are you sure you want to reset your stats?'
    },
    'it': {
        'title': 'Geometry Dash',
        'lead': 'Gioco platformer geometrico veloce.',
        'level': 'Impegnativo',
        'back': 'Torna ai Giochi',
        'gameTitle': 'Geometry Dash',
        'gameSubtitle': 'Salta gli ostacoli e raggiungi la fine!',
        'score': 'Punteggio',
        'best': 'Miglior Punteggio',
        'deaths': 'Morti',
        'startMessage': 'Clicca o premi SPAZIO/FRECCIA SU per saltare!',
        'difficulty': 'Difficoltà',
        'easy': 'Facile',
        'medium': 'Medio',
        'hard': 'Difficile',
        'controls': 'Comandi:',
        'clickControl': 'Clicca o premi SPAZIO / ⬆️ per saltare',
        'touchControl': 'Tocca lo schermo su mobile',
        'play': 'Gioca',
        'restart': 'Riprova',
        'resetStats': 'Azzera Statistiche',
        'playing': 'Partita in corso! Salta gli ostacoli!',
        'gameOver': 'Game Over! Clicca Gioca per riprovare.',
        'confirmReset': 'Sei sicuro di voler azzerare le tue statistiche?'
    },
    'es': {
        'title': 'Geometry Dash',
        'lead': 'Juego plataformador de geometría rápido.',
        'level': 'Desafiante',
        'back': 'Volver a Juegos',
        'gameTitle': 'Geometry Dash',
        'gameSubtitle': '¡Salta sobre obstáculos y llega al final!',
        'score': 'Puntuación',
        'best': 'Mejor Puntuación',
        'deaths': 'Muertes',
        'startMessage': '¡Haz clic o presiona ESPACIO/FLECHA ARRIBA para saltar!',
        'difficulty': 'Dificultad',
        'easy': 'Fácil',
        'medium': 'Medio',
        'hard': 'Difícil',
        'controls': 'Controles:',
        'clickControl': 'Haz clic o presiona ESPACIO / ⬆️ para saltar',
        'touchControl': 'Toca la pantalla en móvil',
        'play': 'Jugar',
        'restart': 'Reintentar',
        'resetStats': 'Reiniciar Estadísticas',
        'playing': '¡Juego en progreso! ¡Salta sobre obstáculos!',
        'gameOver': '¡Fin del juego! Haz clic en Jugar para reintentar.',
        'confirmReset': '¿Estás seguro de que deseas reiniciar tus estadísticas?'
    },
    'fr': {
        'title': 'Geometry Dash',
        'lead': 'Jeu de plateforme géométrique rapide.',
        'level': 'Défi',
        'back': 'Retour aux Jeux',
        'gameTitle': 'Geometry Dash',
        'gameSubtitle': 'Sauter par-dessus les obstacles et atteindre la fin!',
        'score': 'Score',
        'best': 'Meilleur Score',
        'deaths': 'Décès',
        'startMessage': 'Cliquez ou appuyez sur ESPACE/FLÈCHE HAUT pour sauter!',
        'difficulty': 'Difficulté',
        'easy': 'Facile',
        'medium': 'Moyen',
        'hard': 'Difficile',
        'controls': 'Contrôles:',
        'clickControl': 'Cliquez ou appuyez sur ESPACE / ⬆️ pour sauter',
        'touchControl': 'Appuyez sur l\'écran sur mobile',
        'play': 'Jouer',
        'restart': 'Recommencer',
        'resetStats': 'Réinitialiser les Statistiques',
        'playing': 'Jeu en cours! Sauter par-dessus les obstacles!',
        'gameOver': 'Fin du jeu! Cliquez sur Jouer pour réessayer.',
        'confirmReset': 'Êtes-vous sûr de vouloir réinitialiser vos statistiques?'
    },
    'de': {
        'title': 'Geometry Dash',
        'lead': 'Schnelles geometrisches Plattformspiel.',
        'level': 'Herausfordernd',
        'back': 'Zurück zu Spiele',
        'gameTitle': 'Geometry Dash',
        'gameSubtitle': 'Springe über Hindernisse und erreiche das Ende!',
        'score': 'Punktzahl',
        'best': 'Beste Punktzahl',
        'deaths': 'Todesfälle',
        'startMessage': 'Klicken oder LEERZEICHEN/NACH-OBEN drücken zum Springen!',
        'difficulty': 'Schwierigkeit',
        'easy': 'Einfach',
        'medium': 'Mittel',
        'hard': 'Schwer',
        'controls': 'Steuerung:',
        'clickControl': 'Klicken oder LEERZEICHEN / ⬆️ drücken zum Springen',
        'touchControl': 'Tippen Sie auf dem Mobilgerät auf den Bildschirm',
        'play': 'Spielen',
        'restart': 'Erneut Versuchen',
        'resetStats': 'Statistiken Zurücksetzen',
        'playing': 'Spiel läuft! Springe über Hindernisse!',
        'gameOver': 'Spielende! Klicken Sie auf Spielen, um es erneut zu versuchen.',
        'confirmReset': 'Sind Sie sicher, dass Sie Ihre Statistiken zurücksetzen möchten?'
    },
    'ru': {
        'title': 'Geometry Dash',
        'lead': 'Быстрая геометрическая платформера.',
        'level': 'Сложный',
        'back': 'Вернуться к Играм',
        'gameTitle': 'Geometry Dash',
        'gameSubtitle': 'Прыгайте через препятствия и достигните конца!',
        'score': 'Счет',
        'best': 'Лучший Счет',
        'deaths': 'Смерти',
        'startMessage': 'Нажмите или нажмите ПРОБЕЛ/СТРЕЛКА ВВЕРХ для прыжка!',
        'difficulty': 'Сложность',
        'easy': 'Легко',
        'medium': 'Средний',
        'hard': 'Сложно',
        'controls': 'Управление:',
        'clickControl': 'Нажмите или нажмите ПРОБЕЛ / ⬆️ для прыжка',
        'touchControl': 'Коснитесь экрана на мобильном',
        'play': 'Играть',
        'restart': 'Переиграть',
        'resetStats': 'Сброс Статистики',
        'playing': 'Игра в процессе! Прыгайте через препятствия!',
        'gameOver': 'Конец игры! Нажмите Играть, чтобы попробовать снова.',
        'confirmReset': 'Вы уверены, что хотите сбросить вашу статистику?'
    },
    'ja': {
        'title': 'ジオメトリーダッシュ',
        'lead': '高速ジオメトリアクションプラットフォーマー。',
        'level': 'チャレンジング',
        'back': 'ゲームに戻る',
        'gameTitle': 'ジオメトリーダッシュ',
        'gameSubtitle': '障害物を飛び越えて終わりに到達!',
        'score': 'スコア',
        'best': 'ベストスコア',
        'deaths': 'デス数',
        'startMessage': 'クリックまたはSPACE/⬆️を押してジャンプ!',
        'difficulty': '難易度',
        'easy': 'イージー',
        'medium': 'ノーマル',
        'hard': 'ハード',
        'controls': 'コントロール:',
        'clickControl': 'クリックまたはSPACE / ⬆️を押してジャンプ',
        'touchControl': 'モバイルで画面をタップ',
        'play': 'プレイ',
        'restart': 'リトライ',
        'resetStats': '統計をリセット',
        'playing': 'ゲーム中!障害物を飛び越えて!',
        'gameOver': 'ゲームオーバー!プレイをクリックして再度試してください。',
        'confirmReset': '統計をリセットしてもよろしいですか?'
    },
    'zh': {
        'title': '几何冲刺',
        'lead': '快速的几何平台游戏。',
        'level': '具有挑战性',
        'back': '回到游戏',
        'gameTitle': '几何冲刺',
        'gameSubtitle': '跳过障碍物到达终点!',
        'score': '分数',
        'best': '最高分',
        'deaths': '死亡次数',
        'startMessage': '点击或按SPACE/⬆️跳跃!',
        'difficulty': '难度',
        'easy': '简单',
        'medium': '中等',
        'hard': '困难',
        'controls': '控制:',
        'clickControl': '点击或按SPACE / ⬆️跳跃',
        'touchControl': '在移动设备上点按屏幕',
        'play': '播放',
        'restart': '重试',
        'resetStats': '重置统计',
        'playing': '游戏进行中!跳过障碍物!',
        'gameOver': '游戏结束!单击播放重试。',
        'confirmReset': '确定要重置统计吗?'
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
        
        # Ensure games section exists
        if 'games' not in data:
            data['games'] = {}
        
        # Add geom_dash translations if they exist for this language
        if lang in languages:
            data['games']['geom_dash'] = languages[lang]
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f'✓ {lang}.json updated with Geometry Dash translations')
    
    except json.JSONDecodeError as e:
        print(f'⚠ {lang}.json has JSON errors (pre-existing)')
    except Exception as e:
        print(f'✗ Error updating {lang}.json: {e}')

print('\n✓ Geometry Dash translations added!')

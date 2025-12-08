#!/usr/bin/env python3
import json
import os

languages = {
    'en': {
        'games': {
            'blackjack': {
                'title': 'Blackjack',
                'lead': 'Beat the dealer to 21. Hit or Stand!',
                'level': 'Casino Classic'
            }
        }
    },
    'it': {
        'games': {
            'blackjack': {
                'title': 'Blackjack',
                'lead': 'Batti il banco facendo 21. Carta o Stai!',
                'level': 'Classico da Casinò'
            }
        }
    }
}

def update_translations():
    base_path = 'i18n'
    
    for lang, new_data in languages.items():
        file_path = os.path.join(base_path, f'{lang}.json')
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                current_data = json.load(f)
        except FileNotFoundError:
            print(f"Warning: {file_path} not found. Skipping.")
            continue
            
        # Merge data
        if 'games' not in current_data:
            current_data['games'] = {}
            
        current_data['games']['blackjack'] = new_data['games']['blackjack']
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(current_data, f, indent=4, ensure_ascii=False)
            print(f"Updated {lang}.json")

if __name__ == "__main__":
    update_translations()

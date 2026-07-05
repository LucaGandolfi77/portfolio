from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

games_section = soup.find('div', id='games')
if games_section:
    buttons = games_section.find_all(class_='show-more-btn')
    print(f"Found {len(buttons)} show-more-btn in #games")
    for i, btn in enumerate(buttons):
        print(f"Button {i+1}: {btn}")
else:
    print("#games section not found")

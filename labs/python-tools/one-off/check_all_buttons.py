from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

buttons = soup.find_all(class_='show-more-btn')
print(f"Total buttons found: {len(buttons)}")

for i, btn in enumerate(buttons):
    parent = btn.find_parent('div', class_='section')
    parent_id = parent.get('id') if parent else "No parent section"
    print(f"Button {i+1} is in section: {parent_id}")

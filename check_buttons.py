from bs4 import BeautifulSoup

with open('index.html', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

projects_section = soup.find('div', id='projects')
if projects_section:
    buttons = projects_section.find_all(class_='show-more-btn')
    print(f"Found {len(buttons)} show-more-btn in #projects")
    for i, btn in enumerate(buttons):
        print(f"Button {i+1}: {btn}")
else:
    print("#projects section not found")

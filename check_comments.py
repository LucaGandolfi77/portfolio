from bs4 import BeautifulSoup, Comment

with open('index.html', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
comments = soup.find_all(string=lambda text: isinstance(text, Comment))

found = False
for c in comments:
    if "show-more-btn" in c:
        print(f"Found commented button: {c}")
        found = True

if not found:
    print("No commented out show-more-btn found.")

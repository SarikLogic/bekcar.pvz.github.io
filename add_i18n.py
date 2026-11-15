import re
import json

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We will use BeautifulSoup to carefully add data-i18n tags.
# But since this environment might not have bs4 installed, we can just use simple regex or provide a manual dictionary script that saves original text in `data-original` attribute on load.

# Wait, saving original text in a data-original attribute via JS on DOMContentLoaded is brilliant!
# No need to modify the HTML manually!

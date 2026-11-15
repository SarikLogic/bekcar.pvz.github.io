import re
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = set()
        self.in_script_or_style = False

    def handle_starttag(self, tag, attrs):
        if tag in ['script', 'style']:
            self.in_script_or_style = True
        
        # also capture placeholders
        if tag in ['input', 'textarea']:
            for name, value in attrs:
                if name == 'placeholder' and value.strip():
                    self.texts.add(value.strip())

    def handle_endtag(self, tag):
        if tag in ['script', 'style']:
            self.in_script_or_style = False

    def handle_data(self, data):
        if not self.in_script_or_style:
            text = data.strip()
            if text and not text.isdigit() and len(text) > 1 and not re.match(r'^[\W_]+$', text):
                # avoid pure symbols or just a number
                self.texts.add(text)

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

parser = TextExtractor()
parser.feed(content)

# To JSON
import json
print(json.dumps(list(parser.texts), ensure_ascii=False, indent=2))

import os

replacements = {
    'Ã©': 'é',
    'Ã ': 'à',
    'Ãª': 'ê',
    'Ã«': 'ë',
    'Ã®': 'î',
    'Ã¯': 'ï',
    'Ã´': 'ô',
    'Ã»': 'û',
    'Ã¹': 'ù',
    'Ã§': 'ç',
    'â‚¬': '€',
    'âœ¨': '✨',
    'ðŸ“¦': '📦',
    'Ã‰': 'É',
    'Ã€': 'À',
    'Ã¨': 'è',
    'â€¢': '•',
    'mÂ²': 'm²',
    'Ã¢': 'â'
}

files = ['app.js', 'index.html']

for filename in files:
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filename}")
    else:
        print(f"File {filename} not found")

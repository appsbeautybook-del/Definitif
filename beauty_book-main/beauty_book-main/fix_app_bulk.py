import re

def fix_app_js():
    with open(r'c:\Users\G15\.gemini\antigravity\scratch\beautybook\app.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix malformed HTML tags
    content = content.replace('< div', '<div')
    content = content.replace('</ div >', '</div>')
    content = content.replace('< !--', '<!--')
    content = content.replace('-- >', '-->')
    content = content.replace('< img', '<img')
    content = content.replace('< button', '<button')
    content = content.replace('</ button >', '</button>')
    
    # Fix extra spaces in IDs within template literals
    # Example: getElementById(`cat - ${ categoryId } `)
    content = content.replace('cat - ${ categoryId } ', 'cat-${categoryId}')
    
    # Fix French characters and common encoding issues
    replacements = {
        'â‚¬': '€',
        'Ã¨': 'è',
        'Ã ': 'à',
        'âœ¨': '✨',
        'PiÃ¨ces': 'Pièces',
        'FidÃ¨le': 'Fidèle',
        'SuccÃ¨s': 'Succès',
        '3Ã¨me': '3ème',
        '24â€“26': '24–26',
        'cÅ“ur': 'cœur',
        'â€“': '–',
        'â€”': '—',
        'Ã©': 'é',
        'Ãª': 'ê',
        'Ã¹': 'ù',
        'Ã®': 'î',
        'Ã¯': 'ï',
        'Ã´': 'ô',
        'Ã»': 'û',
        'Ã§': 'ç',
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)

    # Some missed tags with extra space at end
    content = content.replace('</ div>', '</div>') # In case it was </ div>
    content = content.replace('</ button>', '</button>')

    with open(r'c:\Users\G15\.gemini\antigravity\scratch\beautybook\app.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("app.js fixed successfully!")

if __name__ == "__main__":
    fix_app_js()

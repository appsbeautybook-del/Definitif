
import re

file_path = r'c:\Users\G15\Documents\BeautyBook\app.js'
# But I am in scratch directory. Let's use the absolute path.
file_path = r'c:\Users\G15\.gemini\antigravity\scratch\beautybook\app.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix encoding
replacements = {
    'â‚¬': '€',
    'Ã¨': 'è',
    'Ã ': 'à',
    'â€“': '–',
    'âœ¨': '✨',
    'Ã©': 'é',
    'Ã«': 'ë',
    'Ã¹': 'ù',
    'Ã´': 'ô',
    'Ã®': 'î',
    'Ã»': 'û',
    'Ã¢': 'â',
    'Ãª': 'ê',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Targeted cleanup of duplicates
# We have a duplicate SCREENS.notifications and SCREENS.localisation and switchServicesTab etc.
# I will just keep the file as is for now but fix the encoding. 
# Removing duplicates manually via replace_file_content is safer than regex.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Encoding fixed.")
